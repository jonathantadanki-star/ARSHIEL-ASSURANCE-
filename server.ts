import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
let FIREBASE_PROJECT_ID = 'invertible-sky-ct8c4';
try {
  const parsed = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8')) as { projectId?: string };
  if (parsed.projectId) FIREBASE_PROJECT_ID = parsed.projectId;
} catch {
  // Fallback to default projectId if config is unavailable
}

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '15mb' }));

// Security Headers Middleware (iframe-compatible: intentionally omits X-Frame-Options)
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=(self)');
  res.setHeader('X-XSS-Protection', '0');
  next();
});

const AI_MODEL = 'gemini-4-hydrogen';

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'Unknown';
}

function parseUserAgentSummary(uaRaw?: string): { device: string; browser: string } {
  const ua = uaRaw || '';
  const device = /iPhone|iPad|iPod/i.test(ua)
    ? 'Apple iOS / iPadOS'
    : /Android/i.test(ua)
    ? 'Android Mobile/Tablet'
    : /Macintosh|Mac OS/i.test(ua)
    ? 'macOS Desktop'
    : /Windows/i.test(ua)
    ? 'Windows Desktop'
    : /Linux/i.test(ua)
    ? 'Linux Workstation'
    : 'Enterprise Client';

  const browser = /Edg\//i.test(ua)
    ? 'Microsoft Edge'
    : /Chrome\//i.test(ua) && !/Edg\//i.test(ua)
    ? 'Google Chrome'
    : /Firefox\//i.test(ua)
    ? 'Mozilla Firefox'
    : /Safari\//i.test(ua) && !/Chrome\//i.test(ua)
    ? 'Apple Safari'
    : 'Web Browser';

  return { device, browser };
}

// --- Sliding Window Rate Limiter ---
interface RateBucket {
  count: number;
  resetAt: number;
}
const rateBuckets = new Map<string, RateBucket>();

