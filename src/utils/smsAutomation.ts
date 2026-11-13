import { NoticeItem } from '../context/SchoolDataContext';

export type SmsGatewayId = 'ssl_wireless' | 'mims' | 'bulksmsbd' | 'custom';

export type NotificationEventType =
  | 'status_approved'
  | 'status_rejected'
  | 'status_waitlist'
  | 'application_submitted'
  | 'deadline_reminder';

export interface SmsTriggerFlags {
  onApplicationSubmitted: boolean;
  onStatusApproved: boolean;
  onStatusRejected: boolean;
  onStatusWaitlist: boolean;
  onDeadlineReminder: boolean;
}

export interface SmsTemplateSet {
  approvedBn: string;
  waitlistBn: string;
  rejectedBn: string;
  submittedBn: string;
  deadlineReminderBn: string;
}

export interface DeadlineReminderConfig {
  daysBeforeDeadline: number;
  notifyOwnerEmail: boolean;
  notifyOwnerPhone: boolean;
  ownerAlertPhone: string;
  notifyIncompleteParents: boolean;
  lastPreparedAt?: string;
}

export interface SmsSettingsData {
  enabled: boolean;
  gateway: SmsGatewayId;
  senderId: string;
  secretConfiguredOnServer: boolean;
  triggers: SmsTriggerFlags;
  templates: SmsTemplateSet;
  reminderConfig: DeadlineReminderConfig;
  updatedAt?: string;
  updatedBy?: string;
}

export interface NotificationQueueItem {
  id: string;
  eventType: NotificationEventType;
  channel: 'sms';
  recipientPhone: string;
  recipientRole: 'guardian' | 'owner';
  message: string;
  applicationId?: string | null;
  applicationNo?: string | null;
  studentName?: string | null;
  appliedClass?: string | null;
  targetStatus?: string | null;
  gateway: SmsGatewayId;
  status: 'queued' | 'skipped_disabled' | 'sent' | 'failed';
  createdByEmail: string;
  createdAt?: any;
}

export interface SmsGatewayMeta {
  id: SmsGatewayId;
  name: { bn: string; en: string };
  endpointDoc: string;
  secretEnvHint: string;
}

export const SMS_GATEWAY_OPTIONS: SmsGatewayMeta[] = [
  {
    id: 'ssl_wireless',
    name: { bn: 'SSL Wireless (এসএসএল ওয়্যারলেস)', en: 'SSL Wireless (Bangladesh)' },
    endpointDoc: 'https://smsplus.sslwireless.com/api/v3/send-sms',
    secretEnvHint: 'SSL_API_TOKEN & SSL_SID',
  },
  {
    id: 'mims',
    name: { bn: 'MIMS SMS (মিমস এসএমএস)', en: 'MIMS SMS Bangladesh' },
    endpointDoc: 'https://esms.mimsms.com/smsapi',
    secretEnvHint: 'MIMS_API_KEY & MIMS_SENDER_ID',
  },
  {
    id: 'bulksmsbd',
    name: { bn: 'BulkSMSBD (বাল্ক এসএমএস বিডি)', en: 'BulkSMSBD' },
    endpointDoc: 'https://bulksmsbd.net/api/smsapi',
    secretEnvHint: 'BULKSMS_API_KEY',
  },
  {
    id: 'custom',
    name: { bn: 'কাস্টম গেটওয়ে (Custom REST)', en: 'Custom Bangladeshi Gateway' },
    endpointDoc: 'Configured in Firebase Cloud Functions',
    secretEnvHint: 'CUSTOM_SMS_API_KEY',
  },
];

export const DEFAULT_SMS_SETTINGS: SmsSettingsData = {
  enabled: false,
  gateway: 'ssl_wireless',
  senderId: '',
  secretConfiguredOnServer: false,
  triggers: {
    onApplicationSubmitted: false,
    onStatusApproved: true,
    onStatusRejected: true,
    onStatusWaitlist: true,
    onDeadlineReminder: true,
  },
  templates: {
    approvedBn:
      'অভিনন্দন! {schoolName}-এ {studentName} ({class}) এর ভর্তি আবেদন ({appNo}) অনুমোদিত হয়েছে। নির্ধারিত সময়ের মধ্যে অফিসে যোগাযোগ করুন।',
    waitlistBn:
      'প্রিয় অভিভাবক, {schoolName}-এ {studentName} ({class}) এর আবেদন ({appNo}) অপেক্ষমাণ তালিকায় রয়েছে। আসন খালি হলে জানানো হবে।',
    rejectedBn:
      'দুঃখিত, {schoolName}-এ {studentName} ({class}) এর আবেদন ({appNo}) বর্তমানে গৃহীত হয়নি। বিস্তারিত জানতে বিদ্যালয় অফিসে যোগাযোগ করুন।',
    submittedBn:
      'ধন্যবাদ! {schoolName}-এ {studentName} ({class}) এর ভর্তি আবেদন জমা হয়েছে। আবেদন নং: {appNo}। স্ট্যাটাস ওয়েবসাইটে দেখুন।',
    deadlineReminderBn:
      'রিমাইন্ডার: {schoolName}-এর ভর্তি আবেদনের শেষ তারিখ {deadline} (বাকি {daysLeft} দিন)। সময়মতো আবেদন সম্পন্ন করুন।',
  },
  reminderConfig: {
    daysBeforeDeadline: 3,
    notifyOwnerEmail: true,
    notifyOwnerPhone: false,
    ownerAlertPhone: '',
    notifyIncompleteParents: false,
  },
};

