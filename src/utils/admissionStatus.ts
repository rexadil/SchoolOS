import { NoticeItem } from '../context/SchoolDataContext';
import { schoolConfig } from '../config/schoolConfig';

export interface AdmissionClosedInfo {
  closed: boolean;
  reason?: 'inactive' | 'deadline';
  endDateRaw?: string;
  formattedEndDateBn?: string;
  formattedEndDateEn?: string;
}

/**
 * Parses an ISO date or YYYY-MM-DD string in Bangladesh Time (UTC+6).
 * Date-only strings like "2026-12-31" extend through 23:59:59+06:00.
 */
export function parseBangladeshDeadlineMs(dateStr?: string): number | null {
  if (!dateStr || !dateStr.trim()) return null;
  const trimmed = dateStr.trim();
  const isoStr = trimmed.includes('T')
    ? trimmed.includes('+') || trimmed.endsWith('Z')
      ? trimmed
      : `${trimmed}+06:00`
    : `${trimmed}T23:59:59+06:00`;

  const ms = new Date(isoStr).getTime();
  return Number.isNaN(ms) ? null : ms;
}

export function formatDeadlineDisplay(dateStr?: string): { bn?: string; en?: string } {
  const ms = parseBangladeshDeadlineMs(dateStr);
  if (ms === null) return {};
  try {
    const d = new Date(ms);
    return {
      bn: new Intl.DateTimeFormat('bn-BD', {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(d),
      en: new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(d),
    };
  } catch {
    const plain = dateStr?.split('T')[0];
    return { bn: plain, en: plain };
  }
}

export function getAdmissionClosedInfo(
  admissionNotice: NoticeItem | undefined,
  nowMs: number = Date.now()
): AdmissionClosedInfo {
  const effectiveEndDate =
    admissionNotice?.endDate?.trim() ||
    (!admissionNotice ? schoolConfig.admission.deadlineDate : undefined);

  const formatted = formatDeadlineDisplay(effectiveEndDate);
  const endDateRaw = effectiveEndDate ? effectiveEndDate.split('T')[0] : undefined;

  if (admissionNotice && admissionNotice.admissionActive === false) {
    return {
      closed: true,
      reason: 'inactive',
      endDateRaw,
      formattedEndDateBn: formatted.bn,
      formattedEndDateEn: formatted.en,
    };
  }

  const deadlineMs = parseBangladeshDeadlineMs(effectiveEndDate);
  if (deadlineMs !== null && nowMs > deadlineMs) {
    return {
      closed: true,
      reason: 'deadline',
      endDateRaw,
      formattedEndDateBn: formatted.bn,
      formattedEndDateEn: formatted.en,
    };
  }

  return {
    closed: false,
    endDateRaw,
    formattedEndDateBn: formatted.bn,
    formattedEndDateEn: formatted.en,
  };
}