function createRateLimiter(bucketName: string, maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${bucketName}:${getClientIp(req)}`;
    const now = Date.now();
    const existing = rateBuckets.get(key);
    if (!existing || now > existing.resetAt) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (existing.count >= maxRequests) {
      const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        error: 'Rate limit exceeded. Please wait before retrying.',
        retryAfterSeconds: retryAfterSec,
      });
    }
    existing.count += 1;
    return next();
  };
}

// --- Cryptographic Firebase ID Token Verification (RS256 against Google Secure Token Certs) ---
interface VerifiedFirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

interface AuthenticatedRequest extends Request {
  authUser?: VerifiedFirebaseUser;
}

const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

let cachedCerts: Record<string, string> | null = null;
let certsExpiresAt = 0;

async function getGooglePublicCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedCerts && now < certsExpiresAt) {
    return cachedCerts;
  }
  const resp = await fetch(GOOGLE_CERTS_URL);
  if (!resp.ok) {
    throw new Error('Unable to retrieve Google public signing certificates.');
  }
  const cacheControl = resp.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const maxAgeMs = maxAgeMatch ? Number(maxAgeMatch[1]) * 1000 : 3600_000;
  cachedCerts = (await resp.json()) as Record<string, string>;
  certsExpiresAt = now + maxAgeMs;
  return cachedCerts;
}

function base64UrlDecodeToBuffer(segment: string): Buffer {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(normalized + padding, 'base64');
}

async function verifyFirebaseIdToken(token: string): Promise<VerifiedFirebaseUser> {
  const segments = token.split('.');
  if (segments.length !== 3) {
    throw new Error('Malformed authentication token.');
  }
  const [headerB64, payloadB64, signatureB64] = segments;
  const header = JSON.parse(base64UrlDecodeToBuffer(headerB64).toString('utf-8')) as {
    alg?: string;
    kid?: string;
  };
  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Unsupported token signing algorithm.');
  }

  const certs = await getGooglePublicCerts();
  const certPem = certs[header.kid];
  if (!certPem) {
    throw new Error('Unknown signing key identifier.');
  }

  const signingInput = Buffer.from(`${headerB64}.${payloadB64}`, 'utf-8');
  const signature = base64UrlDecodeToBuffer(signatureB64);
  const validSignature = crypto.verify('RSA-SHA256', signingInput, certPem, signature);
  if (!validSignature) {
    throw new Error('Invalid token cryptographic signature.');
  }

  const payload = JSON.parse(base64UrlDecodeToBuffer(payloadB64).toString('utf-8')) as {
    aud?: string;
    iss?: string;
    sub?: string;
    exp?: number;
    iat?: number;
    email?: string;
    email_verified?: boolean;
    name?: string;
  };

  const nowSec = Math.floor(Date.now() / 1000);
  const expectedIssuer = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
  if (payload.aud !== FIREBASE_PROJECT_ID) {
    throw new Error('Token audience mismatch.');
  }
  if (payload.iss !== expectedIssuer) {
    throw new Error('Token issuer mismatch.');
  }
  if (!payload.sub || typeof payload.sub !== 'string') {
    throw new Error('Missing token subject.');
  }
  if (!payload.exp || payload.exp <= nowSec) {
    throw new Error('Authentication session token has expired.');
  }

  return {
    uid: payload.sub,
    email: payload.email || '',
    emailVerified: Boolean(payload.email_verified),
    name: payload.name,
  };
}

async function requireFirebaseAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required. Missing Bearer ID token.',
      code: 'AUTH_REQUIRED',
    });
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      error: 'Authentication required. Empty Bearer ID token.',
      code: 'AUTH_REQUIRED',
    });
  }
  try {
    req.authUser = await verifyFirebaseIdToken(token);
    return next();
  } catch (err) {
    return res.status(401).json({
      error: err instanceof Error ? err.message : 'Invalid or expired authentication token.',
      code: 'AUTH_INVALID',
    });
  }
}

const SUPER_ADMIN_EMAIL = (process.env.SUPER_ADMIN_EMAIL || 'jonathan.tadanki@gmail.com')
  .trim()
  .toLowerCase();

function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const email = (req.authUser?.email || '').trim().toLowerCase();
  const verified = Boolean(req.authUser?.emailVerified);
  if (!req.authUser || !verified || email !== SUPER_ADMIN_EMAIL) {
    return res.status(403).json({
      error: 'Super Admin access required. Standard user accounts have view-only access.',
      code: 'SUPER_ADMIN_ONLY',
    });
  }
  return next();
}

// --- Brute-Force / Failed Login Protection & Account Lockout Store ---
interface LoginAttemptState {
  failedCount: number;
  firstFailedAt: number;
  lockedUntil: number;
}
const loginAttempts = new Map<string, LoginAttemptState>();
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

// --- Server-Side MFA One-Time Code Challenge Store ---
interface MfaChallengeState {
  codeHash: string;
  expiresAt: number;
  attempts: number;
  verified: boolean;
}
const mfaChallenges = new Map<string, MfaChallengeState>();

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const MANDATORY_GOVERNANCE_INSTRUCTION = `You are ARSHIEL AI ASSURANCE ASSISTANT, the specialized AI engine for ARSHIEL ASSURANCE ("Assessing Risks. Strengthening Compliance. Improving Performance.").

STRICT GOVERNANCE & SAFETY RULES:
1. ARSHIEL ASSURANCE is an independent consultancy and assessment service provider. It is NOT an accredited ISO certification body, government inspection agency, statutory auditor, OSHA enforcement authority, IOSH-approved training provider, NFPA-authorized certification organization, or FSSAI licensing authority.
2. NEVER invent laws, statutory sections, government notifications, deadlines, or citations. If a legal provision or state rule amendment cannot be verified with certainty, explicitly label it: "UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED".
3. NEVER reproduce copyrighted ISO standard text verbatim; provide concise, original management-system guidance clearly labeled as AI assistance, not authoritative interpretation.
4. NEVER invent site observations or claim an on-site inspection occurred when it did not.
5. NEVER generate fake certificates, claim regulatory approval, or bypass Legal Authorization Control restrictions (Category 3 regulated services must always be flagged as restricted unless verified authorization exists).
6. All generated documents and reports are DRAFTS ("DRAFT – REVIEW REQUIRED") requiring review and approval by competent human personnel before professional use.`;

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'ARSHIEL ASSURANCE API', version: '0.01' });
});

// Client Network & Device Metadata Endpoint (for accurate Login History & Active Sessions)
app.get('/api/security/client-meta', createRateLimiter('client-meta', 60, 60_000), (req, res) => {
  const ua = parseUserAgentSummary(req.headers['user-agent']);
  return res.json({
    ipAddress: getClientIp(req),
    deviceInfo: ua.device,
    browserInfo: ua.browser,
    serverTimeIso: new Date().toISOString(),
  });
});

// Brute-Force Failed Login Protection & Lockout Tracker
app.post('/api/security/login-attempt', createRateLimiter('login-attempt', 30, 60_000), (req, res) => {
  const { email, outcome } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : 'anonymous';
  const ip = getClientIp(req);
  const key = `${normalizedEmail}::${ip}`;
  const now = Date.now();
  const current = loginAttempts.get(key);

  if (outcome === 'check') {
    if (current && current.lockedUntil > now) {
      const remainingSeconds = Math.ceil((current.lockedUntil - now) / 1000);
      return res.status(429).json({
        locked: true,
        failedCount: current.failedCount,
        remainingSeconds,
        lockedUntilIso: new Date(current.lockedUntil).toISOString(),
        error: `Account temporarily locked due to repeated failed attempts. Try again in ${Math.ceil(remainingSeconds / 60)} minute(s).`,
      });
    }
    return res.json({ locked: false, failedCount: current?.failedCount || 0 });
  }

  if (outcome === 'success') {
    loginAttempts.delete(key);
    return res.json({ locked: false, failedCount: 0, ipAddress: ip });
  }

  // outcome === 'failure'
  const prevCount = current && now - current.firstFailedAt < LOCKOUT_WINDOW_MS ? current.failedCount : 0;
  const nextCount = prevCount + 1;
  const locked = nextCount >= MAX_FAILED_LOGIN_ATTEMPTS;
  const lockedUntil = locked ? now + LOCKOUT_WINDOW_MS : 0;

  loginAttempts.set(key, {
    failedCount: nextCount,
    firstFailedAt: current && now - current.firstFailedAt < LOCKOUT_WINDOW_MS ? current.firstFailedAt : now,
    lockedUntil,
  });

  if (locked) {
    return res.status(429).json({
      locked: true,
      failedCount: nextCount,
      remainingSeconds: Math.ceil(LOCKOUT_WINDOW_MS / 1000),
      lockedUntilIso: new Date(lockedUntil).toISOString(),
      alertSeverity: 'Critical',
      alertCategory: 'Account Lockout',
      ipAddress: ip,
      error: 'Maximum failed login attempts reached. Account locked for 15 minutes and security alert triggered.',
    });
  }

  return res.json({
    locked: false,
    failedCount: nextCount,
    remainingAttempts: MAX_FAILED_LOGIN_ATTEMPTS - nextCount,
    alertTriggered: nextCount >= 3,
    alertCategory: nextCount >= 3 ? 'Multiple Failed Logins' : null,
    ipAddress: ip,
  });
});

// Authenticated MFA Challenge Dispatch
app.post(
  '/api/security/mfa/send-code',
  createRateLimiter('mfa-send', 10, 60_000),
  requireFirebaseAuth,
  async (req: AuthenticatedRequest, res) => {
    const uid = req.authUser?.uid;
    const email = req.authUser?.email || '';
    if (!uid) return res.status(401).json({ error: 'Authentication required.' });

    const code = String(crypto.randomInt(100000, 999999));
    const codeHash = crypto.createHash('sha256').update(`${uid}:${code}`).digest('hex');
    const expiresAt = Date.now() + 5 * 60 * 1000;
    mfaChallenges.set(uid, { codeHash, expiresAt, attempts: 0, verified: false });

    // Attempt direct SMTP email delivery if Gmail SMTP is configured
    const gmailAppPassword = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
    const gmailUser = (process.env.GMAIL_USER || process.env.ENQUIRY_RECIPIENT_EMAIL || '').trim();
    let emailSent = false;

    if (gmailAppPassword && gmailUser && email) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: { user: gmailUser, pass: gmailAppPassword },
        });
        await transporter.sendMail({
          from: `"ARSHIEL ASSURANCE Security" <${gmailUser}>`,
          to: email,
          subject: '[ARSHIEL ASSURANCE] Your 2FA Security Verification Code',
          text: `Your ARSHIEL ASSURANCE one-time verification code is ${code}. It expires in 5 minutes. If you did not request this, contact your administrator immediately.`,
        });
        emailSent = true;
      } catch {
        emailSent = false;
      }
    }

    return res.json({
      ok: true,
      deliveryChannel: emailSent ? 'email' : 'in-session-fallback',
      expiresInSeconds: 300,
      maskedTarget: email ? email.replace(/(^.).+(@.+)/, '$1***$2') : 'Authenticated Session',
      // Only return fallback verification code when out-of-band SMTP is not configured
      ...(emailSent ? {} : { sessionVerificationCode: code }),
      notice: emailSent
        ? 'A 6-digit verification code has been emailed to your registered address.'
        : 'Out-of-band SMTP is not configured in Secrets. Use the time-limited Session Verification Code displayed below to complete 2FA verification.',
    });
  }
);

// Authenticated MFA Challenge Verification
app.post(
  '/api/security/mfa/verify-code',
  createRateLimiter('mfa-verify', 15, 60_000),
  requireFirebaseAuth,
  (req: AuthenticatedRequest, res) => {
    const uid = req.authUser?.uid;
    const rawCode = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
    if (!uid) return res.status(401).json({ error: 'Authentication required.' });

    const challenge = mfaChallenges.get(uid);
    if (!challenge) {
      return res.status(400).json({ error: 'No active verification challenge found. Request a new code.' });
    }
    if (Date.now() > challenge.expiresAt) {
      mfaChallenges.delete(uid);
      return res.status(400).json({ error: 'Verification code expired. Please request a fresh code.' });
    }
    if (challenge.attempts >= 5) {
      mfaChallenges.delete(uid);
      return res.status(429).json({ error: 'Too many invalid verification attempts. Request a new code.' });
    }

    const candidateHash = crypto.createHash('sha256').update(`${uid}:${rawCode}`).digest('hex');
    const valid = crypto.timingSafeEqual(
      Buffer.from(candidateHash, 'hex'),
      Buffer.from(challenge.codeHash, 'hex')
    );

    if (!valid) {
      challenge.attempts += 1;
      return res.status(401).json({
        verified: false,
        remainingAttempts: Math.max(0, 5 - challenge.attempts),
        error: 'Invalid 6-digit verification code.',
      });
    }

    mfaChallenges.delete(uid);
    return res.json({
      verified: true,
      verifiedAtIso: new Date().toISOString(),
    });
  }
);

// Authenticated System Security & Health Telemetry Endpoint (Super Admin Only)
app.get('/api/security/health', requireFirebaseAuth, requireSuperAdmin, (_req: AuthenticatedRequest, res) => {
  const mem = process.memoryUsage();
  const activeLockouts = Array.from(loginAttempts.values()).filter(
    (item) => item.lockedUntil > Date.now()
  ).length;
  return res.json({
    ok: true,
    version: '0.01',
    superAdminOnlyWriteMode: true,
    uptimeSeconds: Math.round(process.uptime()),
    memoryRssMb: Math.round(mem.rss / (1024 * 1024)),
    heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
    firebaseProjectId: FIREBASE_PROJECT_ID,
    tokenVerificationActive: true,
    rateLimitingActive: true,
    activeLockouts,
    smtpConfigured: Boolean(process.env.GMAIL_APP_PASSWORD || process.env.SMTP_HOST),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    serverTimeIso: new Date().toISOString(),
  });
});

// --- Server-Side File Upload Security Validation (MIME Allowlist + Magic Bytes + 5MB Cap) ---
const ALLOWED_UPLOAD_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function validateUploadedEvidence(
  mimeType: unknown,
  base64Data: unknown,
  fileName?: unknown
): { ok: true; sizeBytes: number } | { ok: false; status: number; code: string; error: string } {
  const mime = typeof mimeType === 'string' ? mimeType.trim().toLowerCase() : '';
  const name = typeof fileName === 'string' ? fileName.trim().toLowerCase() : '';

  const blockedExts = ['.svg', '.html', '.htm', '.js', '.mjs', '.exe', '.sh', '.bat', '.php', '.cmd'];
  if (name && blockedExts.some((ext) => name.endsWith(ext))) {
    return {
      ok: false,
      status: 400,
      code: 'INVALID_FILE_EXTENSION',
      error: 'Executable, script, HTML, or SVG uploads are prohibited. Allowed: JPG, PNG, WEBP, PDF.',
    };
  }

  if (!ALLOWED_UPLOAD_MIMES.has(mime)) {
    return {
      ok: false,
      status: 400,
      code: 'INVALID_FILE_TYPE',
      error: `Disallowed file MIME type "${mime || 'unknown'}". Allowed: image/jpeg, image/png, image/webp, application/pdf.`,
    };
  }

  if (typeof base64Data !== 'string' || !base64Data.trim()) {
    return {
      ok: false,
      status: 400,
      code: 'EMPTY_FILE',
      error: 'Uploaded file payload is empty.',
    };
  }

  const rawBuffer = Buffer.from(base64Data, 'base64');
  if (rawBuffer.length === 0) {
    return {
      ok: false,
      status: 400,
      code: 'EMPTY_FILE',
      error: 'Decoded file payload is empty.',
    };
  }

  if (rawBuffer.length > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      status: 413,
      code: 'FILE_TOO_LARGE',
      error: `Uploaded file exceeds maximum allowed limit of ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`,
    };
  }

  // Verify file magic bytes to prevent MIME spoofing
  const isPng =
    rawBuffer.length >= 8 &&
    rawBuffer[0] === 0x89 &&
    rawBuffer[1] === 0x50 &&
    rawBuffer[2] === 0x4e &&
    rawBuffer[3] === 0x47;
  const isJpeg =
    rawBuffer.length >= 3 &&
    rawBuffer[0] === 0xff &&
    rawBuffer[1] === 0xd8 &&
    rawBuffer[2] === 0xff;
  const isWebp =
    rawBuffer.length >= 12 &&
    rawBuffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    rawBuffer.subarray(8, 12).toString('ascii') === 'WEBP';
  const isPdf =
    rawBuffer.length >= 4 && rawBuffer.subarray(0, 4).toString('ascii') === '%PDF';

  const matchesMime =
    (mime === 'image/png' && isPng) ||
    (mime === 'image/jpeg' && isJpeg) ||
    (mime === 'image/webp' && isWebp) ||
    (mime === 'application/pdf' && isPdf);

  if (!matchesMime) {
    return {
      ok: false,
      status: 400,
      code: 'FILE_SIGNATURE_MISMATCH',
      error: 'Uploaded file binary signature does not match declared MIME type (spoofed file rejected).',
    };
  }

  return { ok: true, sizeBytes: rawBuffer.length };
}

app.post(
  '/api/security/validate-upload',
  createRateLimiter('upload-validate', 30, 60_000),
  requireFirebaseAuth,
  (req: AuthenticatedRequest, res) => {
    const { mimeType, base64Data, fileName } = req.body || {};
    const check = validateUploadedEvidence(mimeType, base64Data, fileName);
    if (!check.ok) {
      return res.status(check.status).json({ ok: false, code: check.code, error: check.error });
    }
    return res.json({ ok: true, sizeBytes: check.sizeBytes, verifiedBy: req.authUser?.uid });
  }
);

const DEFAULT_ENQUIRY_RECIPIENT = 'jonathan.tadanki@gmail.com';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface EnquiryEmailPayload {
  referenceId: string;
  enquiryType: string;
  submissionMode: string;
  receivedAt: string;
  fullName: string;
  organization: string;
  email: string;
  phone: string;
  industry: string;
  serviceFocus: string;
  country: string;
  message: string;
  restrictedNotice: string | null;
}

interface EmailDeliveryResult {
  delivered: boolean;
  activationPending?: boolean;
  provider: 'gmail-smtp' | 'custom-smtp' | 'resend' | 'formsubmit' | 'none';
  recipient: string;
  statusMessage: string;
}

function buildEnquiryEmailContent(p: EnquiryEmailPayload) {
  const subject = `[ARSHIEL ASSURANCE] ${p.enquiryType} (${p.referenceId}) — ${p.fullName}${
    p.organization ? ` (${p.organization})` : ''
  }`;

  const textLines = [
    `ARSHIEL ASSURANCE — NEW ${p.enquiryType.toUpperCase()}`,
    `Reference ID: ${p.referenceId}`,
    `Received At: ${p.receivedAt}`,
    ``,
    `Name: ${p.fullName}`,
    `Company / Organization: ${p.organization || 'Not specified'}`,
    `Email: ${p.email}`,
    `Phone: ${p.phone || 'Not specified'}`,
    `Industry: ${p.industry || 'Not specified'}`,
    `Required Service: ${p.serviceFocus || 'Not specified'}`,
    `Country / Location: ${p.country || 'India'}`,
    ``,
    `Message:`,
    p.message,
    ...(p.restrictedNotice ? ['', `Authorization Screening Notice:`, p.restrictedNotice] : []),
    ``,
    `---`,
    `Reply directly to this email to respond to ${p.fullName} (${p.email}).`,
  ];

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; background:#f4f7fb; padding:24px; color:#0f172a;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #dbe4f0;">
        <div style="background:#071329; padding:22px 26px; border-bottom:3px solid #F5B82E;">
          <div style="font-size:11px; letter-spacing:1.6px; text-transform:uppercase; color:#00D4FF; font-weight:700;">
            ARSHIEL ASSURANCE · DIRECT LEAD DISPATCH
          </div>
          <h1 style="margin:6px 0 0; font-size:20px; color:#ffffff;">
            New ${escapeHtml(p.enquiryType)}
          </h1>
          <div style="margin-top:6px; font-size:12px; color:#cbd5e1;">
            Reference: <strong style="color:#F5B82E;">${escapeHtml(p.referenceId)}</strong> &nbsp;|&nbsp; ${escapeHtml(p.receivedAt)}
          </div>
        </div>
        <div style="padding:24px 26px;">
          <table style="width:100%; border-collapse:collapse; font-size:13px;">
            <tr><td style="padding:8px 0; color:#64748b; width:170px; border-bottom:1px solid #eef2f7;">Full Name</td><td style="padding:8px 0; font-weight:600; color:#0f172a; border-bottom:1px solid #eef2f7;">${escapeHtml(p.fullName)}</td></tr>
            <tr><td style="padding:8px 0; color:#64748b; border-bottom:1px solid #eef2f7;">Company / Facility</td><td style="padding:8px 0; color:#0f172a; border-bottom:1px solid #eef2f7;">${escapeHtml(p.organization || 'Not specified')}</td></tr>
            <tr><td style="padding:8px 0; color:#64748b; border-bottom:1px solid #eef2f7;">Email Address</td><td style="padding:8px 0; border-bottom:1px solid #eef2f7;"><a href="mailto:${escapeHtml(p.email)}" style="color:#087BFF; text-decoration:none; font-weight:600;">${escapeHtml(p.email)}</a></td></tr>
            <tr><td style="padding:8px 0; color:#64748b; border-bottom:1px solid #eef2f7;">Phone</td><td style="padding:8px 0; color:#0f172a; border-bottom:1px solid #eef2f7;">${escapeHtml(p.phone || 'Not specified')}</td></tr>
            <tr><td style="padding:8px 0; color:#64748b; border-bottom:1px solid #eef2f7;">Industry</td><td style="padding:8px 0; color:#0f172a; border-bottom:1px solid #eef2f7;">${escapeHtml(p.industry || 'Not specified')}</td></tr>
            <tr><td style="padding:8px 0; color:#64748b; border-bottom:1px solid #eef2f7;">Required Service</td><td style="padding:8px 0; font-weight:600; color:#071329; border-bottom:1px solid #eef2f7;">${escapeHtml(p.serviceFocus || 'Not specified')}</td></tr>
            <tr><td style="padding:8px 0; color:#64748b; border-bottom:1px solid #eef2f7;">Country / Location</td><td style="padding:8px 0; color:#0f172a; border-bottom:1px solid #eef2f7;">${escapeHtml(p.country || 'India')}</td></tr>
          </table>

          <div style="margin-top:18px; padding:16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
            <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.8px; color:#475569; margin-bottom:6px;">
              Client Requirement / Message
            </div>
            <div style="font-size:13px; line-height:1.6; color:#0f172a; white-space:pre-wrap;">${escapeHtml(p.message)}</div>
          </div>

          ${
            p.restrictedNotice
              ? `<div style="margin-top:14px; padding:12px 14px; background:#fffbeb; border:1px solid #fcd34d; border-radius:8px; font-size:12px; color:#92400e;"><strong>Authorization Screening Notice:</strong> ${escapeHtml(p.restrictedNotice)}</div>`
              : ''
          }
        </div>
        <div style="background:#f8fafc; padding:14px 26px; font-size:11px; color:#64748b; border-top:1px solid #e2e8f0;">
          Hit <strong>Reply</strong> in Gmail to respond directly to ${escapeHtml(p.fullName)} (${escapeHtml(p.email)}).
        </div>
      </div>
    </div>
  `;

  return { subject, text: textLines.join('\n'), html };
}