export function normalizeSmsSettings(raw: Partial<SmsSettingsData> | null | undefined): SmsSettingsData {
  if (!raw) return DEFAULT_SMS_SETTINGS;
  const validGateways: SmsGatewayId[] = ['ssl_wireless', 'mims', 'bulksmsbd', 'custom'];
  const gateway = raw.gateway && validGateways.includes(raw.gateway) ? raw.gateway : DEFAULT_SMS_SETTINGS.gateway;

  return {
    enabled: Boolean(raw.enabled),
    gateway,
    senderId: typeof raw.senderId === 'string' ? raw.senderId.slice(0, 30) : '',
    secretConfiguredOnServer: Boolean(raw.secretConfiguredOnServer),
    triggers: {
      onApplicationSubmitted: raw.triggers?.onApplicationSubmitted ?? DEFAULT_SMS_SETTINGS.triggers.onApplicationSubmitted,
      onStatusApproved: raw.triggers?.onStatusApproved ?? DEFAULT_SMS_SETTINGS.triggers.onStatusApproved,
      onStatusRejected: raw.triggers?.onStatusRejected ?? DEFAULT_SMS_SETTINGS.triggers.onStatusRejected,
      onStatusWaitlist: raw.triggers?.onStatusWaitlist ?? DEFAULT_SMS_SETTINGS.triggers.onStatusWaitlist,
      onDeadlineReminder: raw.triggers?.onDeadlineReminder ?? DEFAULT_SMS_SETTINGS.triggers.onDeadlineReminder,
    },
    templates: {
      approvedBn:
        typeof raw.templates?.approvedBn === 'string' && raw.templates.approvedBn.trim()
          ? raw.templates.approvedBn.slice(0, 480)
          : DEFAULT_SMS_SETTINGS.templates.approvedBn,
      waitlistBn:
        typeof raw.templates?.waitlistBn === 'string' && raw.templates.waitlistBn.trim()
          ? raw.templates.waitlistBn.slice(0, 480)
          : DEFAULT_SMS_SETTINGS.templates.waitlistBn,
      rejectedBn:
        typeof raw.templates?.rejectedBn === 'string' && raw.templates.rejectedBn.trim()
          ? raw.templates.rejectedBn.slice(0, 480)
          : DEFAULT_SMS_SETTINGS.templates.rejectedBn,
      submittedBn:
        typeof raw.templates?.submittedBn === 'string' && raw.templates.submittedBn.trim()
          ? raw.templates.submittedBn.slice(0, 480)
          : DEFAULT_SMS_SETTINGS.templates.submittedBn,
      deadlineReminderBn:
        typeof raw.templates?.deadlineReminderBn === 'string' && raw.templates.deadlineReminderBn.trim()
          ? raw.templates.deadlineReminderBn.slice(0, 480)
          : DEFAULT_SMS_SETTINGS.templates.deadlineReminderBn,
    },
    reminderConfig: {
      daysBeforeDeadline: Math.max(1, Math.min(30, Number(raw.reminderConfig?.daysBeforeDeadline) || 3)),
      notifyOwnerEmail: raw.reminderConfig?.notifyOwnerEmail ?? true,
      notifyOwnerPhone: raw.reminderConfig?.notifyOwnerPhone ?? false,
      ownerAlertPhone:
        typeof raw.reminderConfig?.ownerAlertPhone === 'string'
          ? raw.reminderConfig.ownerAlertPhone.replace(/[^0-9]/g, '').slice(0, 11)
          : '',
      notifyIncompleteParents: raw.reminderConfig?.notifyIncompleteParents ?? false,
      lastPreparedAt: typeof raw.reminderConfig?.lastPreparedAt === 'string' ? raw.reminderConfig.lastPreparedAt : undefined,
    },
    updatedAt: raw.updatedAt,
    updatedBy: raw.updatedBy,
  };
}

