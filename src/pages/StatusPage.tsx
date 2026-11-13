import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolData } from '../context/SchoolDataContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { computeStatusVerifyHash } from '../utils/applicationNumber';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Home,
  Sparkles,
  Phone,
  FileText,
  Printer,
  XCircle,
  HelpCircle,
  MessageCircle,
  Loader2,
} from 'lucide-react';

interface StatusPageProps {
  onGoHome: () => void;
  onNavigateApply: () => void;
  initialAppNo?: string;
}

export interface PublicStatusResult {
  applicationNo: string;
  firstName: string;
  class: string;
  status: 'pending' | 'approved' | 'waitlist' | 'rejected';
  updatedAt?: any;
}

export const StatusPage: React.FC<StatusPageProps> = ({ onGoHome, onNavigateApply, initialAppNo = '' }) => {
  const { t } = useLanguage();
  const { schoolSettings, demoMode, getDemoApplicationStatus } = useSchoolData();

  const [appNumber, setAppNumber] = useState(initialAppNo);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusResult, setStatusResult] = useState<PublicStatusResult | null>(null);

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAppNo = appNumber.trim().toUpperCase();
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanAppNo) {
      setErrorMsg(t('অনুগ্রহ করে আবেদন ট্র্যাকিং নম্বরটি লিখুন।', 'Please enter your application tracking number.'));
      return;
    }

    if (!cleanPhone || cleanPhone.length < 11) {
      setErrorMsg(
        t(
          'অনুগ্রহ করে আবেদনকালে ব্যবহৃত ১১ ডিজিটের সঠিক অভিভাবক মোবাইল নম্বরটি দিন।',
          'Please enter the 11-digit guardian mobile number used during application.'
        )
      );
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setStatusResult(null);

    try {
      const expectedHash = await computeStatusVerifyHash(cleanAppNo, cleanPhone);

      // 1. If in Demo Mode, fetch from local demo store
      if (demoMode) {
        const demoStatus = getDemoApplicationStatus(cleanAppNo, expectedHash);
        if (demoStatus) {
          setStatusResult({
            applicationNo: cleanAppNo,
            firstName: demoStatus.firstName,
            class: demoStatus.class,
            status: demoStatus.status as any,
            updatedAt: demoStatus.updatedAt || new Date().toISOString(),
          });
        } else {
          // Unified not-found message to prevent enumeration
          setErrorMsg(
            t(
              'আবেদনটি খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক আবেদন ট্র্যাকিং নম্বর ও ১১ ডিজিটের মোবাইল নম্বর মিলিয়ে পুনরায় চেষ্টা করুন।',
              'Application not found. Please verify the tracking number and 11-digit guardian mobile number and try again.'
            )
          );
        }
        return;
      }

      // 2. In Live Mode, query public minimal doc: application_status/{cleanAppNo}
      const docRef = doc(db, 'application_status', cleanAppNo);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Uniform not-found error
        setErrorMsg(
          t(
            'আবেদনটি খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক আবেদন ট্র্যাকিং নম্বর ও ১১ ডিজিটের মোবাইল নম্বর মিলিয়ে পুনরায় চেষ্টা করুন।',
            'Application not found. Please verify the tracking number and 11-digit guardian mobile number and try again.'
          )
        );
        return;
      }

      const data = docSnap.data();

      // Check SHA-256 hash match to verify parent ownership without enumeration
      if (data.verifyHash !== expectedHash) {
        setErrorMsg(
          t(
            'আবেদনটি খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক আবেদন ট্র্যাকিং নম্বর ও ১১ ডিজিটের মোবাইল নম্বর মিলিয়ে পুনরায় চেষ্টা করুন।',
            'Application not found. Please verify the tracking number and 11-digit guardian mobile number and try again.'
          )
        );
        return;
      }

      setStatusResult({
        applicationNo: cleanAppNo,
        firstName: data.firstName,
        class: data.class,
        status: data.status,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toLocaleDateString('bn-BD') : data.updatedAt,
      });
    } catch (err: any) {
      console.error('Status query error:', err);
      // Fallback check demo store in case Firestore is unreachable
      const expectedHash = await computeStatusVerifyHash(cleanAppNo, cleanPhone);
      const demoFallback = getDemoApplicationStatus(cleanAppNo, expectedHash);
      if (demoFallback) {
        setStatusResult({
          applicationNo: cleanAppNo,
          firstName: demoFallback.firstName,
          class: demoFallback.class,
          status: demoFallback.status as any,
          updatedAt: demoFallback.updatedAt || new Date().toISOString(),
        });
      } else {
        setErrorMsg(
          t(
            'আবেদনটি খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক আবেদন ট্র্যাকিং নম্বর ও ১১ ডিজিটের মোবাইল নম্বর মিলিয়ে পুনরায় চেষ্টা করুন।',
            'Application not found. Please verify the tracking number and 11-digit guardian mobile number and try again.'
          )
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-surface text-ink py-10 px-4 sm:px-6 lg:px-8 focus:outline-none">
      <div className="max-w-2xl mx-auto">

        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-line/25">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-ink-muted hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            <Home className="w-4 h-4 text-primary-600" />
            <span>{t('মূল ওয়েবসাইটে ফিরে যান', 'Back to Homepage')}</span>
          </button>

          <span className="text-xs font-bold text-primary-700 dark:text-primary-300 uppercase tracking-widest">
            {schoolSettings.nameBn} · {t('স্ট্যাটাস পোর্টাল', 'Status Portal')}
          </span>
        </div>

        {/* Portal Card */}
        <div className="bg-surface-card rounded-[var(--radius-card)] border border-line/30 shadow-xl overflow-hidden">

          {/* Header Banner */}
          <div className="bg-primary-700 px-6 sm:px-8 py-6 text-on-primary">
            <div className="flex items-center gap-2 text-xs font-bold text-on-primary/85 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('ভর্তি আবেদন ট্র্যাকিং', 'Admission Status Tracker')}</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl">
              {t('ভর্তি আবেদনের বর্তমান অবস্থা', 'Check Application Status')}
            </h1>
            <p className="text-xs sm:text-sm text-on-primary/85 mt-1">
              {t(
                'আবেদন ট্র্যাকিং নম্বর ও অভিভাবকের মোবাইল নম্বর প্রদান করে আপনার সোনামণির ভর্তির অগ্রগতি জানুন।',
                'Enter tracking number and guardian mobile to check your child’s admission status.'
              )}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">

            {/* Search Form */}
            <form onSubmit={handleCheckStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  {t('আবেদন ট্র্যাকিং নম্বর *', 'Application Tracking Number *')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AA-20261110-3K8MNP"
                  value={appNumber}
                  onChange={(e) => setAppNumber(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-[var(--radius-input)] border border-line/40 text-sm font-mono tracking-wider text-ink placeholder:text-ink-muted focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none uppercase bg-surface"
                />
                <p className="text-[11px] text-ink-muted mt-1">
                  {t('আবেদন ফরম জমা দেওয়ার সময় পাওয়া অনন্য ট্র্যাকিং নম্বরটি দিন।', 'The unique tracking number received upon submitting application.')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  {t('অভিভাবকের মোবাইল নম্বর (১১ ডিজিট) *', "Guardian's Mobile Number (11 digits) *")}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-[var(--radius-input)] border border-line/40 text-sm font-mono text-ink placeholder:text-ink-muted focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none bg-surface"
                />
                <p className="text-[11px] text-ink-muted mt-1">
                  {t('আবেদন ফর্মে যে অভিভাবক নম্বরটি দেওয়া হয়েছিল সেটি হুবহু লিখুন।', 'Enter the exact guardian number provided on the application.')}
                </p>
              </div>

              {errorMsg && (
                <div className="p-4 bg-danger-soft rounded-[var(--radius-card)] border border-danger/30 text-on-danger-soft text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-on-primary font-extrabold text-sm rounded-[var(--radius-btn)] flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('অনুসন্ধান চলছে...', 'Checking status...')}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>{t('অবস্থা যাচাই করুন', 'Check Application Status')}</span>
                  </>
                )}
              </button>
            </form>

            {/* Status Result Display */}
            {statusResult && (
              <div className="mt-8 pt-6 border-t border-line/25 animate-in zoom-in-95 duration-200 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                    {t('আবেদনের ফলাফল', 'Application Result')}
                  </span>
                  <span className="px-3 py-1 rounded-[var(--radius-btn)] text-xs font-mono font-bold bg-primary-100 text-primary-900 border border-primary-300">
                    {statusResult.applicationNo}
                  </span>
                </div>

                {/* Status Badges & Explanations */}
                {statusResult.status === 'approved' && (
                  <div className="p-5 rounded-[var(--radius-card)] bg-success-soft border border-success/30 text-on-success-soft space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
                      <strong className="font-heading font-extrabold text-lg text-on-success-soft">
                        {t('ভর্তি অনুমোদিত (Approved)', 'Admission Approved!')}
                      </strong>
                    </div>
                    <p className="text-xs sm:text-sm text-on-success-soft/90 leading-[1.7]">
                      {t(
                        `অভিনন্দন! ${statusResult.firstName} এর ${statusResult.class} শ্রেণিতে প্রাথমিক ভর্তি আবেদন পর্যালোচনা শেষে চূড়ান্তভাবে অনুমোদিত হয়েছে। দ্রুত প্রয়োজনীয় জন্ম নিবন্ধন সনদ ও ২ কপি ছবি নিয়ে স্কুলে যোগাযোগ করুন।`,
                        `Congratulations! ${statusResult.firstName}’s admission application for ${statusResult.class} has been officially approved. Please visit campus with required documents to complete admission.`
                      )}
                    </p>
                  </div>
                )}

                {statusResult.status === 'pending' && (
                  <div className="p-5 rounded-[var(--radius-card)] bg-warning-soft border border-warning/30 text-on-warning-soft space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-6 h-6 text-warning shrink-0" />
                      <strong className="font-heading font-extrabold text-lg text-on-warning-soft">
                        {t('যাচাই চলছে (Pending Review)', 'Pending Under Review')}
                      </strong>
                    </div>
                    <p className="text-xs sm:text-sm text-on-warning-soft/90 leading-[1.7]">
                      {t(
                        `আবেদনটি নিরাপদে গৃহীত হয়েছে। ভর্তি কমিটি বর্তমানে আবেদন ও পেমেন্ট TrxID যাচাই করছে। চূড়ান্ত ফলাফল এসএমএস ও এখানে প্রকাশ করা হবে।`,
                        `Your application has been received safely. The committee is reviewing the application and fee transaction. Updates will appear here.`
                      )}
                    </p>
                  </div>
                )}

                {statusResult.status === 'waitlist' && (
                  <div className="p-5 rounded-[var(--radius-card)] bg-accent-soft border border-accent/30 text-on-accent-soft space-y-2">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-6 h-6 text-accent shrink-0" />
                      <strong className="font-heading font-extrabold text-lg text-on-accent-soft">
                        {t('অপেক্ষমাণ তালিকা (Waitlisted)', 'On Waitlist')}
                      </strong>
                    </div>
                    <p className="text-xs sm:text-sm text-on-accent-soft/90 leading-[1.7]">
                      {t(
                        `আবেদনটি অপেক্ষমাণ তালিকায় অন্তর্ভুক্ত রয়েছে। আসন শূন্য হওয়া সাপেক্ষে ক্রমানুসারে যোগাযোগ করা হবে।`,
                        `The application is currently waitlisted. Guardians will be contacted sequentially if a seat becomes available.`
                      )}
                    </p>
                  </div>
                )}

                {statusResult.status === 'rejected' && (
                  <div className="p-5 rounded-[var(--radius-card)] bg-surface-2 border border-line/35 text-ink space-y-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-6 h-6 text-ink-muted shrink-0" />
                      <strong className="font-heading font-extrabold text-lg text-ink">
                        {t('আবেদন বাতিল (Not Accepted)', 'Application Not Accepted')}
                      </strong>
                    </div>
                    <p className="text-xs sm:text-sm text-ink-muted leading-[1.7]">
                      {t(
                        `দুঃখিত, বয়সসীমা বা শ্রেণি আসন সীমাবদ্ধতার কারণে আবেদনটি এই মুহূর্তে গ্রহণ করা সম্ভব হয়নি। বিস্তারিত জানতে স্কুলে যোগাযোগ করুন।`,
                        `Unfortunately, this application could not be accepted due to class capacity or age requirements.`
                      )}
                    </p>
                  </div>
                )}

                {/* Summary Info Grid */}
                <div className="p-4 bg-surface-2 rounded-[var(--radius-card)] border border-line/25 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-ink-muted block">{t('শিক্ষার্থীর নাম:', 'Student Name:')}</span>
                    <strong className="text-ink text-sm font-bold">{statusResult.firstName}</strong>
                  </div>
                  <div>
                    <span className="text-ink-muted block">{t('ভর্তির শ্রেণি:', 'Class:')}</span>
                    <strong className="text-ink text-sm font-bold">{statusResult.class}</strong>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-surface-2 hover:bg-primary-50 text-ink text-xs font-bold rounded-[var(--radius-btn)] border border-line/25 flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-ink-muted" />
                    <span>{t('প্রিন্ট করুন', 'Print Status')}</span>
                  </button>

                  <a
                    href={`https://wa.me/${schoolSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `আসসালামু আলাইকুম, আমি ${schoolSettings.nameBn} এর ভর্তি স্ট্যাটাস চেক করেছি। ট্র্যাকিং নং: ${statusResult.applicationNo}, শ্রেণি: ${statusResult.class}, অবস্থা: ${statusResult.status}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-success hover:bg-primary-700 text-on-success text-xs font-bold rounded-[var(--radius-btn)] flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{t('স্কুলে মেসেজ দিন', 'Inquire via WhatsApp')}</span>
                  </a>
                </div>
              </div>
            )}

            {/* Need Help Footer */}
            <div className="pt-6 border-t border-line/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-ink-muted">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary-600" />
                <span>{t('হেল্পলাইন:', 'Helpline:')} {schoolSettings.phonePrimary}</span>
              </div>

              <button
                type="button"
                onClick={onNavigateApply}
                className="text-primary-700 dark:text-primary-300 hover:underline font-bold"
              >
                {t('নতুন ভর্তি আবেদন ফরম পূরণ করুন →', 'Fill New Application Form →')}
              </button>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
};