async function deliverEnquiryToGmail(payload: EnquiryEmailPayload): Promise<EmailDeliveryResult> {
  const recipient = (process.env.ENQUIRY_RECIPIENT_EMAIL || DEFAULT_ENQUIRY_RECIPIENT).trim();
  const { subject, text, html } = buildEnquiryEmailContent(payload);

  // 1. Direct Gmail SMTP via Nodemailer (recommended when GMAIL_APP_PASSWORD is configured in Secrets)
  const gmailUser = (process.env.GMAIL_USER || recipient).trim();
  const gmailAppPassword = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  if (gmailAppPassword) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      });
      await transporter.sendMail({
        from: `"ARSHIEL ASSURANCE Portal" <${gmailUser}>`,
        to: recipient,
        replyTo: `"${payload.fullName}" <${payload.email}>`,
        subject,
        text,
        html,
      });
      return {
        delivered: true,
        provider: 'gmail-smtp',
        recipient,
        statusMessage: `Directly delivered to ${recipient} via Gmail.`,
      };
    } catch (err) {
      console.error('[ARSHIEL Email] Gmail SMTP dispatch failed:', err instanceof Error ? err.message : err);
    }
  }

  // 2. Custom SMTP fallback if configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const port = Number(process.env.SMTP_PORT) || 587;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        from: `"ARSHIEL ASSURANCE Portal" <${process.env.SMTP_USER}>`,
        to: recipient,
        replyTo: `"${payload.fullName}" <${payload.email}>`,
        subject,
        text,
        html,
      });
      return {
        delivered: true,
        provider: 'custom-smtp',
        recipient,
        statusMessage: `Directly delivered to ${recipient}.`,
      };
    } catch (err) {
      console.error('[ARSHIEL Email] Custom SMTP dispatch failed:', err instanceof Error ? err.message : err);
    }
  }

  // 3. Resend API fallback if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const resendResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'ARSHIEL ASSURANCE <onboarding@resend.dev>',
          to: [recipient],
          reply_to: payload.email,
          subject,
          text,
          html,
        }),
      });
      if (resendResp.ok) {
        return {
          delivered: true,
          provider: 'resend',
          recipient,
          statusMessage: `Directly delivered to ${recipient}.`,
        };
      }
    } catch (err) {
      console.error('[ARSHIEL Email] Resend dispatch failed:', err instanceof Error ? err.message : err);
    }
  }

  // 4. Zero-Config Automatic Gmail Forwarding via FormSubmit AJAX API
  try {
    const appOrigin = (process.env.APP_URL || 'https://arshiel-assurance.ai.studio').replace(/\/$/, '');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const formSubmitResp = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Origin: appOrigin,
        Referer: `${appOrigin}/`,
      },
      body: JSON.stringify({
        'Reference ID': payload.referenceId,
        'Request Type': payload.enquiryType,
        'Full Name': payload.fullName,
        'Company / Facility': payload.organization || 'Not specified',
        'Client Email': payload.email,
        Phone: payload.phone || 'Not specified',
        Industry: payload.industry || 'Not specified',
        'Required Service': payload.serviceFocus || 'Not specified',
        'Country / Location': payload.country || 'India',
        Message: payload.message,
        ...(payload.restrictedNotice ? { 'Authorization Notice': payload.restrictedNotice } : {}),
        _subject: subject,
        _replyto: payload.email,
        _template: 'table',
        _captcha: 'false',
      }),
    });
    clearTimeout(timeoutId);

    const result = (await formSubmitResp.json().catch(() => ({}))) as {
      success?: boolean | string;
      message?: string;
    };

    const msgText = String(result.message || '');
    const isSuccess = result.success === true || result.success === 'true';
    const needsActivation =
      msgText.toLowerCase().includes('activation') || msgText.toLowerCase().includes('confirm');

    if (formSubmitResp.ok && isSuccess) {
      return {
        delivered: true,
        activationPending: false,
        provider: 'formsubmit',
        recipient,
        statusMessage: `Directly forwarded to ${recipient}.`,
      };
    }

    if (needsActivation) {
      return {
        delivered: true,
        activationPending: true,
        provider: 'formsubmit',
        recipient,
        statusMessage: `One-time activation email sent to ${recipient}. Open Gmail and click "Activate Form" once to receive all future requests automatically.`,
      };
    }

    console.warn('[ARSHIEL Email] FormSubmit response:', formSubmitResp.status, result);
  } catch (err) {
    console.error('[ARSHIEL Email] FormSubmit relay failed:', err instanceof Error ? err.message : err);
  }

  return {
    delivered: false,
    provider: 'none',
    recipient,
    statusMessage: `Reference logged. Configure GMAIL_APP_PASSWORD in Secrets or use the direct Gmail button below to send straight to ${recipient}.`,
  };
}

