import React, { useMemo } from 'react';
import {
  X,
  Bell,
  ShieldAlert,
  AlertTriangle,
  CalendarClock,
  Scale,
  Award,
  CheckSquare,
  Check,
  ArrowRight,
} from 'lucide-react';
import { useAssurance } from '../context/AssuranceContext';
import type { ModuleId } from '../types/assurance';

interface LiveAlertItem {
  id: string;
  source: 'notification' | 'capa' | 'audit' | 'cert' | 'legal' | 'risk' | 'security';
  severity: 'Critical' | 'Warning' | 'Info';
  title: string;
  detail: string;
  targetModule: ModuleId;
  notificationId?: string;
}

export function NotificationCenterDrawer({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (m: ModuleId) => void;
}) {
  const {
    notifications,
    capas,
    audits,
    certificationApplications,
    legalRequirements,
    risks,
    securityAlerts,
    can,
    markNotificationRead,
  } = useAssurance();

  const aggregatedAlerts = useMemo<LiveAlertItem[]>(() => {
    const list: LiveAlertItem[] = [];
    const today = new Date().toISOString().slice(0, 10);

    // 1. Open Security Alerts (if user can view activity intelligence)
    if (can('activity-intelligence', 'view')) {
      securityAlerts
        .filter((a) => a.status === 'Open' || a.status === 'Investigating')
        .slice(0, 6)
        .forEach((a) => {
          list.push({
            id: `sec_${a.id}`,
            source: 'security',
            severity: a.severity === 'Critical' || a.severity === 'High' ? 'Critical' : 'Warning',
            title: a.title,
            detail: `${a.category} · ${a.status}`,
            targetModule: 'activity-intelligence',
          });
        });
    }

    // 2. Critical / High Residual Risks
    if (can('risk-intelligence', 'view')) {
      risks
        .filter((r) => r.residualScore >= 16 && r.status !== 'Closed')
        .slice(0, 5)
        .forEach((r) => {
          list.push({
            id: `rsk_${r.id}`,
            source: 'risk',
            severity: 'Critical',
            title: `Critical Residual Risk: ${r.title}`,
            detail: `${r.riskRef} · Score ${r.residualScore} (${r.category})`,
            targetModule: 'risk-intelligence',
          });
        });
    }

    // 3. Overdue CAPAs
    if (can('capa', 'view')) {
      capas
        .filter((c) => c.status === 'Overdue' || (c.targetDate && c.targetDate < today && c.status !== 'Closed'))
        .slice(0, 5)
        .forEach((c) => {
          list.push({
            id: `capa_${c.id}`,
            source: 'capa',
            severity: c.priority === 'Critical' ? 'Critical' : 'Warning',
            title: `Overdue CAPA: ${c.capaRef}`,
            detail: `${c.findingDescription.slice(0, 90)} (Due ${c.targetDate || 'N/A'})`,
            targetModule: 'capa',
          });
        });
    }

    // 4. Certification Surveillance / Renewal Alerts
    if (can('certification-coord', 'view')) {
      certificationApplications
        .filter((c) => c.stage === 'Renewal Alert' || c.stage === 'Surveillance Due')
        .slice(0, 5)
        .forEach((c) => {
          list.push({
            id: `cert_${c.id}`,
            source: 'cert',
            severity: 'Warning',
            title: `${c.stage}: ${c.standardCode}`,
            detail: `${c.clientName} · Ref ${c.applicationRef}`,
            targetModule: 'certification-coord',
          });
        });
    }

    // 5. Unverified Legal Requirements
    if (can('legal-compliance', 'view')) {
      const unverified = legalRequirements.filter(
        (l) => l.verificationStatus === 'UNVERIFIED – OFFICIAL SOURCE REVIEW REQUIRED'
      );
      if (unverified.length > 0) {
        list.push({
          id: 'legal_unverified_summary',
          source: 'legal',
          severity: 'Warning',
          title: `${unverified.length} Legal Entries Require Official Source Verification`,
          detail: 'Verify against official Indian Central / State gazette portals before closure.',
          targetModule: 'legal-compliance',
        });
      }
    }

    // 6. Upcoming Planned Audits (next 14 days)
    if (can('audit-planning', 'view')) {
      const in14Days = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
      audits
        .filter((a) => a.status === 'Planned' && a.auditDate && a.auditDate >= today && a.auditDate <= in14Days)
        .slice(0, 4)
        .forEach((a) => {
          list.push({
            id: `aud_${a.id}`,
            source: 'audit',
            severity: 'Info',
            title: `Upcoming Audit: ${a.title}`,
            detail: `${a.auditRef} · Scheduled ${a.auditDate} · ${a.leadAuditor || 'Lead TBD'}`,
            targetModule: 'audit-planning',
          });
        });
    }

    // 7. Persisted Unread Notifications
    notifications
      .filter((n) => !n.read)
      .slice(0, 8)
      .forEach((n) => {
        list.push({
          id: `notif_${n.id}`,
          source: 'notification',
          severity: n.severity,
          title: n.title,
          detail: n.message || n.category || 'System notification',
          targetModule: 'dashboard',
          notificationId: n.id,
        });
      });

    return list;
  }, [notifications, capas, audits, certificationApplications, legalRequirements, risks, securityAlerts, can]);

  if (!open) return null;

  const getIcon = (source: LiveAlertItem['source']) => {
    switch (source) {
      case 'security':
        return ShieldAlert;
      case 'risk':
        return AlertTriangle;
      case 'capa':
        return CheckSquare;
      case 'cert':
        return Award;
      case 'legal':
        return Scale;
      case 'audit':
        return CalendarClock;
      default:
        return Bell;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-[1px]">
      <div className="w-full max-w-md bg-white dark:bg-[#0B1F3A] h-full border-l border-slate-200 dark:border-[#087BFF]/30 flex flex-col shadow-2xl">
        <div className="px-5 py-4 bg-[#071329] text-white border-b border-[#087BFF]/25 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Bell className="w-5 h-5 text-[#00D4FF] shrink-0" />
            <div className="min-w-0">
              <h2 className="font-display text-sm font-bold truncate">
                Centralized Notification &amp; Alert Center
              </h2>
              <p className="text-[11px] text-slate-400 truncate">
                {aggregatedAlerts.length} live operational alerts across 8 divisions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notification center"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {aggregatedAlerts.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                All Clear — No Pending Alerts
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Live alerts automatically surface here for overdue CAPAs, critical risks, upcoming audits, certification renewals, and security events.
              </p>
            </div>
          ) : (
            aggregatedAlerts.map((item) => {
              const Icon = getIcon(item.source);
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    item.severity === 'Critical'
                      ? 'bg-red-50/70 dark:bg-red-950/30 border-red-200 dark:border-red-500/35'
                      : item.severity === 'Warning'
                      ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/35'
                      : 'bg-slate-50 dark:bg-[#071329] border-slate-200 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <Icon
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        item.severity === 'Critical'
                          ? 'text-red-600 dark:text-red-400'
                          : item.severity === 'Warning'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-[#087BFF]'
                      }`}
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {item.detail}
                      </div>
                      <div className="pt-1 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onNavigate(item.targetModule);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#087BFF] hover:underline cursor-pointer"
                        >
                          Open Module <ArrowRight className="w-3 h-3" />
                        </button>
                        {item.notificationId && (
                          <button
                            type="button"
                            onClick={() => markNotificationRead(item.notificationId!)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 cursor-pointer"
                          >
                            <Check className="w-3 h-3" /> Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
