import React, { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { appCheckStatus } from '../../firebase/config';
import {
  DEFAULT_SMS_SETTINGS,
  SMS_GATEWAY_OPTIONS,
  SmsGatewayId,
  SmsSettingsData,
  getDeadlineReminderSummary,
  renderSmsTemplate,
} from '../../utils/smsAutomation';
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  CloudCog,
  KeyRound,
  Loader2,
  Lock,
  MessageSquareMore,
  RotateCcw,
  Save,
  Send,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

interface AutomationSmsTabProps {
  onNotify: (text: string, type?: 'success' | 'error') => void;
}

export const AutomationSmsTab: React.FC<AutomationSmsTabProps> = ({ onNotify }) => {
  const { lang, t, formatNumber } = useLanguage();
  const { user, isOwner } = useAuth();
  const {
    schoolSettings,
    admissionNotice,
    smsSettings,
    notificationQueue,
    updateSmsSettings,
    queueNotification,
    deleteNotificationItem,
  } = useSchoolData();

  const [draft, setDraft] = useState<SmsSettingsData>(smsSettings);
  const [saving, setSaving] = useState(false);
  const [testingReminder, setTestingReminder] = useState(false);

  useEffect(() => {
    setDraft(smsSettings);
  }, [smsSettings]);

  const deadlineSummary = useMemo(
    () => getDeadlineReminderSummary(admissionNotice, draft.reminderConfig.daysBeforeDeadline),
    [admissionNotice, draft.reminderConfig.daysBeforeDeadline]
  );

  const selectedGatewayMeta = useMemo(
    () => SMS_GATEWAY_OPTIONS.find((g) => g.id === draft.gateway) || SMS_GATEWAY_OPTIONS[0],
    [draft.gateway]
  );

  if (!isOwner) {
    return (
      <div className="bg-surface-card rounded-[var(--radius-card)] p-8 border border-danger/35 text-center space-y-2">
        <Lock className="w-8 h-8 text-danger mx-auto" />
        <h3 className="font-heading font-bold text-lg text-ink">
          {t('শুধুমাত্র প্রধান শিক্ষক (Owner) অনুমোদিত', 'Restricted to School Owner')}
        </h3>
        <p className="text-xs text-ink-muted">
          {t(
            'SMS গেটওয়ে ও অটোমেশন সেটিংস শুধুমাত্র প্রতিষ্ঠানের প্রধান দেখতে ও পরিবর্তন করতে পারেন।',
            'SMS gateway configuration and automation logs are restricted to the Owner role.'
          )}
        </p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      draft.reminderConfig.notifyOwnerPhone &&
      draft.reminderConfig.ownerAlertPhone &&
      !/^01[3-9]\d{8}$/.test(draft.reminderConfig.ownerAlertPhone)
    ) {
      onNotify(
        t(
          'মালিক/অধ্যক্ষের অ্যালার্ট মোবাইল নম্বরটি সঠিক ১১ ডিজিটের হতে হবে (যেমন: 01XXXXXXXXX)।',
          'Owner alert phone must be a valid 11-digit BD mobile number (e.g. 01XXXXXXXXX).'
        ),
        'error'
      );
      return;
    }

    setSaving(true);
    try {
      await updateSmsSettings(draft);
      onNotify(t('SMS ও অটোমেশন সেটিংস সংরক্ষিত হয়েছে!', 'SMS & automation settings saved!'));
    } catch (err) {
      console.error(err);
      onNotify(t('সেটিংস সংরক্ষণে সমস্যা হয়েছে।', 'Failed to save SMS settings.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetTemplates = () => {
    setDraft((prev) => ({
      ...prev,
      templates: { ...DEFAULT_SMS_SETTINGS.templates },
    }));
    onNotify(
      t(
        'নমুনা বাংলা টেমপ্লেট পুনরুদ্ধার করা হয়েছে। সংরক্ষণ বাটনে ক্লিক করুন।',
        'Default Bangla templates restored. Click Save to apply.'
      )
    );
  };

  const handleQueueTestReminder = async () => {
    const targetPhone =
      (draft.reminderConfig.ownerAlertPhone || schoolSettings.phonePrimary || '').replace(/[^0-9]/g, '');

    if (!/^01[3-9]\d{8}$/.test(targetPhone)) {
      onNotify(
        t(
          'টেস্ট পেলোড তৈরি করতে আগে ১১ ডিজিটের Owner অ্যালার্ট নম্বর (017...) দিন।',
          'Please enter a valid 11-digit Owner alert mobile number first.'
        ),
        'error'
      );
      return;
    }

    setTestingReminder(true);
    try {
      const rendered = renderSmsTemplate(draft.templates.deadlineReminderBn, {
        schoolName: schoolSettings.nameBn,
        deadline: deadlineSummary.endDate || '2026-12-31',
        daysLeft: deadlineSummary.daysLeft ?? draft.reminderConfig.daysBeforeDeadline,
      });

      await queueNotification({
        eventType: 'deadline_reminder',
        channel: 'sms',
        recipientPhone: targetPhone,
        recipientRole: 'owner',
        message: rendered,
        gateway: draft.gateway,
        status: draft.enabled ? 'queued' : 'skipped_disabled',
        createdByEmail: user?.email || 'owner@school.com',
      });

      onNotify(
        t(
          'ডেডলাইন রিমাইন্ডার পেলোড কিউতে প্রস্তুত করা হয়েছে।',
          'Sample deadline reminder payload prepared in notification queue.'
        )
      );
    } catch (err) {
      console.error(err);
      onNotify(t('রিমাইন্ডার পেলোড তৈরি করা যায়নি।', 'Failed to prepare reminder payload.'), 'error');
    } finally {
      setTestingReminder(false);
    }
  };

  const sampleRenderedApproved = renderSmsTemplate(draft.templates.approvedBn, {
    schoolName: schoolSettings.nameBn,
    studentName: 'তানভীর আহমেদ',
    className: 'Play',
    appNo: 'AA-20261114-DEMO1',
  });

  const sampleRenderedReminder = renderSmsTemplate(draft.templates.deadlineReminderBn, {
    schoolName: schoolSettings.nameBn,
    deadline: deadlineSummary.endDate || '2026-12-31',
    daysLeft: deadlineSummary.daysLeft ?? draft.reminderConfig.daysBeforeDeadline,
  });

  return (
    <div className="space-y-6">
      {/* Header & Top Status Indicators */}
      <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/35 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">
              <MessageSquareMore className="w-4 h-4" />
              <span>{t('অটোমেশন, SMS ও নিরাপত্তা (Owner Only)', 'Automation, SMS & Security (Owner Only)')}</span>
            </div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-ink">
              {t('SMS বিজ্ঞপ্তি কাঠামো ও ডেডলাইন রিমাইন্ডার', 'SMS Notification Readiness & Deadline Reminders')}
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-[1.7]">
              {t(
                'ভর্তি আবেদনের স্ট্যাটাস পরিবর্তনের সাথে সাথে নিরাপদ পেলোড প্রস্তুত হবে। পরবর্তীতে Cloud Function ও বাংলাদেশি SMS গেটওয়ের মাধ্যমে স্বয়ংক্রিয় ডেলিভারি যুক্ত করা যাবে।',
                'Automatically prepares sanitized notification payloads on status updates, ready for Firebase Cloud Functions and a Bangladeshi SMS gateway.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-btn)] text-xs font-bold border ${
                draft.enabled
                  ? 'bg-success-soft text-on-success-soft border-success/30'
                  : 'bg-warning-soft text-on-warning-soft border-warning/30'
              }`}
            >
              {draft.enabled ? <CheckCircle2 className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              <span>
                {draft.enabled
                  ? t('SMS অটোমেশন: সক্রিয় (প্রস্তুত)', 'SMS Queue: Enabled')
                  : t('SMS অটোমেশন: নিষ্ক্রিয় (প্রস্তুত)', 'SMS Queue: Disabled')}
              </span>
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-btn)] text-xs font-bold border ${
                appCheckStatus.configured
                  ? 'bg-success-soft text-on-success-soft border-success/30'
                  : 'bg-surface-2 text-ink-muted border-line/35'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {appCheckStatus.configured
                  ? t('App Check: সক্রিয়', 'App Check: Active')
                  : t('App Check: প্রস্তুত (Site Key বাকি)', 'App Check: Prepared')}
              </span>
            </span>
          </div>
        </div>

        {/* Cloud Function Integration Architecture Notice */}
        <div className="p-4 rounded-[var(--radius-card)] bg-surface-2 border border-line/30 flex items-start gap-3">
          <CloudCog className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
          <div className="text-xs text-ink-muted leading-[1.7] space-y-1">
            <strong className="text-ink block font-bold">
              {t(
                'গুরুত্বপূর্ণ নোট: প্রকৃত SMS পাঠাতে Cloud Function + বাংলাদেশি SMS গেটওয়ে প্রয়োজন হবে',
                'Architecture Note: Real SMS Delivery Requires Cloud Functions + Bangladeshi SMS Gateway'
              )}
            </strong>
            <p>
              {t(
                'বর্তমানে সাইটটি ফ্রি Spark প্ল্যানে চলায় কোনো পেইড SMS পাঠানো হচ্ছে না। যখন পেইড গেটওয়ে (যেমন SSL Wireless, MIMS, BulkSMSBD) যুক্ত করবেন, তখন Cloud Function এই অ্যাপের তৈরি করা notification_queue সংগ্রহ থেকে স্বয়ংক্রিয়ভাবে SMS পাঠাবে।',
                'No paid SMS is sent on the Spark plan. When ready to connect SSL Wireless, MIMS, or BulkSMSBD, deploy a Cloud Function listening to notification_queue/{notifId} with gateway secrets stored in Firebase Secret Manager.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main SMS Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Master Toggle & Trigger Selection */}
          <div className="bg-surface-card rounded-[var(--radius-card)] p-6 border border-line/35 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-line/20">
              <div>
                <h3 className="font-heading font-extrabold text-base text-ink">
                  {t('১. SMS অটোমেশন ও ট্রিগার নিয়ন্ত্রণ', '1. Master Switch & Event Triggers')}
                </h3>
                <p className="text-[11px] text-ink-muted">
                  {t('কোন কোন ঘটনায় SMS পেলোড কিউ হবে তা নির্ধারণ করুন', 'Choose which admission events queue SMS notifications')}
                </p>
              </div>
              <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-btn)] bg-surface-2 border border-line/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.enabled}
                  onChange={(e) => setDraft((prev) => ({ ...prev, enabled: e.target.checked }))}
                  className="w-4 h-4 accent-primary-600"
                />
                <span className="text-xs font-bold text-ink">{t('সক্রিয় করুন', 'Enable')}</span>
              </label>
            </div>

            <div className="space-y-2.5">
              {(
                [
                  {
                    key: 'onStatusApproved',
                    bn: 'আবেদন অনুমোদিত হলে (Pending → Approved)',
                    en: 'When application is Approved',
                  },
                  {
                    key: 'onStatusWaitlist',
                    bn: 'অপেক্ষমাণ তালিকায় রাখলে (Pending → Waitlist)',
                    en: 'When application is Waitlisted',
                  },
                  {
                    key: 'onStatusRejected',
                    bn: 'আবেদন বাতিল হলে (Pending → Rejected)',
                    en: 'When application is Rejected',
                  },
                  {
                    key: 'onApplicationSubmitted',
                    bn: 'নতুন আবেদন জমা হলে (Cloud Function ট্রিগার)',
                    en: 'On new application submitted (Cloud Function trigger)',
                  },
                  {
                    key: 'onDeadlineReminder',
                    bn: 'ভর্তির শেষ তারিখের আগে রিমাইন্ডার',
                    en: 'Before admission deadline expires',
                  },
                ] as const
              ).map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 cursor-pointer hover:border-line/50 transition-colors"
                >
                  <span className="text-xs font-semibold text-ink">{lang === 'bn' ? item.bn : item.en}</span>
                  <input
                    type="checkbox"
                    checked={draft.triggers[item.key]}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        triggers: { ...prev.triggers, [item.key]: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-primary-600 shrink-0"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* 2. Gateway Selection & Zero-Secret Credential Guidance */}
          <div className="bg-surface-card rounded-[var(--radius-card)] p-6 border border-line/35 shadow-xs space-y-4">
            <div className="pb-3 border-b border-line/20">
              <h3 className="font-heading font-extrabold text-base text-ink flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary-600" />
                <span>{t('২. বাংলাদেশি SMS গেটওয়ে ও নিরাপত্তা নীতি', '2. SMS Gateway & Credential Security')}</span>
              </h3>
              <p className="text-[11px] text-ink-muted mt-0.5">
                {t(
                  'নিরাপত্তার স্বার্থে কোনো API Key বা Password ব্রাউজারে সংরক্ষণ করা হয় না।',
                  'API keys and secrets are never stored in browser state or Firestore.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SMS_GATEWAY_OPTIONS.map((gw) => {
                const active = draft.gateway === gw.id;
                return (
                  <button
                    key={gw.id}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, gateway: gw.id as SmsGatewayId }))}
                    className={`p-3 rounded-[var(--radius-btn)] border-2 text-left transition-all ${
                      active
                        ? 'border-primary-600 bg-primary-100/20 dark:bg-surface-2'
                        : 'border-line/30 bg-surface hover:border-line/60'
                    }`}
                  >
                    <div className="text-xs font-bold text-ink">{gw.name[lang]}</div>
                    <div className="text-[10px] font-mono text-ink-muted mt-0.5 truncate">{gw.secretEnvHint}</div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  {t('মাস্কিং / সেন্ডার আইডি (Sender ID — নন-সিক্রেট)', 'Public Sender ID / Masking Label (Optional)')}
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={draft.senderId}
                  onChange={(e) => setDraft((prev) => ({ ...prev, senderId: e.target.value }))}
                  placeholder="e.g. SCHOOL_SMS"
                  className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs font-mono focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
                />
              </div>

              <div className="p-3 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 text-[11px] text-ink-muted space-y-1.5">
                <div className="font-bold text-ink">
                  {t('সার্ভার-সাইড ক্রেডেনশিয়াল (Cloud Function Secret Manager):', 'Server-Side Secrets (Firebase Secret Manager):')}
                </div>
                <div className="font-mono text-[10px] break-all">
                  Endpoint: {selectedGatewayMeta.endpointDoc}
                </div>
                <div className="font-mono text-[10px]">
                  Required Secrets: {selectedGatewayMeta.secretEnvHint}
                </div>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.secretConfiguredOnServer}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, secretConfiguredOnServer: e.target.checked }))
                  }
                  className="mt-0.5 w-4 h-4 accent-primary-600 shrink-0"
                />
                <span className="text-xs font-semibold text-ink leading-[1.6]">
                  {t(
                    'Cloud Function ও Firebase Secret Manager-এ গেটওয়ে API Key যুক্ত করা হয়েছে (Owner নিশ্চিতকরণ)',
                    'Gateway API credentials configured in Firebase Secret Manager (Owner confirmation)'
                  )}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* 3. Bangla Sample SMS Templates & Live Preview */}
        <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/35 shadow-xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-line/20">
            <div>
              <h3 className="font-heading font-extrabold text-base text-ink">
                {t('৩. বাংলা SMS টেমপ্লেট ও লাইভ প্রিভিউ', '3. Bangla Sample SMS Templates & Live Preview')}
              </h3>
              <p className="text-[11px] text-ink-muted mt-0.5">
                {t(
                  'ব্যবহারযোগ্য ভ্যারিয়েবল: {schoolName}, {studentName}, {appNo}, {class}, {deadline}, {daysLeft}',
                  'Placeholders: {schoolName}, {studentName}, {appNo}, {class}, {deadline}, {daysLeft}'
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetTemplates}
              className="px-3 py-1.5 rounded-[var(--radius-btn)] bg-surface-2 hover:bg-surface text-ink border border-line/30 text-xs font-bold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('ডিফল্ট টেমপ্লেট', 'Reset Samples')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                { key: 'approvedBn', label: t('অনুমোদিত (Approved) টেমপ্লেট', 'Approved Template') },
                { key: 'waitlistBn', label: t('অপেক্ষমাণ (Waitlist) টেমপ্লেট', 'Waitlist Template') },
                { key: 'rejectedBn', label: t('বাতিল (Rejected) টেমপ্লেট', 'Rejected Template') },
                { key: 'submittedBn', label: t('আবেদন গ্রহণ (Submitted) টেমপ্লেট', 'Application Submitted Template') },
                { key: 'deadlineReminderBn', label: t('ভর্তি ডেডলাইন রিমাইন্ডার টেমপ্লেট', 'Deadline Reminder Template') },
              ] as const
            ).map((tpl) => {
              const val = draft.templates[tpl.key];
              return (
                <div key={tpl.key} className={tpl.key === 'deadlineReminderBn' ? 'md:col-span-2' : ''}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="text-xs font-bold text-ink">{tpl.label}</label>
                    <span className="text-[10px] font-mono text-ink-muted tabular-nums">
                      {formatNumber(val.length)} / {formatNumber(480)}
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    maxLength={480}
                    value={val}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        templates: { ...prev.templates, [tpl.key]: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs leading-[1.7] focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
                  />
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-line/20">
            <div className="p-3.5 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 space-y-1">
              <span className="text-[11px] font-bold text-primary-700 dark:text-primary-300 block">
                {t('প্রিভিউ — অনুমোদন SMS:', 'Preview — Approved SMS:')}
              </span>
              <p className="text-xs text-ink leading-[1.7]">{sampleRenderedApproved}</p>
            </div>
            <div className="p-3.5 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 space-y-1">
              <span className="text-[11px] font-bold text-primary-700 dark:text-primary-300 block">
                {t('প্রিভিউ — ডেডলাইন রিমাইন্ডার SMS:', 'Preview — Deadline Reminder SMS:')}
              </span>
              <p className="text-xs text-ink leading-[1.7]">{sampleRenderedReminder}</p>
            </div>
          </div>
        </div>

        {/* 4. Admission Deadline Reminder Structure */}
        <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/35 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line/20">
            <div>
              <h3 className="font-heading font-extrabold text-base text-ink flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-primary-600" />
                <span>{t('৪. ভর্তি ডেডলাইন রিমাইন্ডার কাঠামো', '4. Admission Deadline Reminder Structure')}</span>
              </h3>
              <p className="text-[11px] text-ink-muted mt-0.5">
                {t(
                  'সময়সীমা শেষ হওয়ার আগে প্রধান শিক্ষক ও অসম্পূর্ণ আবেদনকারীদের সতর্কবার্তা পাঠানোর প্রস্তুতি।',
                  'Scheduled Cloud Function structure to alert the Owner and optional incomplete applicants before deadline.'
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={handleQueueTestReminder}
              disabled={testingReminder}
              className="px-4 py-2 rounded-[var(--radius-btn)] bg-surface-2 hover:bg-surface text-ink border border-line/35 text-xs font-bold flex items-center gap-1.5 self-start sm:self-center transition-colors"
            >
              {testingReminder ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-primary-600" />}
              <span>{t('নমুনা রিমাইন্ডার কিউ করুন', 'Queue Sample Reminder')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25">
              <span className="text-[11px] font-bold text-ink-muted block">
                {t('চলমান ভর্তি শেষ তারিখ (BD সময়)', 'Active Admission Deadline (BD Time)')}
              </span>
              <strong className="text-sm font-mono font-bold text-ink mt-1 block">
                {deadlineSummary.hasDeadline ? deadlineSummary.endDate : t('নির্ধারিত নয়', 'Not Scheduled')}
              </strong>
              <span className="text-[11px] text-ink-muted mt-0.5 block tabular-nums">
                {deadlineSummary.hasDeadline
                  ? deadlineSummary.isExpired
                    ? t('মেয়াদ উত্তীর্ণ', 'Deadline Passed')
                    : t(`বাকি ${formatNumber(deadlineSummary.daysLeft ?? 0)} দিন`, `${deadlineSummary.daysLeft} day(s) remaining`)
                  : t('নোটিশ বোর্ড থেকে সক্রিয় ভর্তি নোটিশ দিন', 'Activate an admission notice to track')}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('কত দিন আগে রিমাইন্ডার (Days Before)', 'Remind Days Before Deadline')}
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={draft.reminderConfig.daysBeforeDeadline}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    reminderConfig: {
                      ...prev.reminderConfig,
                      daysBeforeDeadline: Math.max(1, Math.min(30, Number(e.target.value) || 3)),
                    },
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm font-mono font-bold tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {t('Owner অ্যালার্ট মোবাইল নম্বর', 'Owner Alert Mobile Number')}
              </label>
              <input
                type="tel"
                maxLength={11}
                value={draft.reminderConfig.ownerAlertPhone}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    reminderConfig: {
                      ...prev.reminderConfig,
                      ownerAlertPhone: e.target.value.replace(/[^0-9]/g, ''),
                    },
                  }))
                }
                placeholder="01XXXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2.5 p-3 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 cursor-pointer text-xs font-semibold text-ink">
              <input
                type="checkbox"
                checked={draft.reminderConfig.notifyOwnerEmail}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    reminderConfig: { ...prev.reminderConfig, notifyOwnerEmail: e.target.checked },
                  }))
                }
                className="w-4 h-4 accent-primary-600"
              />
              <span>{t('Owner ইমেইল সতর্কতা', 'Notify Owner via Email')}</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 cursor-pointer text-xs font-semibold text-ink">
              <input
                type="checkbox"
                checked={draft.reminderConfig.notifyOwnerPhone}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    reminderConfig: { ...prev.reminderConfig, notifyOwnerPhone: e.target.checked },
                  }))
                }
                className="w-4 h-4 accent-primary-600"
              />
              <span>{t('Owner SMS সতর্কতা', 'Notify Owner via SMS')}</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 cursor-pointer text-xs font-semibold text-ink">
              <input
                type="checkbox"
                checked={draft.reminderConfig.notifyIncompleteParents}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    reminderConfig: { ...prev.reminderConfig, notifyIncompleteParents: e.target.checked },
                  }))
                }
                className="w-4 h-4 accent-primary-600"
              />
              <span>{t('অসম্পূর্ণ আবেদনকারীদের রিমাইন্ডার (ঐচ্ছিক)', 'Remind Incomplete Applicants (Opt-in)')}</span>
            </label>
          </div>

          <div className="p-3.5 rounded-[var(--radius-btn)] bg-surface-2 border border-line/25 text-xs text-ink-muted leading-[1.7]">
            <strong className="text-ink">{t('ভবিষ্যৎ Cron / Cloud Scheduler পরিকল্পনা:', 'Future Scheduler Setup:')} </strong>
            {t(
              'ভবিষ্যতে Cloud Function প্রতিদিন সকাল ৯টায় (Asia/Dhaka) notices সংগ্রহ পরীক্ষা করে শেষ তারিখের আগে এই নীতিমালা অনুযায়ী রিমাইন্ডার পাঠাবে। অসম্পূর্ণ আবেদনের জন্য অভিভাবকের সম্মতিসহ পৃথক ড্রাফট রিমাইন্ডার সংযুক্ত করা যাবে।',
              'A scheduled Cloud Function (09:00 Asia/Dhaka) will evaluate notices against daysBeforeDeadline and dispatch alerts using these preferences.'
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-[var(--radius-btn)] bg-primary-600 hover:bg-primary-700 text-on-primary text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('SMS ও রিমাইন্ডার সেটিংস সংরক্ষণ করুন', 'Save Automation Settings')}</span>
            </button>
          </div>
        </div>
      </form>

      {/* 5. Prepared Notification Queue & Trigger Logs */}
      <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/35 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-line/20">
          <div>
            <h3 className="font-heading font-extrabold text-base text-ink">
              {t('৫. প্রস্তুত নোটিফিকেশন কিউ ও ট্রিগার লগ (notification_queue)', '5. Prepared Notification Queue & Logs')}
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">
              {t(
                'আবেদনের স্ট্যাটাস পরিবর্তন করলে স্বয়ংক্রিয়ভাবে এখানে ফোন, বার্তা ও ইভেন্ট পেলোড তৈরি হয়।',
                'Payloads automatically prepared whenever an Owner or Moderator updates an application status.'
              )}
            </p>
          </div>
          <span className="px-3 py-1 rounded-[var(--radius-btn)] bg-surface-2 border border-line/30 text-xs font-mono font-bold text-ink tabular-nums">
            {t(`মোট রেকর্ড: ${formatNumber(notificationQueue.length)}`, `Total Events: ${notificationQueue.length}`)}
          </span>
        </div>

        {notificationQueue.length === 0 ? (
          <div className="p-8 text-center rounded-[var(--radius-card)] bg-surface-2 border border-line/25 text-xs text-ink-muted">
            {t(
              'এখনও কোনো নোটিফিকেশন পেলোড তৈরি হয়নি। কোনো আবেদনের স্ট্যাটাস Approved / Waitlist / Rejected করলে এখানে তা দেখা যাবে।',
              'No prepared payloads yet. Update an application status to Approved, Waitlist, or Rejected to generate a ready notification payload.'
            )}
          </div>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {notificationQueue.map((item) => {
              const dateLabel = item.createdAt?.toDate
                ? item.createdAt.toDate().toLocaleString()
                : item.createdAt?.seconds
                ? new Date(item.createdAt.seconds * 1000).toLocaleString()
                : '';

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-[var(--radius-card)] bg-surface-2 border border-line/25 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-ink">{item.recipientPhone}</span>
                      <span className="text-ink-muted">·</span>
                      <span className="font-bold text-primary-700 dark:text-primary-300">{item.eventType}</span>
                      {item.applicationNo && (
                        <>
                          <span className="text-ink-muted">·</span>
                          <span className="font-mono text-ink-muted">{item.applicationNo}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.status === 'sent' || item.status === 'queued'
                            ? 'bg-success-soft text-on-success-soft'
                            : item.status === 'failed'
                            ? 'bg-danger-soft text-on-danger-soft'
                            : 'bg-warning-soft text-on-warning-soft'
                        }`}
                      >
                        {item.status === 'skipped_disabled'
                          ? t('লগ প্রস্তুত (SMS বন্ধ)', 'Prepared (SMS Off)')
                          : item.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteNotificationItem(item.id)}
                        className="p-1 text-ink-muted hover:text-danger transition-colors"
                        title={t('মুছুন', 'Delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-ink bg-surface p-2.5 rounded-[var(--radius-input)] border border-line/20 leading-[1.7]">
                    {item.message}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-ink-muted font-mono">
                    <span>
                      Gateway: {item.gateway} · By: {item.createdByEmail}
                    </span>
                    {dateLabel && <span>{dateLabel}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Security Hardening & App Check Status */}
      <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/35 shadow-xs space-y-4">
        <div>
          <h3 className="font-heading font-extrabold text-base text-ink flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span>{t('৬. নিরাপত্তা সুরক্ষা ও App Check প্রস্তুতি', '6. Security Hardening & App Check Readiness')}</span>
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            {t(
              'পাবলিক ফর্ম ও অ্যাডমিন অ্যাক্সেস সুরক্ষার বর্তমান অবস্থা।',
              'Active anti-spam protections, role separation, and Firebase App Check configuration.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-[var(--radius-card)] bg-surface-2 border border-line/25 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">Firebase App Check</span>
              {appCheckStatus.configured ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-warning" />
              )}
            </div>
            <p className="text-[11px] text-ink-muted leading-[1.6]">
              {appCheckStatus.configured
                ? t(
                    `সক্রিয় (${appCheckStatus.provider})। Firebase Console থেকে এনফোর্সমেন্ট চালু করা যাবে।`,
                    `Initialized with ${appCheckStatus.provider}. Ready for enforcement in Firebase Console.`
                  )
                : t(
                    'কোড প্রস্তুত। চালু করতে .env-এ VITE_FIREBASE_APPCHECK_SITE_KEY যোগ করুন।',
                    'SDK integration ready. Add VITE_FIREBASE_APPCHECK_SITE_KEY to enable protection.'
                  )}
            </p>
          </div>

          <div className="p-4 rounded-[var(--radius-card)] bg-surface-2 border border-line/25 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">{t('স্প্যাম ও রেট-লিমিট সুরক্ষা', 'Rate Limit & Anti-Spam')}</span>
              <ShieldCheck className="w-4 h-4 text-success" />
            </div>
            <p className="text-[11px] text-ink-muted leading-[1.6]">
              {t(
                'ভর্তি ফরম ও ভিজিট বুকিংয়ে হানিপট ফিল্ড, ৬০-সেকেন্ড কুলডাউন এবং ২৪-ঘণ্টা ডুপ্লিকেট চেক সক্রিয়।',
                'Honeypot trap, 60-second cooldown, BD mobile regex, and 24-hour duplicate protection active.'
              )}
            </p>
          </div>

          <div className="p-4 rounded-[var(--radius-card)] bg-surface-2 border border-line/25 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">{t('Firestore Rules ও ভূমিকা বিচ্ছিন্নতা', 'Firestore Rules & RBAC')}</span>
              <ShieldAlert className="w-4 h-4 text-primary-600" />
            </div>
            <p className="text-[11px] text-ink-muted leading-[1.6]">
              {t(
                'SMS সেটিংস ও কিউ লগ কেবল Owner-এর জন্য সংরক্ষিত; মডারেটরদের জন্য সম্পূর্ণ বন্ধ।',
                'settings/sms and notification_queue reads locked to Owner only; inquiry updates restricted to status + timestamp.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