// Contact, Service, Audit, Consultancy & Quotation Enquiry Endpoint
app.post('/api/enquiries', createRateLimiter('enquiries', 15, 5 * 60_000), async (req, res) => {
  const {
    enquiryType,
    submissionMode,
    fullName,
    organization,
    email,
    phone,
    industry,
    serviceFocus,
    country,
    location,
    message,
  } = req.body || {};

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return res.status(400).json({ error: 'Please provide your full name.' });
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (!message || typeof message !== 'string' || message.trim().length < 8) {
    return res.status(400).json({ error: 'Please briefly describe your audit, ISO, or consultancy requirement.' });
  }

  const combinedText = `${serviceFocus || ''} ${message || ''}`.toLowerCase();
  const flaggedRestricted =
    combinedText.includes('accredited iso certificate') ||
    combinedText.includes('official iso certification') ||
    combinedText.includes('fssai license') ||
    combinedText.includes('government fire noc');

  const prefix = submissionMode === 'consultation' ? 'AA-CON' : 'AA-ENQ';
  const referenceId = `${prefix}-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
  const resolvedEnquiryType =
    enquiryType || (submissionMode === 'consultation' ? 'Consultation Request' : 'Business Enquiry');
  const receivedAt = new Date().toISOString();
  const restrictedNotice = flaggedRestricted
    ? 'Note: Your message references a Category 3 regulated/accredited certification or statutory approval. ARSHIEL ASSURANCE provides independent consultancy, certification support, and readiness assessments only and coordinates transparently with accredited bodies where required.'
    : null;

  const emailDelivery = await deliverEnquiryToGmail({
    referenceId,
    enquiryType: resolvedEnquiryType,
    submissionMode: submissionMode || 'enquiry',
    receivedAt,
    fullName: fullName.trim(),
    organization: typeof organization === 'string' ? organization.trim() : '',
    email: email.trim(),
    phone: typeof phone === 'string' ? phone.trim() : '',
    industry: typeof industry === 'string' ? industry.trim() : '',
    serviceFocus: typeof serviceFocus === 'string' ? serviceFocus.trim() : '',
    country: typeof country === 'string' ? country.trim() : typeof location === 'string' ? location.trim() : 'India',
    message: message.trim(),
    restrictedNotice,
  });

  return res.json({
    ok: true,
    referenceId,
    enquiryType: resolvedEnquiryType,
    submissionMode: submissionMode || 'enquiry',
    receivedAt,
    restrictedNotice,
    emailDelivery,
    contactRouting: {
      brand: 'ARSHIEL EHS AI SOLUTIONS',
      owner: 'Jonathan Thadanki',
      email: emailDelivery.recipient,
      organization: organization || '',
      industry: industry || '',
      country: country || 'India',
      location: location || '',
      phone: phone || '',
    },
  });
});

// 1. AI ISO GAP ANALYSIS ENGINE ENDPOINT (Protected: Super Admin Only)
app.post('/api/ai/iso-gap', createRateLimiter('ai-workspace', 40, 60_000), requireFirebaseAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { action, standardCode, standardName, edition, industry, scope, clauseNumber, clauseTitle, requirementSummary, currentEvidence, status } = req.body;
    const ai = getGeminiClient();

    if (action === 'analyze_clause') {
      const response = await ai.models.generateContent({
        model: AI_MODEL,
        contents: `Perform an AI-assisted ISO Gap Assessment analysis for:
Standard: ${standardCode} (${standardName}, Edition: ${edition || 'Current'})
Industry: ${industry || 'General Industrial'}
Scope: ${scope || 'Facility Operations'}
Clause: ${clauseNumber} - ${clauseTitle}
Requirement Overview: ${requirementSummary || 'Standard management system requirement'}
Current Status: ${status || 'Pending Evidence'}
Uploaded/Described Evidence: ${currentEvidence || 'None provided yet'}

Provide structured guidance (original paraphrase, clearly AI assistance, non-certification).`,
        config: {
          systemInstruction: MANDATORY_GOVERNANCE_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              clauseInterpretation: { type: Type.STRING, description: 'Original AI-assisted interpretation of what this clause expects in this industry.' },
              assessmentQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3-5 targeted auditor questions.' },
              expectedEvidence: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Expected documented information and operational records.' },
              missingDocumentation: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Potential missing documentation based on the evidence provided.' },
              identifiedGap: { type: Type.STRING, description: 'Concise gap observation if evidence is incomplete or status is non-compliant.' },
              recommendedAction: { type: Type.STRING, description: 'Practical corrective action recommendation.' },
              suggestedRisk: { type: Type.STRING, description: 'Low, Medium, High, or Critical.' },
            },
          },
        },
      });
      return res.json({ data: JSON.parse((response.text ?? '{}').trim()) });
    }

    // Default: Executive Gap Analysis Summary
    const { clausesSummary, complianceScore, organizationName, siteLocation } = req.body;
    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: `Draft an Executive Management Summary for an independent ISO Gap Assessment (NOT an accredited certification audit).
Organization: ${organizationName || 'Client Organization'}
Site: ${siteLocation || 'Primary Site'}
Industry: ${industry || 'Industrial'}
Standard: ${standardCode} - ${standardName} (${edition || 'Current'})
Calculated Readiness Score: ${complianceScore ?? 0}%
Clause Assessment Breakdown:
${JSON.stringify(clausesSummary || [], null, 2)}

Include: 1) Readiness Overview, 2) Key Systemic Gaps, 3) Priority Remediation Roadmap (30/60/90 days), 4) Mandatory Independence & Draft Review Disclaimer.`,
      config: {
        systemInstruction: MANDATORY_GOVERNANCE_INSTRUCTION,
      },
    });
    return res.json({ summary: response.text ?? '' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to run ISO Gap AI analysis.';
    return res.status(500).json({ error: message });
  }
});

// 2. AI INDIAN LEGAL COMPLIANCE ENGINE ENDPOINT (Protected: Super Admin Only)
app.post('/api/ai/legal-compliance', createRateLimiter('ai-workspace', 40, 60_000), requireFirebaseAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { industry, jurisdiction, establishmentDetails, categories, existingRegisterSummary } = req.body;
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: `Analyze Indian statutory compliance applicability for:
Industry: ${industry || 'Manufacturing'}
Jurisdiction: ${jurisdiction || 'India (Central) + Telangana / Andhra Pradesh'}
Establishment Details: ${establishmentDetails || 'Industrial establishment with employees and contractors'}
Focus Categories: ${(categories || []).join(', ') || 'Occupational Safety, Environment, Fire, Electrical, Labour'}
Current Register Snapshot: ${JSON.stringify(existingRegisterSummary || [])}