export function renderSmsTemplate(
  template: string,
  vars: {
    schoolName?: string;
    studentName?: string;
    appNo?: string;
    className?: string;
    deadline?: string;
    daysLeft?: string | number;
  }
): string {
  return template
    .replace(/\{schoolName\}/g, vars.schoolName || '')
    .replace(/\{studentName\}/g, vars.studentName || '')
    .replace(/\{appNo\}/g, vars.appNo || '')
    .replace(/\{class\}/g, vars.className || '')
    .replace(/\{deadline\}/g, vars.deadline || '')
    .replace(/\{daysLeft\}/g, String(vars.daysLeft ?? ''))
    .trim()
    .slice(0, 480);
}

export function mapStatusToNotificationEvent(
  status: 'pending' | 'approved' | 'waitlist' | 'rejected'
): NotificationEventType | null {
  if (status === 'approved') return 'status_approved';
  if (status === 'rejected') return 'status_rejected';
  if (status === 'waitlist') return 'status_waitlist';
  return null;
}

export function prepareStatusNotificationPayload(params: {
  targetStatus: 'pending' | 'approved' | 'waitlist' | 'rejected';
  phone: string;
  studentName: string;
  appliedClass: string;
  applicationId: string;
  applicationNo: string;
  schoolNameBn: string;
  smsSettings: SmsSettingsData;
  actorEmail: string;
}): Omit<NotificationQueueItem, 'id' | 'createdAt'> | null {
  const eventType = mapStatusToNotificationEvent(params.targetStatus);
  if (!eventType) return null;

  const cleanPhone = params.phone.replace(/[^0-9]/g, '');
  if (!/^01[3-9]\d{8}$/.test(cleanPhone)) {
    return null;
  }

  let template = params.smsSettings.templates.approvedBn;
  let triggerActive = params.smsSettings.triggers.onStatusApproved;

  if (eventType === 'status_waitlist') {
    template = params.smsSettings.templates.waitlistBn;
    triggerActive = params.smsSettings.triggers.onStatusWaitlist;
  } else if (eventType === 'status_rejected') {
    template = params.smsSettings.templates.rejectedBn;
    triggerActive = params.smsSettings.triggers.onStatusRejected;
  }

  const message = renderSmsTemplate(template, {
    schoolName: params.schoolNameBn,
    studentName: params.studentName,
    appNo: params.applicationNo,
    className: params.appliedClass,
  });

  const shouldQueue = params.smsSettings.enabled && triggerActive;

  return {
    eventType,
    channel: 'sms',
    recipientPhone: cleanPhone,
    recipientRole: 'guardian',
    message,
    applicationId: params.applicationId,
    applicationNo: params.applicationNo,
    studentName: params.studentName.slice(0, 100),
    appliedClass: params.appliedClass.slice(0, 50),
    targetStatus: params.targetStatus,
    gateway: params.smsSettings.gateway,
    status: shouldQueue ? 'queued' : 'skipped_disabled',
    createdByEmail: params.actorEmail,
  };
}

export interface DeadlineReminderSummary {
  hasDeadline: boolean;
  endDate: string | null;
  daysLeft: number | null;
  shouldTriggerWindow: boolean;
  isExpired: boolean;
}

/**
 * Evaluates active admission deadline against current Bangladesh Standard Time (UTC+6).
 */
export function getDeadlineReminderSummary(
  admissionNotice: NoticeItem | undefined,
  daysBeforeDeadline: number
): DeadlineReminderSummary {
  if (!admissionNotice || !admissionNotice.admissionActive || !admissionNotice.endDate) {
    return {
      hasDeadline: false,
      endDate: null,
      daysLeft: null,
      shouldTriggerWindow: false,
      isExpired: false,
    };
  }

  const parts = admissionNotice.endDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return {
      hasDeadline: false,
      endDate: admissionNotice.endDate,
      daysLeft: null,
      shouldTriggerWindow: false,
      isExpired: false,
    };
  }

  const [y, m, d] = parts;
  // End of day in BD (UTC+6) = UTC 17:59:59 of the same date
  const deadlineMs = Date.UTC(y, m - 1, d, 17, 59, 59, 999);
  const diffMs = deadlineMs - Date.now();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isExpired = diffMs < 0;

  return {
    hasDeadline: true,
    endDate: admissionNotice.endDate,
    daysLeft: Math.max(0, daysLeft),
    shouldTriggerWindow: !isExpired && daysLeft <= daysBeforeDeadline,
    isExpired,
  };
}
