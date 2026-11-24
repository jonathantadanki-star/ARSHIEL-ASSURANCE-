import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  Smartphone,
  Tablet,
  Laptop,
  X,
  Share,
  PlusSquare,
  MoreVertical,
  CheckCircle2,
  Copy,
  Check,
  WifiOff,
  ShieldCheck,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall, type DevicePlatform } from '../hooks/usePWAInstall';
import { APP_NAME, APP_EDITION_TAG, APP_VERSION_LABEL } from '../config/appVersion';
import { BrandMark } from './BrandMark';

type InstallTab = DevicePlatform | 'qr';

interface PWAInstallButtonProps {
  variant?: 'header' | 'compact' | 'sidebar' | 'hero' | 'card';
  className?: string;
}

function getInstallAppUrl(): string {
  if (typeof window === 'undefined') return '/';
  return window.location.origin;
}

function checkIsInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

interface InstallModalProps {
  open: boolean;
  onClose: () => void;
  initialTab: InstallTab;
  isInstallable: boolean;
  onNativeInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

const PWAInstallModal: React.FC<InstallModalProps> = ({
  open,
  onClose,
  initialTab,
  isInstallable,
  onNativeInstall,
}) => {
  const [activeTab, setActiveTab] = useState<InstallTab>(initialTab);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const appUrl = getInstallAppUrl();
  const isInIframe = checkIsInIframe();

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  useEffect(() => {
    if (!open || !appUrl) return;
    let active = true;
    QRCode.toDataURL(appUrl, {
      width: 220,
      margin: 2,
      color: {
        dark: '#071329',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });
    return () => {
      active = false;
    };
  }, [open, appUrl]);

  if (!open) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopiedUrl(true);
      window.setTimeout(() => setCopiedUrl(false), 2200);
    } catch {
      // Clipboard fallback not needed
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[#030917]/85 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#0B1F3A] border border-[#087BFF]/40 shadow-2xl overflow-hidden text-white my-auto">
        {/* Header */}
        <div className="p-5 bg-[#071329] border-b border-white/10 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandMark size={44} />
            <div>
              <div className="inline-flex items-center gap-2 flex-wrap">
                <h3 id="pwa-install-modal-title" className="font-display text-base font-bold text-white">
                  Install {APP_NAME}
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-[#F5B82E]/15 border border-[#F5B82E]/40 text-[10px] font-mono font-bold text-[#F5B82E]">
                  {APP_VERSION_LABEL} · FREE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Install free on iPhone, iPad, Android, Windows, macOS &amp; ChromeOS — no app store needed.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close install guide"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Embedded Preview Notice (helps laptop & mobile users open direct browser tab to install) */}
        {isInIframe && !isInstallable && (
          <div className="mx-5 mt-4 rounded-xl bg-[#087BFF]/15 border border-[#00D4FF]/35 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-200 leading-relaxed">
              <strong className="text-white block">Open Directly in Browser to Install</strong>
              Browsers show the native 1-click Install popup when opened directly outside an embedded preview frame.
            </div>
            <a
              href={appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#087BFF] hover:bg-blue-500 text-xs font-semibold text-white whitespace-nowrap shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Full App
            </a>
          </div>
        )}

        {/* Platform Tabs */}
        <div className="px-5 pt-4">
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-[#071329] border border-white/10">
            {[
              { id: 'ios' as const, label: 'iOS', icon: Smartphone },
              { id: 'android' as const, label: 'Android', icon: Tablet },
              { id: 'desktop' as const, label: 'Laptop', icon: Laptop },
              { id: 'qr' as const, label: 'QR Scan', icon: QrCode },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#087BFF] text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5 space-y-4">
          {isInstallable && activeTab !== 'ios' && activeTab !== 'qr' && (
            <div className="rounded-xl bg-emerald-500/12 border border-emerald-400/40 p-3.5 flex items-center justify-between gap-3">
              <div className="text-xs text-emerald-200">
                <strong className="text-white block">1-Click Free Install Ready</strong>
                Tap Install Now to add ARSHIEL ASSURANCE straight to your device.
              </div>
              <button
                type="button"
                onClick={async () => {
                  const res = await onNativeInstall();
                  if (res === 'accepted') onClose();
                }}
                className="px-4 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-[#071329] text-xs font-bold whitespace-nowrap cursor-pointer"
              >
                Install Now
              </button>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-3 text-xs text-slate-200 leading-relaxed">
              <div className="font-semibold text-[#00D4FF]">
                Install Free on iPhone &amp; iPad (Safari — all iOS / iPadOS versions):
              </div>
              <ol className="space-y-2.5">
                <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#071329] border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#087BFF] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span>
                    Open this app link in <strong className="text-white">Safari</strong> (or Chrome on iOS 16.4+).
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#071329] border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#087BFF] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span className="inline-flex flex-wrap items-center gap-1">
                    Tap the{' '}
                    <strong className="text-white inline-flex items-center gap-1">
                      <Share className="w-3.5 h-3.5 text-[#00D4FF]" /> Share
                    </strong>{' '}
                    button in the browser toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#071329] border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#087BFF] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <span className="inline-flex flex-wrap items-center gap-1">
                    Scroll down and tap{' '}
                    <strong className="text-white inline-flex items-center gap-1">
                      <PlusSquare className="w-3.5 h-3.5 text-[#F5B82E]" /> Add to Home Screen
                    </strong>
                    , then tap <strong className="text-white">Add</strong>.
                  </span>
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-3 text-xs text-slate-200 leading-relaxed">
              <div className="font-semibold text-[#00D4FF]">
                Install Free on Android Phones &amp; Tablets (Chrome, Edge, Brave, Samsung Internet):
              </div>
              <ol className="space-y-2.5">
                <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#071329] border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#087BFF] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span>
                    Open this link in <strong className="text-white">Chrome</strong> or <strong className="text-white">Microsoft Edge</strong> on your Android phone or tablet.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#071329] border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#087BFF] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span className="inline-flex flex-wrap items-center gap-1">
                    Tap the top-right browser menu{' '}
                    <strong className="text-white inline-flex items-center">
                      <MoreVertical className="w-3.5 h-3.5 text-[#00D4FF]" />
                    </strong>{' '}
                    icon.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#071329] border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#087BFF] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <span>
                    Tap <strong className="text-white">Install app</strong> (or <strong className="text-white">Add to Home screen</strong>) to get the full standalone ARSHIEL icon &amp; offline mode.
                  </span>
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'desktop' && (
            <div className="space-y-3 text-xs text-slate-200 leading-relaxed">
              <div className="font-semibold text-[#00D4FF]">
                Install Free on Windows, macOS, Linux &amp; ChromeOS Laptops:
              </div>
              <ol className="space-y-2.5">
                <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#071329] border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#087BFF] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span>
                    Open this app directly in <strong className="text-white">Google Chrome</strong>, <strong className="text-white">Microsoft Edge</strong>, or <strong className="text-white">macOS Safari</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#071329] border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#087BFF] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span>
                    In Chrome / Edge: click the <strong className="text-white">Install</strong> icon in the address bar (or menu &rarr; <strong className="text-white">Install ARSHIEL ASSURANCE</strong>). It adds a dedicated desktop &amp; Start Menu / Dock app icon.
                  </span>
                </li>
                <li className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#071329] border border-white/10">
                  <span className="w-5 h-5 rounded-full bg-[#087BFF] text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <span>
                    In macOS Safari: choose <strong className="text-white">File &rarr; Add to Dock</strong> to run ARSHIEL ASSURANCE as a standalone Mac app.
                  </span>
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="flex flex-col items-center text-center space-y-3 py-1">
              <div className="text-xs font-semibold text-[#00D4FF]">
                Scan with your iPhone, iPad, or Android Camera to Install Free:
              </div>
              {qrDataUrl ? (
                <div className="p-3 rounded-2xl bg-white shadow-lg border-2 border-[#F5B82E]">
                  <img
                    src={qrDataUrl}
                    alt="QR Code to install ARSHIEL ASSURANCE v0.01 on mobile"
                    className="w-44 h-44 block"
                  />
                </div>
              ) : (
                <div className="w-44 h-44 rounded-xl bg-[#071329] border border-white/10 flex items-center justify-center text-xs text-slate-400">
                  Preparing QR code...
                </div>
              )}
              <p className="text-[11px] text-slate-300 max-w-xs leading-relaxed">
                Point your mobile camera at this QR code, open the link, and tap{' '}
                <strong className="text-white">Install App</strong> (Android) or{' '}
                <strong className="text-white">Share &rarr; Add to Home Screen</strong> (iOS).
              </p>
            </div>
          )}

          {/* App Highlights */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-300">
            <div className="rounded-lg bg-[#071329] border border-white/10 p-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>100% Free</span>
            </div>
            <div className="rounded-lg bg-[#071329] border border-white/10 p-2.5 flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5 text-[#00D4FF] shrink-0" />
              <span>Offline Ready</span>
            </div>
            <div className="rounded-lg bg-[#071329] border border-white/10 p-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F5B82E] shrink-0" />
              <span>Auto-Updates</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-medium text-slate-200 cursor-pointer"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  App Link Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#00D4FF]" />
                  Copy App Link
                </>
              )}
            </button>
            <div className="flex items-center gap-2">
              {isInIframe && (
                <a
                  href={appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#00D4FF]/40 bg-[#00D4FF]/10 hover:bg-[#00D4FF]/20 text-xs font-semibold text-[#00D4FF]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  New Tab
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#087BFF] hover:bg-blue-500 text-xs font-semibold text-white cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, platform, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Automatically suppress install controls when already running in standalone app mode
  if (isInstalled) {
    return null;
  }

  const handlePrimaryClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      const outcome = await install();
      setInstalling(false);
      if (outcome === 'unavailable') {
        setShowGuide(true);
      }
      return;
    }
    setShowGuide(true);
  };

  const renderTrigger = () => {
    if (variant === 'compact') {
      return (
        <button
          type="button"
          onClick={handlePrimaryClick}
          disabled={installing}
          title="Install ARSHIEL ASSURANCE v0.01 Free App"
          className={`inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-[#F5B82E] hover:bg-amber-400 text-[#071329] text-xs font-bold shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
      );
    }

    if (variant === 'sidebar') {
      return (
        <button
          type="button"
          onClick={handlePrimaryClick}
          disabled={installing}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-[#F5B82E]/20 to-[#087BFF]/20 hover:from-[#F5B82E]/30 hover:to-[#087BFF]/30 border border-[#F5B82E]/40 text-xs font-semibold text-white transition-all cursor-pointer ${className}`}
        >
          <span className="inline-flex items-center gap-2 min-w-0">
            <Download className="w-3.5 h-3.5 text-[#F5B82E] shrink-0" />
            <span className="truncate">Install Free App ({APP_EDITION_TAG})</span>
          </span>
          <span className="text-[10px] font-mono text-[#00D4FF] shrink-0">Free</span>
        </button>
      );
    }

    if (variant === 'hero') {
      return (
        <button
          type="button"
          onClick={handlePrimaryClick}
          disabled={installing}
          className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#F5B82E] hover:bg-amber-400 text-[#071329] text-sm font-bold shadow-lg shadow-amber-950/35 transition-colors whitespace-nowrap cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4" />
          Install Free App ({APP_EDITION_TAG})
        </button>
      );
    }

    if (variant === 'card') {
      return (
        <button
          type="button"
          onClick={handlePrimaryClick}
          disabled={installing}
          className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#F5B82E] hover:bg-amber-400 text-[#071329] text-sm font-bold shadow-lg shadow-amber-950/30 transition-colors whitespace-nowrap cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4" />
          {isInstallable
            ? `Install Free App Now (${APP_EDITION_TAG})`
            : `Download / Install Free App (${APP_EDITION_TAG})`}
        </button>
      );
    }

    // Default: desktop header trigger
    return (
      <button
        type="button"
        onClick={handlePrimaryClick}
        disabled={installing}
        title="Install ARSHIEL ASSURANCE v0.01 Free on iOS, Android, Tablet, or Laptop"
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#F5B82E]/50 bg-[#F5B82E]/12 hover:bg-[#F5B82E]/25 text-xs font-semibold text-[#F5B82E] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${className}`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  };

  return (
    <>
      {renderTrigger()}
      <PWAInstallModal
        open={showGuide}
        onClose={() => setShowGuide(false)}
        initialTab={platform}
        isInstallable={isInstallable}
        onNativeInstall={install}
      />
    </>
  );
};

/**
 * Floating bottom free app install banner — automatically suppressed when installed
 * in standalone mode or dismissed for the current session.
 */
export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, platform, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallAction = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'unavailable') {
        setShowGuide(true);
      }
      return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <div
        role="region"
        aria-label="Install ARSHIEL ASSURANCE App"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-xl rounded-2xl bg-[#0B1F3A]/95 backdrop-blur-md border border-[#F5B82E]/45 shadow-2xl shadow-black/70 px-3.5 py-2.5 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <BrandMark size={34} />
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
              <span>{APP_NAME}</span>
              <span className="px-1.5 py-0.5 rounded bg-[#F5B82E]/15 text-[#F5B82E] font-mono text-[10px]">
                {APP_EDITION_TAG}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 truncate">
              Free app for iPhone, iPad, Android &amp; Laptops · Offline Ready
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallAction}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5B82E] hover:bg-amber-400 text-[#071329] text-xs font-bold whitespace-nowrap transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isInstallable ? 'Install Free' : 'Get App'}</span>
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss install banner"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <PWAInstallModal
        open={showGuide}
        onClose={() => setShowGuide(false)}
        initialTab={platform}
        isInstallable={isInstallable}
        onNativeInstall={install}
      />
    </>
  );
};