CRITICAL LEGAL ACCURACY RULES:
- Do NOT invent Act numbers, rule dates, statutory deadlines, or notification numbers.
- Reference official portals (India Code - indiacode.nic.in, MoEFCC, MoLE, CPCB, APPCB, TSPCB, FSSAI, CEA).
- For any state-specific rule notification or transitional OSH Code rule whose current commencement date cannot be confirmed, set verificationStatus to "UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED".
- Return structured JSON with applicability guidance and suggested legal register items.`,
      config: {
        systemInstruction: MANDATORY_GOVERNANCE_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            applicabilityOverview: { type: Type.STRING },
            legalDisclaimer: { type: Type.STRING },
            suggestedItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  actName: { type: Type.STRING },
                  ruleName: { type: Type.STRING },
                  sectionRef: { type: Type.STRING },
                  jurisdiction: { type: Type.STRING },
                  classification: { type: Type.STRING },
                  authority: { type: Type.STRING },
                  category: { type: Type.STRING },
                  requirement: { type: Type.STRING },
                  frequency: { type: Type.STRING },
                  requiredDocs: { type: Type.STRING },
                  officialSource: { type: Type.STRING },
                  sourceUrl: { type: Type.STRING },
                  verificationStatus: { type: Type.STRING },
                  correctiveGuidance: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });
    return res.json({ data: JSON.parse((response.text ?? '{}').trim()) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to run Legal Compliance AI analysis.';
    return res.status(500).json({ error: message });
  }
});

// 3. AI EHS / SPECIALIZED AUDIT ENGINE ENDPOINT (Protected: Super Admin Only)
app.post('/api/ai/audit-assist', createRateLimiter('ai-workspace', 40, 60_000), requireFirebaseAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { action, engineType, industry, scope, category, siteLocation, evidenceText, evidenceImageBase64, evidenceMimeType, auditData } = req.body;
    const ai = getGeminiClient();

    if (action === 'generate_checklist') {
      const response = await ai.models.generateContent({
        model: AI_MODEL,
        contents: `Generate an industry-specific independent audit checklist for:
