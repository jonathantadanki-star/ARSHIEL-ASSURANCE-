# ARSHIEL ASSURANCE Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Identity & Authentication**: All reads and writes require an authenticated user (`request.auth != null`) with a verified email (`request.auth.token.email_verified == true`) for all writes.
2. **Organization & Owner Isolation**: Every operational record (`isoAssessments`, `legalRequirements`, `audits`, `documents`, `capas`, `masterData`, `notifications`, `settings`) stores `ownerId` and `orgId`. Non-admin users can only list, read, create, or update records belonging to their own `ownerId`. Super Administrators (bootstrapped email or `admins/{uid}`) may manage cross-organization governance.
3. **Immutable Records**: `restrictionLogs` and `auditLogs` are append-only — updates and deletes are strictly denied for all users. Legal records (`legalRequirements`), completed audits (`audits` with `status == 'Completed'`), and approved documents (`documents` with `status == 'Approved'`) cannot be deleted by non-admins, and completed/approved terminal states cannot be modified by non-admins.
4. **Privilege Escalation Prevention**: Users cannot write to `/admins/{uid}`. On `/users/{uid}`, users creating their own profile cannot self-assign `Super Administrator` unless they are the bootstrapped admin, and cannot modify their `role` field on update.
5. **Authorization Control Integrity**: Only Super Administrators (`isAdmin()`) can approve or modify `serviceAuthorizations` approval/authorization status (`approvalStatus`, `authStatus`, `verificationStatus`). Ordinary users cannot override service restrictions.
6. **PII Isolation**: `/users/{userId}` documents (containing email) are strictly readable only by `request.auth.uid == userId` or `isAdmin()`.
7. **Strict Validation & Size Bounds**: Every document ID passes `isValidId(id)` (`^[a-zA-Z0-9_\-]+$`, `<= 128` chars), every string has explicit `.size()` limits, every create enforces `keys().hasAll(...) && keys().hasOnly(...)`, and every update enforces `affectedKeys().hasOnly(...)` + `isValid[Entity](incoming())` + immutable `ownerId`/`createdAt`.

## 2. The "Dirty Dozen" Adversarial Test Payloads
1. **Unauthenticated Read**: `GET /isoAssessments/asmt-1` with `auth = null` -> MUST FAIL (`PERMISSION_DENIED`).
2. **Unverified Email Write**: `CREATE /audits/aud-1` with `email_verified = false` -> MUST FAIL.
3. **Self-Assigned Super Admin Escalation**: `CREATE /users/u1` setting `role: "Super Administrator"` by non-admin -> MUST FAIL.
4. **Role Mutation on Update**: `UPDATE /users/u1` changing `role` from `"Lead Auditor"` to `"Super Administrator"` -> MUST FAIL.
5. **Cross-User PII Leak**: `GET /users/victimUid` by another signed-in user -> MUST FAIL.
6. **Cross-Tenant List Scraping**: `LIST /audits` without matching `ownerId == request.auth.uid` by non-admin -> MUST FAIL.
7. **Shadow Field Injection**: `CREATE /capas/capa-1` with extra ghost field `isApprovedOverride: true` -> MUST FAIL (`hasOnly`).
8. **Owner Spoofing**: `CREATE /documents/doc-1` with `ownerId: "other-uid"` -> MUST FAIL.
9. **Terminal State Tampering**: `UPDATE /documents/doc-1` when `existing().status == "Approved"` by non-admin -> MUST FAIL.
10. **Unauthorized Service Restriction Override**: `UPDATE /serviceAuthorizations/svc-1` changing `approvalStatus` to `"Approved for Delivery"` by non-admin -> MUST FAIL.
11. **Immutable Audit Trail Tampering**: `UPDATE` or `DELETE /auditLogs/log-1` or `/restrictionLogs/rlog-1` -> MUST FAIL.
12. **Resource Poisoning / Invalid ID**: `CREATE /masterData/bad..id!!` or 2KB `docNumber` string -> MUST FAIL.
