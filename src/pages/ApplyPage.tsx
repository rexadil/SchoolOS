import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolData } from '../context/SchoolDataContext';
import { compressImage } from '../utils/imageCompressor';
import { getAdmissionClosedInfo } from '../utils/admissionStatus';
import {
  User,
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Printer,
  Sparkles,
  Home,
  MessageCircle,
  Loader2,
  Search,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

interface ApplyPageProps {
  onGoHome: () => void;
  onNavigateStatus?: (appNo?: string) => void;
}

export const ApplyPage: React.FC<ApplyPageProps> = ({ onGoHome, onNavigateStatus }) => {
  const { lang, t, formatNumber } = useLanguage();
  const { schoolSettings, feeSettings, levels, applyFields, submitApplication, admissionNotice } = useSchoolData();

  // Multi-step progress (1: Student, 2: Guardian & Photo, 3: Payment, 4: Success)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [formData, setFormData] = useState({
    studentNameBn: '',
    studentNameEn: '',
    birthDate: '',
    gender: 'ছেলে (Male)',
    appliedClass: levels[0]?.gradeKey || levels[0]?.name.en.split(' ')[0] || levels[0]?.id || 'Play',
    previousSchool: '',
    previousResult: '',
    birthRegistrationNo: '',
    preferredGroup: 'বিজ্ঞান বিভাগ (Science)',
    fatherName: '',
    motherName: '',
    guardianPhone: '',
    address: schoolSettings.area ? `${schoolSettings.area}, ${schoolSettings.upazila}` : '',
    photoUrl: '',
    paymentMethod: 'bkash',
    trxId: '',
  });

  // Anti-spam states
  const [honeypot, setHoneypot] = useState('');
  const [compressingPhoto, setCompressingPhoto] = useState(false);

  const [copiedType, setCopiedType] = useState<'bkash' | 'nagad' | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedAppNo, setGeneratedAppNo] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);

  // Sync appliedClass if active levels change
  useEffect(() => {
    if (levels.length > 0) {
      const activeKeys = levels.map((l) => l.gradeKey || l.name.en.split(' ')[0] || l.id);
      if (!activeKeys.includes(formData.appliedClass)) {
        setFormData((prev) => ({ ...prev, appliedClass: activeKeys[0] }));
      }
    }
  }, [levels]);

  // Dynamic class options derived from active levels
  const classOptions = levels.map((lvl) => ({
    key: lvl.gradeKey || lvl.name.en.split(' ')[0] || lvl.id,
    label: lvl.name[lang],
    hasGroups: Boolean(lvl.groups && lvl.groups.length > 0),
    groups: lvl.groups,
  }));

  // Find if currently selected class has groups (e.g. Class 9 and 10)
  const currentLevelObj = levels.find(
    (l) => (l.gradeKey || l.name.en.split(' ')[0] || l.id) === formData.appliedClass
  );
  const hasBranchGroups = Boolean(currentLevelObj?.groups && currentLevelObj.groups.length > 0);

  // Check if admission is currently closed (admissionActive === false or endDate past in Bangladesh Time UTC+6)
  const closedStatus = getAdmissionClosedInfo(admissionNotice);
  const displayEndDate = lang === 'bn' ? closedStatus.formattedEndDateBn : closedStatus.formattedEndDateEn;

  // Current fee for selected class
  const currentFee = feeSettings.admissionFees[formData.appliedClass] || 1500;

  // Phone Validation for Bangladesh: 013-019 followed by 8 digits (total 11 digits)
  const validatePhone = (phone: string): boolean => {
    const clean = phone.replace(/[^0-9]/g, '');
    return /^01[3-9]\d{8}$/.test(clean);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      setErrorMsg(
        t(
          'ছবির আকার সর্বোচ্চ ১২ মেগাবাইট হতে পারবে। অনুগ্রহ করে ছোট ছবি নির্বাচন করুন।',
          'Photo size exceeds 12MB. Please choose a smaller photo.'
        )
      );
      return;
    }

    setCompressingPhoto(true);
    setErrorMsg('');

    try {
      // Compress to max 480px and ~150KB for fast, light Firestore document storage
      const compressed = await compressImage(file, {
        maxDimension: 480,
        maxBytes: 150 * 1024,
      });

      setPhotoPreview(compressed);
      setFormData((prev) => ({ ...prev, photoUrl: compressed }));
    } catch (err: any) {
      console.error('Compression failed:', err);
      setErrorMsg(
        t(
          'ছবি প্রসেস করতে সমস্যা হয়েছে। অনুগ্রহ করে অন্য কোনো ছবি দিয়ে চেষ্টা করুন।',
          'Failed to process photo. Please try a different image.'
        )
      );
    } finally {
      setCompressingPhoto(false);
    }
  };

  const handleCopyNumber = (type: 'bkash' | 'nagad', text: string) => {
    const numOnly = text.split(' ')[0];
    navigator.clipboard.writeText(numOnly);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleStep1Next = () => {
    if (!formData.studentNameBn.trim()) {
      setErrorMsg(t('অনুগ্রহ করে শিক্ষার্থীর নাম বাংলায় লিখুন।', 'Please write student name in Bengali.'));
      return;
    }
    if (!formData.birthDate) {
      setErrorMsg(t('অনুগ্রহ করে জন্ম তারিখ নির্বাচন করুন।', 'Please select date of birth.'));
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleStep2Next = () => {
    if (!formData.fatherName.trim()) {
      setErrorMsg(t('অনুগ্রহ করে পিতার নাম লিখুন।', "Please write father's name."));
      return;
    }
    if (!validatePhone(formData.guardianPhone)) {
      setErrorMsg(
        t(
          'অনুগ্রহ করে সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01712345678)।',
          'Please enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678).'
        )
      );
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg(t('অনুগ্রহ করে গ্রাম/এলাকার ঠিকানা লিখুন।', 'Please enter address/village.'));
      return;
    }
    setErrorMsg('');
    setStep(3);
  };

  const handleSubmitApplication = async () => {
    if (getAdmissionClosedInfo(admissionNotice).closed) {
      setErrorMsg(t('আবেদন বন্ধ রয়েছে। নতুন আবেদন জমা দেওয়া সম্ভব নয়।', 'Admission is closed. New submissions are disabled.'));
      return;
    }

    // 1. Hidden honeypot check: if bot fills this field, silently exit
    if (honeypot.trim()) {
      console.warn('Bot submission blocked via honeypot.');
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setStep(4);
      }, 800);
      return;
    }

    if (!formData.trxId.trim() || formData.trxId.length < 5) {
      setErrorMsg(
        t(
          'অনুগ্রহ করে বিকাশ বা নগদ পেমেন্টের সঠিক Transaction ID (TrxID) দিন।',
          'Please provide the valid bKash/Nagad Transaction ID (TrxID).'
        )
      );
      return;
    }

    if (!consentAccepted) {
      setErrorMsg(
        t(
          'আবেদন জমা দেওয়ার আগে অনুগ্রহ করে গোপনীয়তা ও তথ্যের সত্যতা সম্মতি বাক্সে টিক দিন।',
          'Please accept the Privacy Notice and guardian consent checkbox before submitting.'
        )
      );
      return;
    }

    // 2. Client-side 60-second cooldown check
    const COOLDOWN_MS = 60 * 1000;
    const lastApplyTs = localStorage.getItem('school_apply_last_ts');
    if (lastApplyTs) {
      const elapsed = Date.now() - Number(lastApplyTs);
      if (elapsed < COOLDOWN_MS) {
        const remainingSec = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        setErrorMsg(
          t(
            `অনুগ্রহ করে একটু অপেক্ষা করুন। স্প্যাম প্রতিরোধে পরবর্তী আবেদন জমা দিতে আর ${formatNumber(remainingSec)} সেকেন্ড বাকি রয়েছে।`,
            `Please wait. You can submit another application in ${remainingSec} seconds.`
          )
        );
        return;
      }
    }

    // 3. 24-hour duplicate check (same guardian phone + student name)
    const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;
    const cleanPhone = formData.guardianPhone.replace(/[^0-9]/g, '');
    const cleanStudentName = formData.studentNameBn.trim().toLowerCase();

    let submittedHistory: Array<{ phone: string; studentName: string; timestamp: number; appNo: string }> = [];
    try {
      const stored = localStorage.getItem('school_apply_submitted_history');
      if (stored) {
        submittedHistory = JSON.parse(stored);
      }
    } catch {
      submittedHistory = [];
    }

    // Keep only submissions within 24 hours
    submittedHistory = submittedHistory.filter((item) => Date.now() - item.timestamp < DUPLICATE_WINDOW_MS);

    const duplicateMatch = submittedHistory.find(
      (item) => item.phone === cleanPhone && item.studentName === cleanStudentName
    );

    if (duplicateMatch) {
      setErrorMsg(
        t(
          `এই শিক্ষার্থী ও মোবাইল নম্বরে গত ২৪ ঘণ্টার মধ্যে ইতিমধ্যেই একটি আবেদন সফলভাবে জমা দেওয়া হয়েছে (ট্র্যাকিং নং: ${duplicateMatch.appNo})। পুনরায় আবেদনের প্রয়োজন নেই। যে কোনো তথ্যের জন্য ট্র্যাকিং নম্বর নিয়ে স্কুলে যোগাযোগ করুন।`,
          `An application was already submitted for this student and guardian phone in the last 24 hours (Tracking No: ${duplicateMatch.appNo}). No duplicate submission needed.`
        )
      );
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const appNumber = await submitApplication({
        studentNameBn: formData.studentNameBn,
        studentNameEn: formData.studentNameEn,
        birthDate: formData.birthDate,
        gender: formData.gender,
        appliedClass: formData.appliedClass,
        previousSchool: formData.previousSchool,
        previousResult: formData.previousResult,
        birthRegistrationNo: formData.birthRegistrationNo,
        preferredGroup: hasBranchGroups ? formData.preferredGroup : undefined,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        guardianPhone: formData.guardianPhone,
        address: formData.address,
        photoUrl: formData.photoUrl,
        admissionFee: currentFee,
        trxId: formData.trxId.toUpperCase(),
        paymentMethod: formData.paymentMethod,
      });

      // Record successful application timestamp and history in localStorage
      localStorage.setItem('school_apply_last_ts', Date.now().toString());
      submittedHistory.push({
        phone: cleanPhone,
        studentName: cleanStudentName,
        timestamp: Date.now(),
        appNo: appNumber,
      });
      localStorage.setItem('school_apply_submitted_history', JSON.stringify(submittedHistory));

      setGeneratedAppNo(appNumber);
      setStep(4);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        t(
          'আবেদন জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট কানেকশন চেক করে আবার চেষ্টা করুন।',
          'Failed to submit application. Please check connection and try again.'
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-surface text-ink py-10 px-4 sm:px-6 lg:px-8 focus:outline-none">
      <div className="max-w-3xl mx-auto">

        {/* Top Breadcrumb & Home Link */}
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
            {schoolSettings.nameBn} · {t('ভর্তি পোর্টাল', 'Admission Portal')}
          </span>
        </div>

        {/* Admission Closed State or Multi-step Form */}
        {closedStatus.closed ? (
          <div className="bg-surface-card rounded-[var(--radius-card)] border border-line/30 shadow-xl overflow-hidden p-8 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-[var(--radius-card)] bg-primary-100 text-primary-800 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <Calendar className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[var(--radius-btn)] bg-danger-soft text-on-danger-soft border border-danger/30 text-xs font-bold mb-4">
              <AlertCircle className="w-3.5 h-3.5 text-danger" />
              <span>{t('আবেদন বন্ধ', 'Admission Closed')}</span>
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink mb-3">
              {t('আবেদন বন্ধ — ভর্তি কার্যক্রম বর্তমানে স্থগিত রয়েছে', 'Admission Closed — Applications Not Accepted')}
            </h1>

            {displayEndDate && (
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink bg-surface-2 px-3 py-1 rounded-[var(--radius-btn)] border border-line/25 mb-4">
                <Calendar className="w-3.5 h-3.5 text-primary-600" />
                <span>{t(`আবেদনের শেষ তারিখ: ${displayEndDate}`, `End Date: ${displayEndDate}`)}</span>
              </p>
            )}

            <p className="text-ink-muted text-sm sm:text-base max-w-lg mx-auto leading-[1.7] mb-8">
              {closedStatus.reason === 'deadline'
                ? t(
                    `অনলাইনে ভর্তি আবেদনের নির্ধারিত সময়সীমা${displayEndDate ? ` (${displayEndDate})` : ''} অতিক্রান্ত হয়েছে। পূর্বে জমা দেওয়া আবেদনের সর্বশেষ অবস্থা জানতে নিচের বাটনে ক্লিক করুন।`,
                    `The admission deadline${displayEndDate ? ` (${displayEndDate})` : ''} has passed. To check the status of a previously submitted application, please use the status tracker below.`
                  )
                : t(
                    `বিদ্যালয় কর্তৃপক্ষ কর্তৃক ভর্তি আবেদন গ্রহণ বর্তমানে বন্ধ রাখা হয়েছে। বিস্তারিত তথ্যের জন্য বিদ্যালয়ের অফিস চলাকালীন সময়ে সরাসরি যোগাযোগ করুন।`,
                    `Online admissions are currently closed by the school administration. Please contact the school office during working hours for inquiries.`
                  )}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateStatus) {
                    onNavigateStatus();
                  } else {
                    window.location.hash = '#status';
                  }
                }}
                className="w-full sm:w-auto px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-on-primary font-bold text-sm rounded-[var(--radius-btn)] flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <Search className="w-4 h-4" />
                <span>{t('আবেদনের অবস্থা যাচাই করুন (#status)', 'Check Application Status (#status)')}</span>
              </button>

              <button
                type="button"
                onClick={onGoHome}
                className="w-full sm:w-auto px-6 py-3.5 bg-surface-2 hover:bg-primary-50 text-ink border border-line/30 font-bold text-sm rounded-[var(--radius-btn)] flex items-center justify-center gap-2 transition-colors"
              >
                <Home className="w-4 h-4 text-ink-muted" />
                <span>{t('মূল পাতায় ফিরে যান', 'Back to Homepage')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-surface-card rounded-[var(--radius-card)] border border-line/30 shadow-xl overflow-hidden">

            {/* Header Banner */}
            <div className="bg-primary-700 px-6 sm:px-8 py-6 text-on-primary">
              <div className="flex items-center gap-2 text-xs font-bold text-on-primary/85 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('নতুন শিক্ষাবর্ষে অনলাইনে ভর্তি', 'Online Admission Application')}</span>
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl">
                {t('অনলাইন ভর্তি আবেদন ফরম', 'Online Admission Application Form')}
              </h1>
              <p className="text-xs sm:text-sm text-on-primary/85 mt-1">
                {schoolSettings.addressLine}, {schoolSettings.area}, {schoolSettings.upazila}, {schoolSettings.district}
              </p>

              {/* Stepper Indicator */}
              {step < 4 && (
              <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
                <div
                  className={`flex items-center gap-2 pb-2 border-b-2 font-bold transition-colors ${
                    step >= 1 ? 'border-accent text-on-primary' : 'border-on-primary/30 text-on-primary/60'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-on-primary/20 flex items-center justify-center text-[10px]">১</span>
                  <span>{t('শিক্ষার্থী', 'Student')}</span>
                </div>
                <div
                  className={`flex items-center gap-2 pb-2 border-b-2 font-bold transition-colors ${
                    step >= 2 ? 'border-accent text-on-primary' : 'border-on-primary/30 text-on-primary/60'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-on-primary/20 flex items-center justify-center text-[10px]">২</span>
                  <span>{t('অভিভাবক', 'Guardian')}</span>
                </div>
                <div
                  className={`flex items-center gap-2 pb-2 border-b-2 font-bold transition-colors ${
                    step >= 3 ? 'border-accent text-on-primary' : 'border-on-primary/30 text-on-primary/60'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-on-primary/20 flex items-center justify-center text-[10px]">৩</span>
                  <span>{t('পেমেন্ট', 'Payment')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8">

            {/* Hidden honeypot field to block automated bot submissions */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website_hp_confirm">Website</label>
              <input
                id="website_hp_confirm"
                type="text"
                name="website_hp_confirm"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-danger-soft rounded-[var(--radius-card)] border border-danger/30 text-on-danger-soft text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: Student Information */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-line/25">
                  <User className="w-5 h-5 text-primary-600" />
                  <h2 className="font-heading font-bold text-lg text-ink">
                    {t('১. শিক্ষার্থীর প্রাথমিক তথ্য', '1. Student Basic Information')}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('শিক্ষার্থীর পূর্ণ নাম (বাংলায়) *', "Student's Full Name (Bengali) *")}
                    </label>
                    <input
                      type="text"
                      value={formData.studentNameBn}
                      onChange={(e) => setFormData({ ...formData, studentNameBn: e.target.value })}
                      placeholder={t('যেমন: তানভীর আহমেদ অর্ণব', 'e.g. Tanvir Ahmed')}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink placeholder:text-ink-muted text-sm focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('শিক্ষার্থীর নাম (ইংরেজিতে)', "Student's Name (English)")}
                    </label>
                    <input
                      type="text"
                      value={formData.studentNameEn}
                      onChange={(e) => setFormData({ ...formData, studentNameEn: e.target.value })}
                      placeholder="e.g. Tanvir Ahmed Ornob"
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink placeholder:text-ink-muted text-sm focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('ভর্তির শ্রেণি *', 'Class Applying For *')}
                    </label>
                    <select
                      value={formData.appliedClass}
                      onChange={(e) => setFormData({ ...formData, appliedClass: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-[var(--radius-input)] border border-line/40 text-sm bg-surface text-ink font-medium focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none"
                    >
                      {classOptions.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Conditional Group / Department Dropdown for Class 9 & 10 */}
                  {hasBranchGroups && (
                    <div>
                      <label className="block text-xs font-bold text-primary-700 dark:text-primary-300 mb-1 flex items-center gap-1">
                        <span>{t('পছন্দের বিভাগ (শাখা) *', 'Preferred Stream (Group) *')}</span>
                      </label>
                      <select
                        value={formData.preferredGroup}
                        onChange={(e) => setFormData({ ...formData, preferredGroup: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-[var(--radius-input)] border border-success/50 bg-success-soft/50 text-sm font-semibold text-ink focus:border-success focus:ring-2 focus:ring-ring/25 outline-none"
                      >
                        <option value="বিজ্ঞান বিভাগ (Science)">{t('বিজ্ঞান বিভাগ (Science)', 'Science')}</option>
                        <option value="ব্যবসায় শিক্ষা (Business Studies)">{t('ব্যবসায় শিক্ষা (Business Studies)', 'Business Studies')}</option>
                        <option value="মানবিক বিভাগ (Humanities)">{t('মানবিক বিভাগ (Humanities)', 'Humanities')}</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('জন্ম তারিখ *', 'Date of Birth *')}
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-sm bg-surface text-ink focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('লিঙ্গ *', 'Gender *')}
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-[var(--radius-input)] border border-line/40 text-sm bg-surface text-ink focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none"
                    >
                      <option value="ছেলে (Male)">{t('ছেলে', 'Male')}</option>
                      <option value="মেয়ে (Female)">{t('মেয়ে', 'Female')}</option>
                    </select>
                  </div>
                </div>

                {/* Extra Configurable Fields (controlled by applyFields config) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {applyFields?.birthRegistrationNo && (
                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">
                        {t('অনলাইন জন্ম নিবন্ধন নম্বর (১৭ ডিজিট)', 'Birth Registration No. (17 Digits)')}
                      </label>
                      <input
                        type="text"
                        value={formData.birthRegistrationNo}
                        onChange={(e) => setFormData({ ...formData, birthRegistrationNo: e.target.value })}
                        placeholder="e.g. 20124915220000123"
                        className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink placeholder:text-ink-muted text-sm focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none font-mono"
                      />
                    </div>
                  )}

                  {applyFields?.previousResult && (
                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">
                        {t('পূর্ববর্তী শ্রেণির জিপিএ / গ্রেড (GPA/Grade)', 'Previous Academic GPA / Grade')}
                      </label>
                      <input
                        type="text"
                        value={formData.previousResult}
                        onChange={(e) => setFormData({ ...formData, previousResult: e.target.value })}
                        placeholder="e.g. GPA 5.00 / Golden A+"
                        className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink placeholder:text-ink-muted text-sm focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none"
                      />
                    </div>
                  )}
                </div>

                {applyFields?.previousSchool !== false && (
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('পূর্ববর্তী স্কুলের নাম (যদি থাকে)', 'Previous School Name (Optional)')}
                    </label>
                    <input
                      type="text"
                      value={formData.previousSchool}
                      onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                      placeholder={t('নতুন হলে খালি রাখুন', 'Leave blank if first school')}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink placeholder:text-ink-muted text-sm focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none"
                    />
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleStep1Next}
                    className="px-6 py-3 rounded-[var(--radius-btn)] bg-primary-600 hover:bg-primary-700 text-on-primary font-bold text-sm flex items-center gap-2 shadow-md transition-all"
                  >
                    <span>{t('পরবর্তী ধাপ: অভিভাবকের তথ্য', 'Next: Guardian Info')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Guardian Information & Photo Upload */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-line/25">
                  <Users className="w-5 h-5 text-primary-600" />
                  <h2 className="font-heading font-bold text-lg text-ink">
                    {t('২. অভিভাবক, যোগাযোগের ঠিকানা ও ছবি', '2. Guardian, Contact & Student Photo')}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('পিতার নাম *', "Father's Full Name *")}
                    </label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder={t('পিতার পূর্ণ নাম', "Father's Name")}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink placeholder:text-ink-muted text-sm focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('মাতার নাম', "Mother's Name")}
                    </label>
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      placeholder={t('মাতার পূর্ণ নাম', "Mother's Name")}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink placeholder:text-ink-muted text-sm focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('অভিভাবকের মোবাইল নম্বর (১১ ডিজিট) *', "Guardian's Phone (11 digits) *")}
                    </label>
                    <input
                      type="tel"
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      placeholder="01712345678"
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink placeholder:text-ink-muted text-sm focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none font-mono"
                    />
                    <p className="text-[11px] text-ink-muted mt-1">
                      {t('এই নম্বরে ভর্তি সংক্রান্ত সকল এসএমএস পাঠানো হবে।', 'Admission updates will be sent to this number.')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('গ্রাম, ডাকঘর ও উপজেলা *', 'Address (Village, Post, Upazila) *')}
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder={t(`যেমন: ${schoolSettings.area}, ${schoolSettings.upazila}`, `e.g. ${schoolSettings.area}, ${schoolSettings.upazila}`)}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink placeholder:text-ink-muted text-sm focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none"
                    />
                  </div>
                </div>

                {/* Student Photo Upload */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-ink mb-2">
                    {t('শিক্ষার্থীর পাসপোর্ট সাইজ ছবি (ঐচ্ছিক কিন্তু সুপারিশকৃত)', "Student's Photograph (Optional but recommended)")}
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-24 rounded-[var(--radius-card)] bg-surface-2 border-2 border-dashed border-line/40 flex items-center justify-center overflow-hidden shrink-0 relative">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Student Preview" className="w-full h-full object-cover" />
                      ) : compressingPhoto ? (
                        <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                      ) : (
                        <User className="w-8 h-8 text-ink-muted" />
                      )}
                    </div>

                    <div>
                      <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-surface-2 hover:bg-primary-50 border border-line/30 text-ink text-xs font-bold rounded-[var(--radius-btn)] transition-colors ${compressingPhoto ? 'opacity-60 pointer-events-none' : ''}`}>
                        {compressingPhoto ? (
                          <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 text-primary-600" />
                        )}
                        <span>
                          {compressingPhoto
                            ? t('ছবি অপ্টিমাইজ হচ্ছে...', 'Optimizing photo...')
                            : t('ছবি নির্বাচন করুন', 'Upload Photo')}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          disabled={compressingPhoto}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-ink-muted mt-1">
                        {t(
                          'ছবি দেওয়া ঐচ্ছিক। ১২ মেগাবাইট পর্যন্ত যেকোনো ছবি নির্বাচন করলে স্বয়ংক্রিয়ভাবে ২০০KB-এর নিচে সংকুচিত হবে।',
                          'Photo is optional. Any image up to 12MB is automatically compressed under 200KB.'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-line/20">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2.5 text-ink-muted hover:text-ink text-sm font-semibold flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t('পূর্ববর্তী ধাপ', 'Previous')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStep2Next}
                    className="px-6 py-3 rounded-[var(--radius-btn)] bg-primary-600 hover:bg-primary-700 text-on-primary font-bold text-sm flex items-center gap-2 shadow-md transition-all"
                  >
                    <span>{t('পরবর্তী ধাপ: পেমেন্ট ও ফি', 'Next: Fee & Payment')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment & Transaction ID */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-line/25">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  <h2 className="font-heading font-bold text-lg text-ink">
                    {t('৩. ভর্তি ফি পরিশোধ ও ট্রানজেকশন আইডি', '3. Admission Fee Payment & TrxID')}
                  </h2>
                </div>

                {/* Fee Summary Card */}
                <div className="bg-surface-2 rounded-[var(--radius-card)] p-5 border border-line/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider block">
                      {t('নির্বাচিত শ্রেণি ও নির্ধারিত ভর্তি ফি', 'Selected Class & Admission Fee')}
                    </span>
                    <p className="font-heading font-extrabold text-xl text-ink mt-0.5">
                      {formData.appliedClass} · {formData.studentNameBn}
                    </p>
                  </div>
                  <div className="text-right sm:self-center">
                    <span className="text-2xl sm:text-3xl font-extrabold text-primary-700 dark:text-primary-300 font-mono">
                      ৳ {formatNumber(currentFee)}
                    </span>
                    <span className="text-xs text-ink-muted block">{t('এককালীন ভর্তি ফি', 'One-time Fee')}</span>
                  </div>
                </div>

                {/* Payment Numbers Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* bKash Card */}
                  <div
                    onClick={() => setFormData({ ...formData, paymentMethod: 'bkash' })}
                    className={`cursor-pointer p-4 rounded-[var(--radius-card)] border-2 transition-all ${
                      formData.paymentMethod === 'bkash'
                        ? 'border-primary-600 bg-primary-50/40 dark:bg-surface-2 shadow-xs'
                        : 'border-line/30 hover:border-primary-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-primary-700 dark:text-primary-300 uppercase">বিকাশ (bKash)</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyNumber('bkash', feeSettings.bkashNumber);
                        }}
                        className="text-xs text-ink-muted hover:text-ink flex items-center gap-1 font-medium"
                      >
                        {copiedType === 'bkash' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedType === 'bkash' ? t('কপি হয়েছে', 'Copied') : t('কপি', 'Copy')}</span>
                      </button>
                    </div>
                    <span className="font-mono font-bold text-base text-ink block">
                      {feeSettings.bkashNumber}
                    </span>
                  </div>

                  {/* Nagad Card */}
                  <div
                    onClick={() => setFormData({ ...formData, paymentMethod: 'nagad' })}
                    className={`cursor-pointer p-4 rounded-[var(--radius-card)] border-2 transition-all ${
                      formData.paymentMethod === 'nagad'
                        ? 'border-accent bg-accent-soft/40 shadow-xs'
                        : 'border-line/30 hover:border-accent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-accent uppercase">নগদ (Nagad)</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyNumber('nagad', feeSettings.nagadNumber);
                        }}
                        className="text-xs text-ink-muted hover:text-ink flex items-center gap-1 font-medium"
                      >
                        {copiedType === 'nagad' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedType === 'nagad' ? t('কপি হয়েছে', 'Copied') : t('কপি', 'Copy')}</span>
                      </button>
                    </div>
                    <span className="font-mono font-bold text-base text-ink block">
                      {feeSettings.nagadNumber}
                    </span>
                  </div>
                </div>

                {/* Instructions */}
                <p className="text-xs text-ink-muted leading-[1.7]">
                  {feeSettings.paymentInstructionsBn}
                </p>

                {/* TrxID Input */}
                <div className="bg-surface-2 p-4 rounded-[var(--radius-card)] border border-line/25">
                  <label className="block text-xs font-bold text-ink mb-1">
                    {t('পেমেন্ট ট্রানজেকশন আইডি (TrxID) *', 'Payment Transaction ID (TrxID) *')}
                  </label>
                  <input
                    type="text"
                    value={formData.trxId}
                    onChange={(e) => setFormData({ ...formData, trxId: e.target.value.toUpperCase() })}
                    placeholder="e.g. 9J4K2L8M1N"
                    className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 text-sm font-mono tracking-wider text-ink placeholder:text-ink-muted focus:border-primary-600 focus:ring-2 focus:ring-ring/25 outline-none uppercase bg-surface"
                  />
                  <p className="text-[11px] text-ink-muted mt-1">
                    {t(
                      'বিকাশ বা নগদ থেকে পাঠানো ফির নিশ্চিতকরণ মেসেজে প্রাপ্ত TrxID টি হুবহু লিখুন।',
                      'Enter the exact TrxID received in your bKash or Nagad confirmation SMS.'
                    )}
                  </p>
                </div>

                {/* Bilingual Privacy Notice & Required Guardian Consent */}
                <div className="p-4 rounded-[var(--radius-card)] bg-surface-2 border border-line/35 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-ink-muted leading-[1.7]">
                      <strong className="text-ink block mb-0.5">
                        {t('তথ্য গোপনীয়তা বিজ্ঞপ্তি (Privacy Notice)', 'Privacy & Data Protection Notice')}
                      </strong>
                      <span>
                        {t(
                          'এই ফরমে সংগৃহীত শিক্ষার্থীর নাম, জন্মতারিখ, অভিভাবকের নাম, মোবাইল নম্বর, ঠিকানা, পেমেন্ট TrxID এবং ঐচ্ছিক ছবি শুধুমাত্র বিদ্যালয়ের ভর্তি যাচাই ও প্রশাসনিক নথির কাজে ব্যবহৃত হবে। কোনো তৃতীয় পক্ষের সাথে এই তথ্য বিনিময় করা হয় না।',
                          'Information collected here (student name, birth date, guardian details, phone, address, TrxID, and optional photo) is used strictly for school admission processing and verification. It is never shared with third parties.'
                        )}
                      </span>
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 pt-2 border-t border-line/20 cursor-pointer select-none">
                    <input
                      id="apply-guardian-consent"
                      type="checkbox"
                      checked={consentAccepted}
                      onChange={(e) => {
                        setConsentAccepted(e.target.checked);
                        if (errorMsg) setErrorMsg('');
                      }}
                      required
                      className="mt-1 w-4 h-4 rounded accent-primary-600 shrink-0 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-ink leading-[1.6]">
                      {t(
                        'আমি উপরের গোপনীয়তা বিজ্ঞপ্তি পড়েছি এবং নিশ্চিত করছি যে প্রদত্ত সকল তথ্য সঠিক। আমি স্বেচ্ছায় শিক্ষার্থীর ভর্তি প্রক্রিয়াকরণের জন্য তথ্য সংরক্ষণে সম্মতি দিচ্ছি। *',
                        'I have read the Privacy Notice above, confirm all provided details are accurate, and consent as guardian to process this admission record. *'
                      )}
                    </span>
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-line/20">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2.5 text-ink-muted hover:text-ink text-sm font-semibold flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t('পূর্ববর্তী ধাপ', 'Previous')}</span>
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSubmitApplication}
                    className="px-8 py-3.5 rounded-[var(--radius-btn)] bg-primary-600 hover:bg-primary-700 text-on-primary font-extrabold text-sm flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all"
                  >
                    {submitting ? (
                      <span>{t('জমা দেওয়া হচ্ছে...', 'Submitting...')}</span>
                    ) : (
                      <>
                        <span>{t('ভর্তি আবেদন নিশ্চিত করুন', 'Submit Final Application')}</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Success Confirmation & Printable Slip */}
            {step === 4 && (
              <div id="printable-admission-token" className="space-y-6 animate-in zoom-in-95 duration-200">
                <div className="p-6 bg-success-soft rounded-[var(--radius-card)] border border-success/30 text-center">
                  <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                  <h2 className="font-heading font-extrabold text-2xl text-on-success-soft">
                    {t('অভিনন্দন! ভর্তি আবেদন সফলভাবে গৃহীত হয়েছে', 'Congratulations! Application Submitted')}
                  </h2>
                  <p className="text-xs sm:text-sm text-on-success-soft/90 mt-1 max-w-lg mx-auto">
                    {t(
                      `${schoolSettings.nameBn} এ আপনার সোনামণির প্রাথমিক ভর্তি আবেদন ডেটাবেজে সংরক্ষিত হয়েছে।`,
                      'The preliminary admission form has been safely recorded in the school system.'
                    )}
                  </p>
                </div>

                {/* Official Application Slip */}
                <div className="p-6 sm:p-8 bg-surface-2 rounded-[var(--radius-card)] border-2 border-dashed border-primary-400">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-line/25">
                    <div>
                      <h3 className="font-heading font-extrabold text-xl text-ink">
                        {schoolSettings.nameBn}
                      </h3>
                      <p className="text-xs text-ink-muted">
                        {schoolSettings.addressLine}, {schoolSettings.area}, {schoolSettings.upazila}, {schoolSettings.district}
                      </p>
                    </div>

                    <div className="bg-primary-100 text-primary-900 px-3.5 py-1.5 rounded-[var(--radius-btn)] text-xs font-mono font-bold border border-primary-300">
                      {t('আবেদন ট্র্যাকিং নং:', 'Tracking No:')} {generatedAppNo}
                    </div>
                  </div>

                  <div className="py-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-ink">
                    <div>
                      <span className="text-ink-muted block text-xs">{t('শিক্ষার্থীর নাম:', 'Student Name:')}</span>
                      <strong className="text-ink text-sm font-bold">{formData.studentNameBn}</strong>
                    </div>

                    <div>
                      <span className="text-ink-muted block text-xs">{t('ভর্তির শ্রেণি:', 'Applied Class:')}</span>
                      <strong className="text-ink text-sm font-bold">
                        {formData.appliedClass} {hasBranchGroups && formData.preferredGroup ? `· ${formData.preferredGroup.split(' ')[0]}` : ''}
                      </strong>
                    </div>

                    {formData.birthRegistrationNo ? (
                      <div>
                        <span className="text-ink-muted block text-xs">{t('জন্ম নিবন্ধন নং:', 'Birth Reg No:')}</span>
                        <strong className="text-ink text-sm font-mono">{formData.birthRegistrationNo}</strong>
                      </div>
                    ) : null}

                    <div>
                      <span className="text-ink-muted block text-xs">{t('জন্ম তারিখ:', 'Date of Birth:')}</span>
                      <strong className="text-ink text-sm">{formData.birthDate}</strong>
                    </div>

                    <div>
                      <span className="text-ink-muted block text-xs">{t('পিতার নাম:', "Father's Name:")}</span>
                      <strong className="text-ink text-sm">{formData.fatherName}</strong>
                    </div>

                    <div>
                      <span className="text-ink-muted block text-xs">{t('মোবাইল নম্বর:', 'Mobile:')}</span>
                      <strong className="text-ink text-sm font-mono">{formData.guardianPhone}</strong>
                    </div>

                    <div>
                      <span className="text-ink-muted block text-xs">{t('পেমেন্ট TrxID:', 'TrxID:')}</span>
                      <strong className="text-success text-sm font-mono font-bold">{formData.trxId}</strong>
                    </div>
                  </div>

                  {/* Documents to bring */}
                  <div className="pt-4 border-t border-line/25 text-xs text-ink-muted">
                    <p className="font-bold text-ink mb-1.5">
                      {t('স্কুলে চূড়ান্ত ভর্তির সময় সাথে আনতে হবে:', 'Please bring the following to campus:')}
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>{t('শিক্ষার্থীর অনলাইন জন্ম নিবন্ধন সনদের ফটোকপি', "Photocopy of student's Birth Registration")}</li>
                      <li>{t('পাসপোর্ট সাইজ রঙিন ছবি ২ কপি', '2 passport size color photographs')}</li>
                      <li>{t('পিতা ও মাতার জাতীয় পরিচয়পত্রের ফটোকপি', "Photocopy of Parents' NID")}</li>
                    </ul>
                  </div>
                </div>

                {/* Print & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onGoHome}
                    className="px-5 py-2.5 rounded-[var(--radius-btn)] text-ink-muted hover:text-ink text-xs sm:text-sm font-bold transition-colors"
                  >
                    {t('হোমপেজে যান', 'Return to Homepage')}
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigateStatus ? onNavigateStatus(generatedAppNo) : (window.location.hash = '#status')}
                      className="px-4 py-2.5 bg-primary-100 hover:bg-primary-200 text-primary-900 border border-primary-300 text-xs font-bold rounded-[var(--radius-btn)] flex items-center gap-1.5 transition-colors"
                    >
                      <Search className="w-4 h-4 text-primary-700" />
                      <span>{t('ভর্তি অবস্থা চেক করুন', 'Check Status')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2.5 bg-surface-2 hover:bg-primary-50 text-ink border border-line/30 text-xs font-bold rounded-[var(--radius-btn)] flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-4 h-4 text-ink-muted" />
                      <span>{t('স্লিপ প্রিন্ট করুন', 'Print Application Slip')}</span>
                    </button>

                    <a
                      href={`https://wa.me/${schoolSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `আসসালামু আলাইকুম, আমি ${schoolSettings.nameBn} এ অনলাইনে ভর্তি আবেদন করেছি। ট্র্যাকিং নং: ${generatedAppNo}, শিক্ষার্থীর নাম: ${formData.studentNameBn}, শ্রেণি: ${formData.appliedClass}, TrxID: ${formData.trxId}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-success hover:bg-primary-700 text-on-success text-xs font-bold rounded-[var(--radius-btn)] flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{t('হোয়াটসঅ্যাপে স্কুলকে জানান', 'Send to WhatsApp')}</span>
                    </a>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
        )}

      </div>
    </main>
  );
};