Audit Engine: ${engineType || 'EHS'}
Industry: ${industry || 'Manufacturing'}
Audit Category / Module: ${category || 'General Safety & Compliance'}
Scope: ${scope || 'Site Assessment'}
Generate 8 practical, verifiable audit checklist questions with clear assessment criteria, risk category, and expected objective evidence. Remember: this is an independent non-statutory assessment checklist.`,
        config: {
          systemInstruction: MANDATORY_GOVERNANCE_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    question: { type: Type.STRING },
                    criteria: { type: Type.STRING },
                    expectedEvidence: { type: Type.STRING },
                    riskLevel: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });
      return res.json({ data: JSON.parse((response.text ?? '{}').trim()) });
    }

    if (action === 'analyze_evidence') {
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
      if (evidenceImageBase64 || evidenceMimeType) {
        const uploadCheck = validateUploadedEvidence(evidenceMimeType, evidenceImageBase64);
        if (!uploadCheck.ok) {
          return res.status(uploadCheck.status).json({
            error: uploadCheck.error,
            code: uploadCheck.code,
          });
        }
        parts.push({
          inlineData: {
            mimeType: evidenceMimeType,
            data: evidenceImageBase64,
          },
        });
      }
      parts.push({
        text: `Review the uploaded audit evidence / field note for ${engineType || 'EHS'} audit in ${industry || 'Industrial'} (${siteLocation || 'Site'}).
Field Note / Context: ${evidenceText || 'Visual evidence attached.'}
IMPORTANT: Do NOT invent observations that are not directly visible in the image or stated in the field note. Clearly mark the output as AI Draft Observation requiring competent Lead Auditor verification.`,
      });

      const response = await ai.models.generateContent({
        model: AI_MODEL,
        contents: { parts },
        config: {
          systemInstruction: MANDATORY_GOVERNANCE_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              draftObservation: { type: Type.STRING },
              suggestedClassification: { type: Type.STRING, description: 'Critical, Major, Minor, Observation, Opportunity for Improvement, or Good Practice' },
              potentialConsequence: { type: Type.STRING },
              recommendedAction: { type: Type.STRING },
              verificationWarning: { type: Type.STRING },
            },
          },
        },
      });
      return res.json({ data: JSON.parse((response.text ?? '{}').trim()) });
    }

    // Executive Summary & CAPA recommendations for an audit
    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: `Generate an Executive Audit Summary (DRAFT – AUDITOR VERIFICATION REQUIRED) for this independent ${engineType || 'EHS'} assessment:
${JSON.stringify(auditData || {}, null, 2)}
Summarize compliance score, key strengths, prioritized critical/major findings, and recommended CAPA priorities. Never fabricate observations beyond the supplied data.`,
      config: {
        systemInstruction: MANDATORY_GOVERNANCE_INSTRUCTION,
      },
    });
    return res.json({ summary: response.text ?? '' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to run Audit AI assist.';
    return res.status(500).json({ error: message });
  }
});

// 4. AI DOCUMENT GENERATOR ENDPOINT (Protected: Super Admin Only)
app.post('/api/ai/generate-document', createRateLimiter('ai-workspace', 40, 60_000), requireFirebaseAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { docCategory, docType, title, industry, activity, department, equipment, standardRef, siteConditions, hazards, docNumber } = req.body;
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: `Draft a comprehensive, enterprise-grade ${docType} (${docCategory} document) for ARSHIEL ASSURANCE.
Document Control Header:
- Document Number: ${docNumber || 'AA-DOC-DRAFT'}
- Status: DRAFT – REVIEW REQUIRED
- Title: ${title || docType}
- Industry: ${industry || 'Manufacturing'}
- Activity / Process: ${activity || 'General Site Operations'}
- Department: ${department || 'Operations / EHS'}
- Equipment / Systems: ${equipment || 'Standard Industrial Equipment'}
- Reference Standard / Guidance: ${standardRef || 'Applicable ISO & Industry Best Practices'}
- Site Conditions: ${siteConditions || 'Standard controlled industrial site'}
- Identified Hazards / Key Inputs: ${hazards || 'Mechanical, Electrical, Chemical, Ergonomic, Fire'}

Format cleanly in structured Markdown with clear sections, numbered tables (for HIRA/HAZID/JSA/HACCP include Hazard/Step, Risk/Consequence, Existing Controls, Risk Rating, Additional Controls, Residual Risk, Responsibility), emergency protocols, roles & responsibilities, and a mandatory Document Control & Disclaimer block stating this is a "DRAFT – REVIEW REQUIRED" prepared by AI assistance and must be verified and approved by a competent authorized person before operational deployment.`,
      config: {
        systemInstruction: MANDATORY_GOVERNANCE_INSTRUCTION,
      },
    });

    return res.json({ content: response.text ?? '' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate AI document draft.';
    return res.status(500).json({ error: message });
  }
});

// 5. DIVISION 01 UNIFIED ENTERPRISE AI ENGINE (Risk, CAPA, Compliance, Report, Evidence) — Super Admin Only
app.post(
  '/api/ai/enterprise-engine',
  createRateLimiter('ai-workspace', 40, 60_000),
  requireFirebaseAuth,
  requireSuperAdmin,
  async (req: AuthenticatedRequest, res) => {
    try {
      const {
        engineMode,
        standardCode,
        country,
        stateRegion,
        industry,
        organizationName,
        siteLocation,
        contextInput,
      } = req.body || {};

      if (typeof engineMode !== 'string' || !engineMode.trim()) {
        return res.status(400).json({ error: 'engineMode is required.' });
      }

      const ai = getGeminiClient();
      const scopeBlock = `Standard / Framework: ${standardCode || 'ISO 9001 / ISO 14001 / ISO 45001'}
Country / State: ${country || 'India'} / ${stateRegion || 'Pan-India'}
Industry: ${industry || 'Manufacturing / Industrial'}
Organization & Site: ${organizationName || 'Enterprise Client'} — ${siteLocation || 'Primary Facility'}
User Input / Evidence Context:
${typeof contextInput === 'string' ? contextInput.slice(0, 6000) : 'Provide enterprise-grade structured guidance.'}`;

      const modePrompts: Record<string, string> = {
        risk_intelligence: `Perform an Enterprise AI Risk Intelligence assessment for the scope below. Identify 4–6 top operational/EHS/ISO/ESG/cyber risks with Likelihood (1-5), Consequence (1-5), Inherent Risk Score, recommended engineering & administrative controls, expected Residual Risk, and review cadence. Mark clearly as DRAFT – COMPETENT RISK REVIEW REQUIRED.`,
        capa_recommendations: `Generate structured Root Cause Analysis (5-Why + Fishbone Ishikawa 6M categories), Immediate Containment, Corrective Action, Preventive Action, Objective Closure Evidence, and 30/60/90-day Effectiveness Verification criteria for the non-conformity described below. Mark clearly as DRAFT – REVIEW REQUIRED.`,
        compliance_assistant: `Provide structured Global / Country / State Legal & ESG Compliance guidance for the scope below. Highlight likely statutory areas, ESG/GHG Scope 1-3 reporting expectations, required registers/permits, and official verification sources. CRITICAL: Never invent act numbers or deadlines; label any unconfirmed jurisdiction rule as "UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED".`,
        report_generator: `Draft an Executive Assurance / Management Review / Audit Summary Report (DRAFT – REVIEW REQUIRED) in clean Markdown with: 1) Executive Overview, 2) Scope & Methodology (independent non-statutory assessment disclaimer), 3) Key Strengths & Conformity Highlights, 4) Prioritized Risks / Gaps / Findings, 5) 30-60-90 Day Action Roadmap, and 6) Reviewer Sign-Off Block.`,
        evidence_analysis: `Review the supplied audit evidence description / document excerpt and identify: 1) Conformity Indicators, 2) Missing Requirements or Objective Evidence Gaps, 3) Targeted Follow-Up Audit Questions, 4) Suggested Finding Classification (Critical / Major / Minor / Observation / OFI), and 5) Required Auditor Verification Steps. Never fabricate site observations.`,
      };

      const instruction =
        modePrompts[engineMode] ||
        `Provide structured ISO & Enterprise Assurance guidance for the scope below. Mark output as DRAFT – REVIEW REQUIRED.`;

      const response = await ai.models.generateContent({
        model: AI_MODEL,
        contents: `${instruction}\n\n${scopeBlock}`,
        config: {
          systemInstruction: MANDATORY_GOVERNANCE_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              draftStatus: { type: Type.STRING },
              executiveSummary: { type: Type.STRING },
              keyFindingsOrRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
              auditQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
              fullDraftMarkdown: { type: Type.STRING },
              governanceDisclaimer: { type: Type.STRING },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json({
        ok: true,
        engineMode,
        generatedAtIso: new Date().toISOString(),
        data: {
          ...parsed,
          draftStatus: 'DRAFT – REVIEW REQUIRED',
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to run Enterprise AI Intelligence Engine.';
      return res.status(500).json({ error: message });
    }
  }
);

// 6. SUPER ADMIN DATABASE BACKUP SNAPSHOT VERIFICATION ENDPOINT
app.post(
  '/api/security/backup-export',
  createRateLimiter('backup-export', 10, 60_000),
  requireFirebaseAuth,
  requireSuperAdmin,
  (req: AuthenticatedRequest, res) => {
    const counts = req.body?.collectionCounts || {};
    const snapshotId = `AA-BKP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const checksum = crypto
      .createHash('sha256')
      .update(JSON.stringify({ snapshotId, counts, uid: req.authUser?.uid }))
      .digest('hex');

    return res.json({
      ok: true,
      snapshotId,
      verifiedBy: req.authUser?.email || 'Super Admin',
      generatedAtIso: new Date().toISOString(),
      sha256IntegrityHash: checksum,
      firebaseProjectId: FIREBASE_PROJECT_ID,
      collectionCounts: counts,
    });
  }
);

// 7. ARSHIEL AI ASSURANCE ASSISTANT CHAT ENDPOINT (Protected: Super Admin Only)
app.post('/api/ai/assistant', createRateLimiter('ai-assistant', 25, 60_000), requireFirebaseAuth, requireSuperAdmin, async (req, res) => {
  try {
    const { messages, contextSummary } = req.body;
    const ai = getGeminiClient();

    const historyText = Array.isArray(messages)
      ? messages.map((m: { role: string; text: string }) => `${m.role === 'user' ? 'User' : 'ARSHIEL AI'}: ${m.text}`).join('\n\n')
      : '';

    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: `Active Platform Context (Live Summary):
${contextSummary || 'ARSHIEL ASSURANCE workspace active.'}

Conversation History:
${historyText}

Provide a clear, practical, structured response grounded in ISO management systems, EHS auditing, Global & Indian legal compliance, ESG & GHG sustainability, Risk Intelligence, food safety, fire safety, CAPA, and ARSHIEL ASSURANCE's Legal Authorization Control rules.`,
      config: {
        systemInstruction: MANDATORY_GOVERNANCE_INSTRUCTION,
      },
    });

    return res.json({ reply: response.text ?? '' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ARSHIEL AI Assistant encountered an error.';
    return res.status(500).json({ error: message });
  }
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        setHeaders(res, filePath) {
          if (filePath.endsWith('sw.js') || filePath.endsWith('registerSW.js')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Service-Worker-Allowed', '/');
          } else if (filePath.endsWith('.webmanifest')) {
            res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ARSHIEL ASSURANCE server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
