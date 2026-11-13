import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  useSchoolData,
  ApplicationItem,
  NoticeItem,
  StaffItem,
  InquiryItem,
  TestimonialItem,
} from '../context/SchoolDataContext';
import { presets, schoolConfig } from '../config/schoolConfig';
import { GoogleLogoIcon } from '../theme/GoogleLogoIcon';
import { AppearanceTab } from '../components/admin/AppearanceTab';
import {
  LayoutDashboard,
  Settings,
  Palette,
  Image,
  BellRing,
  CreditCard,
  FileText,
  Shield,
  LogOut,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Edit,
  Download,
  CheckCircle,
  XCircle,
  Home,
  AlertTriangle,
  Lock,
  Layers,
  Menu,
  X,
  Upload,
  Loader2,
  CalendarCheck,
  PhoneCall,
  Clock,
  Users,
  MessageSquareQuote,
  Award,
} from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

interface AdminDashboardProps {
  onGoHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onGoHome }) => {
  const { lang, t, formatNumber } = useLanguage();
  const { user, isOwner, isAdmin, loading: authLoading, login, logout } = useAuth();
  const {
    schoolSettings,
    feeSettings,
    schoolType,
    levels,
    notices,
    staffList,
    galleryPhotos,
    applications,
    inquiries,
    testimonials,
    activityLogs,
    moderators,
    switchPreset,
    updateSchoolSettings,
    updateFeeSettings,
    saveNotice,
    deleteNotice,
    saveStaff,
    deleteStaff,
    saveGalleryPhoto,
    deleteGalleryPhoto,
    updateApplicationStatus,
    deleteApplication,
    updateInquiryStatus,
    deleteInquiry,
    saveTestimonial,
    deleteTestimonial,
    addModerator,
    removeModerator,
  } = useSchoolData();

  // Navigation Tabs
  type TabKey =
    | 'overview'
    | 'settings'
    | 'appearance'
    | 'photos_staff'
    | 'notices'
    | 'fees'
    | 'applications'
    | 'inquiries'
    | 'users_logs';
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Status message for saves
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // -------------------------------------------------------------
  // TAB 1: OVERVIEW STATS CALCULATIONS
  // -------------------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];
  const todayApps = applications.filter((app) => {
    if (!app.createdAt) return false;
    const appDate = app.createdAt.toDate ? app.createdAt.toDate().toISOString().split('T')[0] : '';
    return appDate === todayStr;
  });
  const pendingApps = applications.filter((app) => app.status === 'pending');
  const approvedApps = applications.filter((app) => app.status === 'approved');
  const newInquiriesCount = inquiries.filter((inq) => inq.status === 'new').length;
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'new' | 'contacted' | 'completed'>('all');
  const filteredInquiries = inquiries.filter(
    (inq) => inquiryFilter === 'all' || inq.status === inquiryFilter
  );
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<TestimonialItem> | null>(null);

  // -------------------------------------------------------------
  // TAB 2: SCHOOL SETTINGS FORM STATE
  // -------------------------------------------------------------
  const [settingsForm, setSettingsForm] = useState(schoolSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      showFeedback(t('লোগোর আকার ১২ মেগাবাইটের বেশি হতে পারবে না।', 'Logo file exceeds 12MB limit.'), 'error');
      return;
    }

    setUploadingLogo(true);
    try {
      const compressed = await compressImage(file, { maxDimension: 480, maxBytes: 120 * 1024 });
      setSettingsForm((prev) => ({ ...prev, logoUrl: compressed }));
      showFeedback(t('লোগো সফলভাবে লোড হয়েছে। সংরক্ষণে ক্লিক করুন।', 'Logo loaded. Click Save Settings.'));
    } catch (err) {
      console.error(err);
      showFeedback(t('লোগো অপ্টিমাইজ করা যায়নি। অন্য কোনো ছবি দিয়ে চেষ্টা করুন।', 'Failed to process logo image.'), 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateSchoolSettings(settingsForm);
      showFeedback(t('বিদ্যালয়ের তথ্য সফলভাবে সংরক্ষিত হয়েছে!', 'School settings saved successfully!'));
    } catch (err) {
      showFeedback(t('সংরক্ষণে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।', 'Failed to save settings.'), 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // -------------------------------------------------------------
  // TAB 3: PHOTOS & STAFF STATE
  // -------------------------------------------------------------
  const [editingStaff, setEditingStaff] = useState<Partial<StaffItem> | null>(null);
  const [uploadingStaffPhoto, setUploadingStaffPhoto] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState<'building' | 'classes' | 'events' | 'nature'>('classes');
  const [uploadingGalleryPhoto, setUploadingGalleryPhoto] = useState(false);

  const handleStaffPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingStaff) return;

    if (file.size > 12 * 1024 * 1024) {
      showFeedback(t('ছবির আকার ১২ মেগাবাইটের বেশি হতে পারবে না।', 'File exceeds 12MB limit.'), 'error');
      return;
    }

    setUploadingStaffPhoto(true);
    try {
      const compressed = await compressImage(file, { maxDimension: 480, maxBytes: 120 * 1024 });
      setEditingStaff((prev) => prev ? ({ ...prev, photoUrl: compressed }) : null);
      showFeedback(t('শিক্ষকের ছবি লোড ও অপ্টিমাইজ হয়েছে।', 'Teacher photo loaded & optimized.'));
    } catch (err) {
      console.error(err);
      showFeedback(t('ছবি প্রসেস করা যায়নি।', 'Failed to process photo.'), 'error');
    } finally {
      setUploadingStaffPhoto(false);
    }
  };

  const handleGalleryPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      showFeedback(t('ছবির আকার ১২ মেগাবাইটের বেশি হতে পারবে না।', 'File exceeds 12MB limit.'), 'error');
      return;
    }

    setUploadingGalleryPhoto(true);
    try {
      const compressed = await compressImage(file, { maxDimension: 1280, maxBytes: 190 * 1024 });
      setNewPhotoUrl(compressed);
      if (!newPhotoTitle.trim()) {
        const defaultTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setNewPhotoTitle(defaultTitle);
      }
      showFeedback(t('গ্যালারির ছবি সফলভাবে অপ্টিমাইজ (<২০০KB) ও লোড হয়েছে।', 'Gallery photo optimized (<200KB) and loaded.'));
    } catch (err) {
      console.error(err);
      showFeedback(t('ছবি প্রসেস করা যায়নি।', 'Failed to process photo.'), 'error');
    } finally {
      setUploadingGalleryPhoto(false);
    }
  };

  const handleSaveStaffForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff || !editingStaff.nameBn) return;
    try {
      await saveStaff(editingStaff);
      setEditingStaff(null);
      showFeedback(t('শিক্ষকের তথ্য সংরক্ষিত হয়েছে।', 'Staff member updated.'));
    } catch (err) {
      showFeedback(t('ত্রুটি হয়েছে।', 'Error occurred.'), 'error');
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim() || !newPhotoTitle.trim()) return;
    try {
      await saveGalleryPhoto({
        title: newPhotoTitle,
        photoUrl: newPhotoUrl,
        category: newPhotoCategory,
        order: galleryPhotos.length,
      });
      setNewPhotoUrl('');
      setNewPhotoTitle('');
      showFeedback(t('নতুন ছবি গ্যালারিতে যুক্ত হয়েছে।', 'Photo added to gallery.'));
    } catch (err) {
      showFeedback(t('ছবি যোগ করতে সমস্যা হয়েছে।', 'Failed to add photo.'), 'error');
    }
  };

  const handleSaveTestimonialForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial || !editingTestimonial.parentNameBn || !editingTestimonial.feedbackBn) return;
    try {
      await saveTestimonial(editingTestimonial);
      setEditingTestimonial(null);
      showFeedback(t('অভিভাবকের মতামত সংরক্ষিত হয়েছে।', 'Testimonial saved successfully.'));
    } catch (err) {
      showFeedback(t('মতামত সংরক্ষণে সমস্যা হয়েছে।', 'Failed to save testimonial.'), 'error');
    }
  };

  // -------------------------------------------------------------
  // TAB 4: NOTICES & SPECIAL ADMISSION BANNER NOTICE
  // -------------------------------------------------------------
  const [editingNotice, setEditingNotice] = useState<Partial<NoticeItem> | null>(null);

  const handleSaveNoticeForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice || !editingNotice.title) return;
    try {
      await saveNotice(editingNotice);
      setEditingNotice(null);
      showFeedback(t('নোটিশ সফলভাবে সংরক্ষিত হয়েছে।', 'Notice saved successfully.'));
    } catch (err) {
      showFeedback(t('নোটিশ সংরক্ষণে ত্রুটি।', 'Failed to save notice.'), 'error');
    }
  };

  const toggleAdmissionBanner = async (notice: NoticeItem) => {
    try {
      await saveNotice({
        ...notice,
        admissionActive: !notice.admissionActive,
      });
      showFeedback(
        notice.admissionActive
          ? t('ভর্তি ব্যানার ও কাউন্টডাউন বন্ধ করা হয়েছে।', 'Admission banner turned OFF.')
          : t('ভর্তি ব্যানার ও কাউন্টডাউন চালু করা হয়েছে!', 'Admission banner turned ON!')
      );
    } catch (err) {
      showFeedback(t('পরিবর্তন করা যায়নি।', 'Action failed.'), 'error');
    }
  };

  // -------------------------------------------------------------
  // TAB 5: FEES & PAYMENT SETTINGS (OWNER ONLY)
  // -------------------------------------------------------------
  const [feesForm, setFeesForm] = useState(feeSettings);
  const [savingFees, setSavingFees] = useState(false);

  const handleSaveFees = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;
    setSavingFees(true);
    try {
      await updateFeeSettings(feesForm);
      showFeedback(t('ফি ও পেমেন্ট নম্বর সংরক্ষিত হয়েছে।', 'Fees & Payment settings saved!'));
    } catch (err) {
      showFeedback(t('সংরক্ষণে ব্যর্থ।', 'Failed to update fees.'), 'error');
    } finally {
      setSavingFees(false);
    }
  };

  // -------------------------------------------------------------
  // TAB 6: APPLICATIONS LIST, SEARCH, FILTER, DETAIL, & CSV EXPORT
  // -------------------------------------------------------------
  const [appSearch, setAppSearch] = useState('');
  const [appClassFilter, setAppClassFilter] = useState('all');
  const [appStatusFilter, setAppStatusFilter] = useState('all');
  const [selectedAppDetail, setSelectedAppDetail] = useState<ApplicationItem | null>(null);
  const [internalNoteDraft, setInternalNoteDraft] = useState('');

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.studentNameBn.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.applicationNo.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.guardianPhone.includes(appSearch) ||
      (app.trxId && app.trxId.toLowerCase().includes(appSearch.toLowerCase()));

    const matchesClass = appClassFilter === 'all' || app.appliedClass.toLowerCase() === appClassFilter.toLowerCase();
    const matchesStatus = appStatusFilter === 'all' || app.status === appStatusFilter;

    return matchesSearch && matchesClass && matchesStatus;
  });

  const [lastBackupAt, setLastBackupAt] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('school_last_csv_export_at');
    } catch {
      return null;
    }
  });

  const needsWeeklyBackup = React.useMemo(() => {
    if (!lastBackupAt) return true;
    const elapsedMs = Date.now() - new Date(lastBackupAt).getTime();
    return Number.isNaN(elapsedMs) || elapsedMs > 7 * 24 * 60 * 60 * 1000;
  }, [lastBackupAt]);

  const sanitizeCsvCell = (raw: unknown): string => {
    const str = String(raw ?? '').replace(/\r?\n/g, ' ').trim();
    // Defend against Excel/Sheets formula injection (=, +, -, @, \t, \r)
    const safe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
    return `"${safe.replace(/"/g, '""')}"`;
  };

  const exportApplicationsToCSV = () => {
    if (!isOwner) {
      showFeedback(t('শুধুমাত্র প্রধান শিক্ষক (Owner) CSV ব্যাকআপ ডাউনলোড করতে পারবেন।', 'Only the School Owner can export CSV backups.'), 'error');
      return;
    }
    if (applications.length === 0) {
      showFeedback(t('রপ্তানি করার মতো কোনো আবেদন নেই।', 'No applications to export.'), 'error');
      return;
    }

    // Export safe operational fields only (no verifyHash, no photoUrl base64 blobs)
    const headers = [
      'ApplicationNo',
      'StudentNameBn',
      'StudentNameEn',
      'Class',
      'PreferredGroup',
      'Gender',
      'GuardianPhone',
      'FatherName',
      'TrxID',
      'PaymentMethod',
      'FeeBDT',
      'Status',
      'Address',
      'SubmittedDate',
    ];

    const rows = applications.map((a) => {
      const submittedDate = a.createdAt?.toDate
        ? a.createdAt.toDate().toISOString().split('T')[0]
        : typeof a.createdAt === 'string'
        ? a.createdAt.split('T')[0]
        : '';

      return [
        sanitizeCsvCell(a.applicationNo),
        sanitizeCsvCell(a.studentNameBn),
        sanitizeCsvCell(a.studentNameEn || ''),
        sanitizeCsvCell(a.appliedClass),
        sanitizeCsvCell(a.preferredGroup || ''),
        sanitizeCsvCell(a.gender),
        sanitizeCsvCell(a.guardianPhone),
        sanitizeCsvCell(a.fatherName),
        sanitizeCsvCell(a.trxId || ''),
        sanitizeCsvCell(a.paymentMethod || ''),
        Number(a.admissionFee || 0),
        sanitizeCsvCell(a.status),
        sanitizeCsvCell(a.address),
        sanitizeCsvCell(submittedDate),
      ];
    });

    const csvString = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(schoolConfig.applicationPrefix || 'school').toLowerCase()}_applications_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const nowIso = new Date().toISOString();
    try {
      localStorage.setItem('school_last_csv_export_at', nowIso);
    } catch {
      // ignore storage quota errors
    }
    setLastBackupAt(nowIso);
    showFeedback(t('সুরক্ষিত CSV ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে!', 'Secure CSV backup downloaded successfully!'));
  };

  // -------------------------------------------------------------
  // TAB 7: USERS & ACTIVITY LOGS (OWNER ONLY)
  // -------------------------------------------------------------
  const [newModeratorEmail, setNewModeratorEmail] = useState('');

  const handleAddMod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModeratorEmail.includes('@gmail.com') && !newModeratorEmail.includes('@')) {
      showFeedback(t('অনুগ্রহ করে সঠিক জিমেইল অ্যাড্রেস লিখুন।', 'Please enter a valid Gmail address.'), 'error');
      return;
    }
    try {
      await addModerator(newModeratorEmail);
      setNewModeratorEmail('');
      showFeedback(t('নতুন মডারেটর যুক্ত করা হয়েছে।', 'Moderator added successfully.'));
    } catch (err) {
      showFeedback(t('মডারেটর যুক্ত করতে ব্যর্থ।', 'Failed to add moderator.'), 'error');
    }
  };

  // -------------------------------------------------------------
  // AUTH STATES RENDERER
  // -------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface text-ink flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-heading font-bold text-ink text-lg">
            {t('নিরাপত্তা যাচাই করা হচ্ছে...', 'Verifying credentials...')}
          </p>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Google Sign-in Prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-surface text-ink flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-card rounded-[var(--radius-card)] p-8 border border-line/30 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-[var(--radius-card)] bg-primary-600 text-on-primary flex items-center justify-center mx-auto mb-5 shadow-md">
            <Lock className="w-8 h-8 stroke-[2.2]" />
          </div>

          <h1 className="font-heading font-extrabold text-2xl text-ink">
            {t('প্রশাসক লগইন', 'Admin Portal Access')}
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-2 leading-[1.7]">
            {schoolSettings.nameBn} · {schoolSettings.area}, {schoolSettings.upazila}, {schoolSettings.district}
          </p>

          <div className="my-6 p-3.5 bg-warning-soft rounded-[var(--radius-card)] border border-warning/30 text-xs text-on-warning-soft leading-[1.7]">
            {t(
              'কেবলমাত্র অনুমোদিত অধ্যক্ষ ও মডারেটরগণ গুগল সাইন-ইন করে ড্যাশবোর্ডে প্রবেশ করতে পারবেন।',
              'Only authorized school owners and moderators can access this dashboard via Google sign-in.'
            )}
          </div>

          <button
            type="button"
            onClick={login}
            className="w-full py-3.5 px-6 rounded-[var(--radius-btn)] bg-surface-2 hover:bg-primary-50 text-ink border border-line/40 font-bold text-sm shadow-sm flex items-center justify-center gap-3 active:scale-98 transition-all"
          >
            <GoogleLogoIcon className="w-5 h-5" />
            <span>{t('গুগল দিয়ে প্রবেশ করুন', 'Sign in with Google')}</span>
          </button>

          <button
            type="button"
            onClick={onGoHome}
            className="mt-4 text-xs font-semibold text-ink-muted hover:text-ink transition-colors"
          >
            ← {t('মূল ওয়েবসাইটে ফিরে যান', 'Return to School Homepage')}
          </button>
        </div>
      </div>
    );
  }

  // Logged in with Google, but NOT owner or moderator -> "অনুমতি নেই" (No Access)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-surface text-ink flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-card rounded-[var(--radius-card)] p-8 border border-danger/40 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-[var(--radius-card)] bg-danger-soft text-danger flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10" />
          </div>

          <h1 className="font-heading font-extrabold text-2xl text-ink">
            {t('অনুমতি নেই (Access Denied)', 'No Access Permission')}
          </h1>

          <p className="text-xs sm:text-sm text-ink-muted mt-2 leading-[1.7]">
            {t(
              `আপনি যে গুগল অ্যাকাউন্ট দিয়ে সাইন-ইন করেছেন, তার ${schoolSettings.nameBn} ড্যাশবোর্ডে প্রবেশাধিকার নেই।`,
              'The logged in Google account does not have administrator privileges.'
            )}
          </p>

          <div className="my-5 p-3 bg-surface-2 rounded-[var(--radius-input)] border border-line/25 text-xs font-mono text-ink break-all">
            {user.email}
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={logout}
              className="w-full py-2.5 px-4 rounded-[var(--radius-btn)] bg-danger hover:opacity-90 text-on-danger font-bold text-xs transition-opacity"
            >
              {t('লগআউট করে অন্য অ্যাকাউন্টে চেষ্টা করুন', 'Sign Out')}
            </button>

            <button
              type="button"
              onClick={onGoHome}
              className="w-full py-2.5 px-4 rounded-[var(--radius-btn)] bg-surface-2 hover:bg-primary-50 text-ink border border-line/30 font-bold text-xs transition-colors"
            >
              {t('মূল ওয়েবসাইটে ফিরে যান', 'Return to School Website')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHORIZED ADMIN VIEW (Owner & Moderator)
  // -------------------------------------------------------------
  const navItems = [
    { key: 'overview' as TabKey, label: t('সারসংক্ষেপ', 'Overview'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'settings' as TabKey, label: t('বিদ্যালয়ের তথ্য', 'School Settings'), icon: <Settings className="w-4 h-4" /> },
    ...(isOwner
      ? [{ key: 'appearance' as TabKey, label: t('দৃশ্যমানতা ও থিম', 'Appearance'), icon: <Palette className="w-4 h-4" /> }]
      : []),
    { key: 'photos_staff' as TabKey, label: t('ছবি ও শিক্ষকবৃন্দ', 'Photos & Staff'), icon: <Image className="w-4 h-4" /> },
    { key: 'notices' as TabKey, label: t('নোটিশ বোর্ড', 'Notices'), icon: <BellRing className="w-4 h-4" /> },
    { key: 'fees' as TabKey, label: t('ফি ও পেমেন্ট', 'Fees & Payment'), icon: <CreditCard className="w-4 h-4" />, ownerOnly: true },
    { key: 'applications' as TabKey, label: t('ভর্তি আবেদনসমূহ', 'Applications'), icon: <FileText className="w-4 h-4" />, count: pendingApps.length },
    { key: 'inquiries' as TabKey, label: t('ভিজিট বুকিং', 'Visit Inquiries'), icon: <CalendarCheck className="w-4 h-4" />, count: newInquiriesCount },
    ...(isOwner
      ? [{ key: 'users_logs' as TabKey, label: t('মডারেটর ও লগ', 'Users & Audit Logs'), icon: <Shield className="w-4 h-4" /> }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col">

      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-surface-card text-ink border-b border-line/30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-ink-muted hover:text-ink rounded-[var(--radius-btn)]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[var(--radius-btn)] bg-primary-600 flex items-center justify-center text-on-primary shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-heading font-bold text-sm sm:text-base text-ink block leading-tight">
                  {schoolSettings.nameBn}
                </span>
                <span className="text-[10px] text-primary-700 dark:text-primary-300 font-mono font-bold tracking-wide">
                  {isOwner ? t('প্রধান শিক্ষক (Owner)', 'Owner Portal') : t('মডারেটর (Moderator)', 'Moderator Portal')}
                </span>
              </div>
            </div>
          </div>

          {/* User info & Logout */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onGoHome}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-primary-50 border border-line/30 text-ink text-xs font-semibold rounded-[var(--radius-btn)] transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-primary-600" />
              <span>{t('ওয়েবসাইট দেখুন', 'View Website')}</span>
            </button>

            <div className="text-right hidden md:block">
              <span className="text-xs font-bold text-ink block truncate max-w-[180px]">
                {user.displayName || user.email}
              </span>
              <span className="text-[10px] text-ink-muted font-mono">{user.email}</span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-[var(--radius-btn)] bg-surface-2 hover:bg-danger-soft text-ink-muted hover:text-danger border border-line/25 transition-colors"
              title={t('লগআউট', 'Log out')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Admin Layout: Sidebar + Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">

        {/* Navigation Sidebar (Desktop) */}
        <aside className="hidden md:block w-64 shrink-0 space-y-3">
          <div className="bg-surface-card rounded-[var(--radius-card)] p-3 border border-line/30 shadow-xs space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[var(--radius-btn)] text-xs font-bold transition-all ${
                  activeTab === item.key
                    ? 'bg-primary-600 text-on-primary shadow-xs'
                    : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      activeTab === item.key
                        ? 'bg-surface-card text-primary-700'
                        : 'bg-danger-soft text-on-danger-soft'
                    }`}
                  >
                    {formatNumber(item.count)}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 bg-surface-2 rounded-[var(--radius-card)] border border-line/25 text-[11px] text-ink-muted leading-[1.7] space-y-2">
            <div>
              <p className="font-bold text-primary-700 dark:text-primary-300 mb-0.5">
                {isOwner ? t('পূর্ণ নিয়ন্ত্রণ মোড', 'Full Control Mode') : t('মডারেটর মোড', 'Moderator Mode')}
              </p>
              <p>
                {isOwner
                  ? t('আপনি থিম, ফি সেটিংস, CSV ব্যাকআপ ও মডারেটর তালিকা পরিবর্তন করতে পারেন।', 'You can manage appearance, users, fees, CSV backups and all content.')
                  : t('মডারেটর হিসেবে আপনি আবেদন ও তথ্য হালনাগাদ করতে পারেন।', 'You can manage applications and content.')}
              </p>
            </div>
            <div className="pt-2 border-t border-line/20 text-[10px] text-ink-muted/90">
              <div className="font-bold text-ink">{schoolConfig.brand.productName}</div>
              <div>{schoolConfig.brand.parentCompany}</div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface-card rounded-[var(--radius-card)] p-3 border border-line/30 shadow-lg space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setActiveTab(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[var(--radius-btn)] text-xs font-bold ${
                  activeTab === item.key ? 'bg-primary-600 text-on-primary' : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-danger-soft text-on-danger-soft">
                    {formatNumber(item.count)}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Workspace Main Area */}
        <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 focus:outline-none">

          {/* Feedback Toast Notification */}
          {feedbackMsg && (
            <div
              className={`mb-6 p-4 rounded-[var(--radius-card)] border flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-in slide-in-from-top-2 duration-150 ${
                feedbackMsg.type === 'success'
                  ? 'bg-success-soft text-on-success-soft border-success/30'
                  : 'bg-danger-soft text-on-danger-soft border-danger/30'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-success shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-card rounded-[var(--radius-card)] p-5 border border-line/30 shadow-xs">
                  <span className="text-xs font-bold text-ink-muted uppercase block">{t('আজকের নতুন আবেদন', 'Applications Today')}</span>
                  <span className="text-3xl font-extrabold text-primary-700 dark:text-primary-300 mt-1 block tabular-nums">
                    {formatNumber(todayApps.length)}
                  </span>
                  <span className="text-[11px] text-ink-muted mt-1 block">{t('গত ২৪ ঘণ্টায় জমা', 'Last 24 hours')}</span>
                </div>

                <div className="bg-surface-card rounded-[var(--radius-card)] p-5 border border-line/30 shadow-xs">
                  <span className="text-xs font-bold text-ink-muted uppercase block">{t('মোট আবেদন সংখ্যা', 'Total Applications')}</span>
                  <span className="text-3xl font-extrabold text-ink mt-1 block tabular-nums">
                    {formatNumber(applications.length)}
                  </span>
                  <span className="text-[11px] text-ink-muted mt-1 block">{t('সকল শ্রেণি মিলিয়ে', 'Across all classes')}</span>
                </div>

                <div className="bg-surface-card rounded-[var(--radius-card)] p-5 border border-line/30 shadow-xs">
                  <span className="text-xs font-bold text-warning uppercase block">{t('অপেক্ষমান (Pending)', 'Pending Review')}</span>
                  <span className="text-3xl font-extrabold text-warning mt-1 block tabular-nums">
                    {formatNumber(pendingApps.length)}
                  </span>
                  <span className="text-[11px] text-ink-muted mt-1 block">{t('যাচাই করা প্রয়োজন', 'Awaiting review')}</span>
                </div>

                <div className="bg-surface-card rounded-[var(--radius-card)] p-5 border border-line/30 shadow-xs">
                  <span className="text-xs font-bold text-success uppercase block">{t('অনুমোদিত (Approved)', 'Approved Students')}</span>
                  <span className="text-3xl font-extrabold text-success mt-1 block tabular-nums">
                    {formatNumber(approvedApps.length)}
                  </span>
                  <span className="text-[11px] text-ink-muted mt-1 block">{t('ভর্তি সম্পন্ন', 'Enrolled')}</span>
                </div>
              </div>

              {/* Owner Weekly Backup Reminder */}
              {isOwner && (
                <div className={`rounded-[var(--radius-card)] p-4 sm:p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  needsWeeklyBackup
                    ? 'bg-warning-soft border-warning/35 text-on-warning-soft'
                    : 'bg-surface-card border-line/30 text-ink'
                }`}>
                  <div className="space-y-0.5 text-xs sm:text-sm">
                    <strong className="font-heading font-bold block">
                      {t('সাপ্তাহিক আবেদন ব্যাকআপ রিমাইন্ডার (Owner Only)', 'Weekly Application Backup Reminder (Owner Only)')}
                    </strong>
                    <span className="opacity-90 block text-xs">
                      {lastBackupAt
                        ? t(
                            `সর্বশেষ CSV ব্যাকআপ নেওয়া হয়েছে: ${new Date(lastBackupAt).toLocaleDateString('bn-BD')}। প্রতি সপ্তাহে অন্তত একবার নিরাপদ ব্যাকআপ সংরক্ষণ করুন।`,
                            `Last CSV backup exported: ${new Date(lastBackupAt).toLocaleDateString()}. Export at least once a week for safekeeping.`
                          )
                        : t(
                            'এখনও কোনো CSV ব্যাকআপ ডাউনলোড করা হয়নি। প্রতি সপ্তাহে আবেদনের CSV ব্যাকআপ সংরক্ষণ করার পরামর্শ দেওয়া হলো।',
                            'No CSV backup exported yet. We recommend downloading a CSV backup of all applications every week.'
                          )}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={exportApplicationsToCSV}
                    className="px-4 py-2 rounded-[var(--radius-btn)] bg-primary-600 hover:bg-primary-700 text-on-primary text-xs font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-center shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t('এখনই CSV ব্যাকআপ নিন', 'Export CSV Backup')}</span>
                  </button>
                </div>
              )}

              {/* Recent Applications & Notices Split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Recent Applications Box */}
                <div className="bg-surface-card rounded-[var(--radius-card)] p-6 border border-line/30 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-line/20 mb-4">
                    <h3 className="font-heading font-bold text-base text-ink">
                      {t('সাম্প্রতিক ভর্তি আবেদনসমূহ', 'Recent Applications')}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('applications')}
                      className="text-xs font-semibold text-primary-700 dark:text-primary-300 hover:underline"
                    >
                      {t('সবগুলো দেখুন →', 'View All →')}
                    </button>
                  </div>

                  {applications.length === 0 ? (
                    <div className="p-8 text-center text-ink-muted text-xs">
                      {t('এখনও কোনো আবেদন জমা পড়েনি।', 'No admission applications received yet.')}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {applications.slice(0, 5).map((app) => (
                        <div
                          key={app.id}
                          onClick={() => {
                            setSelectedAppDetail(app);
                            setActiveTab('applications');
                          }}
                          className="cursor-pointer p-3 rounded-[var(--radius-btn)] bg-surface-2 hover:bg-primary-50/40 border border-line/25 transition-colors flex items-center justify-between gap-3"
                        >
                          <div>
                            <strong className="text-xs sm:text-sm text-ink block font-bold">
                              {app.studentNameBn}
                            </strong>
                            <span className="text-[11px] text-ink-muted">
                              {app.appliedClass} · {app.guardianPhone}
                            </span>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              app.status === 'approved'
                                ? 'bg-success-soft text-on-success-soft'
                                : app.status === 'pending'
                                ? 'bg-warning-soft text-on-warning-soft'
                                : 'bg-surface border border-line/30 text-ink-muted'
                            }`}
                          >
                            {app.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Notices Box */}
                <div className="bg-surface-card rounded-[var(--radius-card)] p-6 border border-line/30 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-line/20 mb-4">
                    <h3 className="font-heading font-bold text-base text-ink">
                      {t('বর্তমান নোটিশসমূহ', 'Current Notices')}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('notices')}
                      className="text-xs font-semibold text-primary-700 dark:text-primary-300 hover:underline"
                    >
                      {t('নতুন তৈরি করুন +', 'Create New +')}
                    </button>
                  </div>

                  {notices.length === 0 ? (
                    <div className="p-8 text-center text-ink-muted text-xs">
                      {t('কোনো সক্রিয় নোটিশ নেই।', 'No notices posted.')}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notices.slice(0, 4).map((n) => (
                        <div key={n.id} className="p-3 bg-surface-2 rounded-[var(--radius-btn)] border border-line/25 text-xs">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <strong className="text-ink font-bold">{n.title}</strong>
                            {n.isAdmissionNotice && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  n.admissionActive ? 'bg-success-soft text-on-success-soft' : 'bg-surface border border-line/30 text-ink-muted'
                                }`}
                              >
                                {n.admissionActive ? t('ব্যানার সক্রিয়', 'Banner Active') : t('বন্ধ', 'Inactive')}
                              </span>
                            )}
                          </div>
                          <p className="text-ink-muted line-clamp-1">{n.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB: APPEARANCE (OWNER ONLY) */}
          {activeTab === 'appearance' && isOwner && (
            <AppearanceTab onNotify={showFeedback} />
          )}

          {/* TAB 2: SCHOOL SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/30 shadow-xs">
              <div className="pb-4 border-b border-line/25 mb-6">
                <h2 className="font-heading font-extrabold text-xl text-ink">
                  {t('বিদ্যালয়ের সাধারণ তথ্য ও ব্র্যান্ডিং', 'School Settings & Branding')}
                </h2>
                <p className="text-xs text-ink-muted mt-1">
                  {t('এখানে পরিবর্তন করলে মূল পাবলিক ওয়েবসাইটে তা তাৎক্ষণিকভাবে প্রতিফলিত হবে।', 'Changes here reflect on the public website immediately.')}
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">

                {/* 1. SCHOOL LEVEL PRESET SELECTOR */}
                <div className="p-5 rounded-[var(--radius-card)] bg-surface-2 border border-line/30 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-heading font-extrabold text-base text-ink flex items-center gap-2">
                        <Layers className="w-5 h-5 text-primary-600" />
                        <span>{t('বিদ্যালয়ের স্তর ও প্রিসেট নির্বাচন (School Level Template)', 'School Level Preset Template')}</span>
                      </h3>
                      <p className="text-xs text-ink-muted">
                        {t('প্রিসেট পরিবর্তন করলে পাঠ্যক্রমের শ্রেণি তালিকা, ভর্তি ফরম ও ফি চার্ট স্বয়ংক্রিয়ভাবে পুনর্বিন্যাস হবে। থিম আলাদা রাখতে চাইলে "দৃশ্যমানতা ও থিম" ট্যাব দেখুন।', 'Switching level reconfigures the curriculum road, admission form & fee matrix without altering visual theme.')}
                      </p>
                    </div>

                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('appearance')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-card hover:bg-primary-50 text-primary-700 dark:text-primary-300 border border-line/30 rounded-[var(--radius-btn)] text-xs font-bold self-start sm:self-center shrink-0 transition-colors"
                      >
                        <Palette className="w-3.5 h-3.5" />
                        <span>{t('থিম ও রঙ কাস্টমাইজ →', 'Customize Theme →')}</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        switchPreset('kindergarten');
                        const p = presets.kindergarten;
                        setSettingsForm((prev) => ({
                          ...prev,
                          nameBn: p.identity?.name.bn || '',
                          nameEn: p.identity?.name.en || '',
                          sloganBn: p.identity?.slogan.bn || '',
                          sloganEn: p.identity?.slogan.en || '',
                          schoolCode: p.schoolCode || '',
                          registrationNo: p.registrationNo || '',
                          schoolType: 'kindergarten',
                        }));
                      }}
                      className={`p-3.5 rounded-[var(--radius-btn)] border text-left transition-all ${
                        schoolType === 'kindergarten'
                          ? 'bg-primary-600 text-on-primary border-primary-700 shadow-md ring-2 ring-ring/30'
                          : 'bg-surface-card text-ink border-line/30 hover:border-primary-400'
                      }`}
                    >
                      <div className="font-bold text-sm">
                        {t('কিন্ডারগার্টেন (Kindergarten)', 'Kindergarten Preset')}
                      </div>
                      <div className={`text-xs mt-1 ${schoolType === 'kindergarten' ? 'text-on-primary/85' : 'text-ink-muted'}`}>
                        {t('প্লে, নার্সারি, কেজি ও ১ম-৫ম শ্রেণি', 'Play, Nursery, KG & Class 1-5')}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        switchPreset('primary');
                        const p = presets.primary;
                        setSettingsForm((prev) => ({
                          ...prev,
                          nameBn: p.identity?.name.bn || '',
                          nameEn: p.identity?.name.en || '',
                          sloganBn: p.identity?.slogan.bn || '',
                          sloganEn: p.identity?.slogan.en || '',
                          eiin: p.eiin || '123456',
                          mpoStatus: p.mpoStatus || '',
                          schoolCode: p.schoolCode || '',
                          registrationNo: p.registrationNo || '',
                          schoolType: 'primary',
                        }));
                      }}
                      className={`p-3.5 rounded-[var(--radius-btn)] border text-left transition-all ${
                        schoolType === 'primary'
                          ? 'bg-primary-600 text-on-primary border-primary-700 shadow-md ring-2 ring-ring/30'
                          : 'bg-surface-card text-ink border-line/30 hover:border-primary-400'
                      }`}
                    >
                      <div className="font-bold text-sm">
                        {t('প্রাথমিক বিদ্যালয় (Primary School)', 'Primary School Preset')}
                      </div>
                      <div className={`text-xs mt-1 ${schoolType === 'primary' ? 'text-on-primary/85' : 'text-ink-muted'}`}>
                        {t('১ম থেকে ৫ম শ্রেণি (৫টি গ্রেড)', 'Class 1 to 5 (5 Grades)')}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        switchPreset('highschool');
                        const p = presets.highschool;
                        setSettingsForm((prev) => ({
                          ...prev,
                          nameBn: p.identity?.name.bn || '',
                          nameEn: p.identity?.name.en || '',
                          sloganBn: p.identity?.slogan.bn || '',
                          sloganEn: p.identity?.slogan.en || '',
                          eiin: p.eiin || '134567',
                          mpoStatus: p.mpoStatus || '',
                          schoolCode: p.schoolCode || '',
                          registrationNo: p.registrationNo || '',
                          schoolType: 'highschool',
                        }));
                      }}
                      className={`p-3.5 rounded-[var(--radius-btn)] border text-left transition-all ${
                        schoolType === 'highschool'
                          ? 'bg-primary-600 text-on-primary border-primary-700 shadow-md ring-2 ring-ring/30'
                          : 'bg-surface-card text-ink border-line/30 hover:border-primary-400'
                      }`}
                    >
                      <div className="font-bold text-sm">
                        {t('উচ্চ বিদ্যালয় (High School)', 'High School Preset')}
                      </div>
                      <div className={`text-xs mt-1 ${schoolType === 'highschool' ? 'text-on-primary/85' : 'text-ink-muted'}`}>
                        {t('৬ষ্ঠ-১০ম শ্রেণি, বিজ্ঞান/বাণিজ্য/মানবিক ও এসএসসি', 'Class 6-10, Groups & SSC Road')}
                      </div>
                    </button>
                  </div>
                </div>

                {/* School Logo Upload & Preview */}
                <div className="p-4 rounded-[var(--radius-card)] bg-surface-2 border border-line/25">
                  <label className="block text-xs font-bold text-ink mb-2">
                    {t('বিদ্যালয়ের অফিসিয়াল লোগো (স্বয়ংক্রিয় অপ্টিমাইজড)', 'School Official Logo (Auto Optimized)')}
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="w-16 h-16 rounded-[var(--radius-card)] bg-surface-card border border-line/30 flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
                      {settingsForm.logoUrl ? (
                        <img src={settingsForm.logoUrl} alt="Logo Preview" className="w-full h-full object-contain p-1" />
                      ) : uploadingLogo ? (
                        <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                      ) : (
                        <Image className="w-8 h-8 text-primary-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <label className={`cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-on-primary text-xs font-bold rounded-[var(--radius-btn)] transition-colors ${uploadingLogo ? 'opacity-60 pointer-events-none' : ''}`}>
                          {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          <span>{uploadingLogo ? t('লোগো অপ্টিমাইজ হচ্ছে...', 'Optimizing...') : t('ডিভাইস থেকে আপলোড', 'Upload Logo File')}</span>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploadingLogo} className="hidden" />
                        </label>
                        {settingsForm.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setSettingsForm({ ...settingsForm, logoUrl: '' })}
                            className="px-3 py-2 text-danger hover:bg-danger-soft text-xs font-semibold rounded-[var(--radius-btn)]"
                          >
                            {t('লোগো সরান', 'Remove')}
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-muted mt-1">
                        {t('১২ মেগাবাইট পর্যন্ত যেকোনো ইমেজ ফাইল। ক্যানভাসে স্বয়ংক্রিয়ভাবে রিসাইজ হবে (সর্বোচ্চ ৪৮০ পিক্সেল)।', 'Accepts files up to 12MB. Resized automatically via canvas to max 480px.')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('বিদ্যালয়ের নাম (বাংলায়) *', 'School Name (Bengali) *')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.nameBn}
                      onChange={(e) => setSettingsForm({ ...settingsForm, nameBn: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('বিদ্যালয়ের নাম (ইংরেজিতে) *', 'School Name (English) *')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.nameEn}
                      onChange={(e) => setSettingsForm({ ...settingsForm, nameEn: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('স্লোগান (বাংলায়)', 'Tagline (Bengali)')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.sloganBn}
                      onChange={(e) => setSettingsForm({ ...settingsForm, sloganBn: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('স্লোগান (ইংরেজিতে)', 'Tagline (English)')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.sloganEn}
                      onChange={(e) => setSettingsForm({ ...settingsForm, sloganEn: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
                    />
                  </div>
                </div>

                {/* Hero Headline Texts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-line/20">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('হোমপেজ হিরো শিরোনাম (বাংলা)', 'Hero Headline (Bengali)')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroTitleBn}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroTitleBn: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('হোমপেজ হিরো শিরোনাম (ইংরেজি)', 'Hero Headline (English)')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroTitleEn}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroTitleEn: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
                    />
                  </div>
                </div>

                {/* Location & Contacts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-line/20">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('প্রধান সড়ক / ঠিকানা', 'Address')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.addressLine}
                      onChange={(e) => setSettingsForm({ ...settingsForm, addressLine: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('হটলাইন ফোন ১', 'Primary Hotline')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phonePrimary}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phonePrimary: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('হোয়াটসঅ্যাপ নম্বর', 'WhatsApp Number')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-sm focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
                    />
                  </div>
                </div>

                {/* Institutional Credentials & Board Identity */}
                <div className="p-4 bg-surface-2 rounded-[var(--radius-card)] border border-line/25 space-y-3">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4 text-success" />
                    <span>{t('প্রাতিষ্ঠানিক পরিচিতি ও সরকারি স্বীকৃতি (EIIN, MPO & Code)', 'Institutional Identity (EIIN, MPO & Code)')}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">
                        {t('ইআইআইএন (EIIN)', 'EIIN Number')}
                      </label>
                      <input
                        type="text"
                        value={settingsForm.eiin || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, eiin: e.target.value })}
                        placeholder="e.g. 134567"
                        className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs font-mono font-bold bg-surface text-ink"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">
                        {t('এমপিও স্ট্যাটাস (MPO Status)', 'MPO Status')}
                      </label>
                      <input
                        type="text"
                        value={settingsForm.mpoStatus || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, mpoStatus: e.target.value })}
                        placeholder={t('এমপিওভুক্ত / নন-এমপিও', 'MPO Enlisted / Non-MPO')}
                        className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs bg-surface text-ink"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">
                        {t('বিদ্যালয় কোড (School Code)', 'School Code')}
                      </label>
                      <input
                        type="text"
                        value={settingsForm.schoolCode || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, schoolCode: e.target.value })}
                        placeholder={`e.g. ${schoolConfig.applicationPrefix}-4509`}
                        className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs font-mono font-bold bg-surface text-ink"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">
                        {t('নিবন্ধন নং (Reg No)', 'Registration No')}
                      </label>
                      <input
                        type="text"
                        value={settingsForm.registrationNo || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, registrationNo: e.target.value })}
                        placeholder="কুড়ি/রাজা/কেজি/২০১৬-৭৮"
                        className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs bg-surface text-ink"
                      />
                    </div>
                  </div>
                </div>

                {/* Homepage Achievement Counters */}
                <div className="p-4 bg-surface-2 rounded-[var(--radius-card)] border border-line/25 space-y-3">
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary-600" />
                    <span>{t('হোমপেজ অর্জন ও পরিসংখ্যান (Achievement Counters)', 'Homepage Achievement Counters')}</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">
                        {t('মোট শিক্ষার্থী', 'Total Students')}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={settingsForm.stats?.studentsCount ?? ''}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            stats: {
                              ...settingsForm.stats,
                              studentsCount: Number(e.target.value) || 0,
                            },
                          })
                        }
                        placeholder="350"
                        className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs font-mono font-bold bg-surface text-ink"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">
                        {t('অভিজ্ঞ শিক্ষক', 'Total Teachers')}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={settingsForm.stats?.teachersCount ?? ''}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            stats: {
                              ...settingsForm.stats,
                              teachersCount: Number(e.target.value) || 0,
                            },
                          })
                        }
                        placeholder="18"
                        className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs font-mono font-bold bg-surface text-ink"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">
                        {t('অভিজ্ঞতার বছর', 'Years of Service')}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={settingsForm.stats?.yearsCount ?? ''}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            stats: {
                              ...settingsForm.stats,
                              yearsCount: Number(e.target.value) || 0,
                            },
                          })
                        }
                        placeholder="12"
                        className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs font-mono font-bold bg-surface text-ink"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">
                        {t('পাসের হার / সাফল্য', 'Success Rate')}
                      </label>
                      <input
                        type="text"
                        value={settingsForm.stats?.successRate ?? ''}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            stats: {
                              ...settingsForm.stats,
                              successRate: e.target.value,
                            },
                          })
                        }
                        placeholder="100%"
                        className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs font-mono font-bold bg-surface text-ink"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-on-primary font-bold text-sm rounded-[var(--radius-btn)] shadow-md transition-colors"
                  >
                    {savingSettings ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('পরিবর্তন সংরক্ষণ করুন', 'Save Settings')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: PHOTOS & STAFF */}
          {activeTab === 'photos_staff' && (
            <div className="space-y-8">

              {/* Teachers / Staff Section */}
              <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/30 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-line/25 mb-6">
                  <div>
                    <h3 className="font-heading font-extrabold text-xl text-ink">
                      {t('শিক্ষকমণ্ডলীর তালিকা ও পরিচিতি', 'Faculty Members & Profiles')}
                    </h3>
                    <p className="text-xs text-ink-muted">{t('পাবলিক পেজে দৃশ্যমান শিক্ষক তালিকা', 'Shown on public teachers section')}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingStaff({
                        nameBn: '',
                        nameEn: '',
                        roleBn: 'সহকারী শিক্ষক',
                        roleEn: 'Assistant Teacher',
                        qualification: '',
                        bio: '',
                        photoUrl: '',
                        order: staffList.length,
                      })
                    }
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-on-primary text-xs font-bold rounded-[var(--radius-btn)] flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('নতুন শিক্ষক যুক্ত করুন', 'Add Teacher')}</span>
                  </button>
                </div>

                {/* Edit / Create Staff Form */}
                {editingStaff && (
                  <form onSubmit={handleSaveStaffForm} className="mb-6 p-5 bg-surface-2 rounded-[var(--radius-card)] border border-line/30 space-y-4">
                    <h4 className="text-xs font-bold text-primary-700 dark:text-primary-300 uppercase">
                      {editingStaff.id ? t('শিক্ষকের তথ্য সম্পাদন', 'Edit Teacher') : t('নতুন শিক্ষক নিবন্ধন', 'New Teacher Form')}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-ink mb-1">{t('নাম (বাংলা) *', 'Name (Bengali) *')}</label>
                        <input
                          type="text"
                          required
                          value={editingStaff.nameBn || ''}
                          onChange={(e) => setEditingStaff({ ...editingStaff, nameBn: e.target.value })}
                          className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-sm bg-surface text-ink"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-ink mb-1">{t('পদবি (বাংলা) *', 'Designation (Bengali) *')}</label>
                        <input
                          type="text"
                          required
                          value={editingStaff.roleBn || ''}
                          onChange={(e) => setEditingStaff({ ...editingStaff, roleBn: e.target.value })}
                          className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-sm bg-surface text-ink"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-ink mb-1">{t('শিক্ষাগত যোগ্যতা', 'Qualification')}</label>
                        <input
                          type="text"
                          value={editingStaff.qualification || ''}
                          onChange={(e) => setEditingStaff({ ...editingStaff, qualification: e.target.value })}
                          placeholder="e.g. বি.এস.সি (গণিত), বি.এড"
                          className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-sm bg-surface text-ink"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-ink mb-1">{t('বাণী বা দর্শন', 'Teaching Quote/Bio')}</label>
                        <input
                          type="text"
                          value={editingStaff.bio || ''}
                          onChange={(e) => setEditingStaff({ ...editingStaff, bio: e.target.value })}
                          className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-sm bg-surface text-ink"
                        />
                      </div>
                    </div>

                    {/* Teacher Photo Upload */}
                    <div className="p-3 bg-surface-card rounded-[var(--radius-input)] border border-line/25">
                      <label className="block text-xs font-bold text-ink mb-1.5">
                        {t('শিক্ষকের পাসপোর্ট ছবি (১২MB পর্যন্ত, স্বয়ংক্রিয় অপ্টিমাইজড)', 'Teacher Photograph (up to 12MB, auto-optimized)')}
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[var(--radius-btn)] bg-surface-2 border border-line/35 flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
                          {editingStaff.photoUrl ? (
                            <img src={editingStaff.photoUrl} alt="Staff Preview" className="w-full h-full object-cover" />
                          ) : uploadingStaffPhoto ? (
                            <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                          ) : (
                            <Image className="w-5 h-5 text-ink-muted" />
                          )}
                        </div>

                        <div className="flex-1 flex flex-wrap items-center gap-2">
                          <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-on-primary text-xs font-bold rounded-[var(--radius-btn)] transition-colors ${uploadingStaffPhoto ? 'opacity-60 pointer-events-none' : ''}`}>
                            {uploadingStaffPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            <span>{uploadingStaffPhoto ? t('অপ্টিমাইজ হচ্ছে...', 'Optimizing...') : t('ছবি আপলোড করুন', 'Upload Photo')}</span>
                            <input type="file" accept="image/*" onChange={handleStaffPhotoUpload} disabled={uploadingStaffPhoto} className="hidden" />
                          </label>
                          {editingStaff.photoUrl && (
                            <button
                              type="button"
                              onClick={() => setEditingStaff({ ...editingStaff, photoUrl: '' })}
                              className="px-2.5 py-1 text-xs text-danger hover:bg-danger-soft rounded-[var(--radius-btn)]"
                            >
                              {t('ছবি সরান', 'Remove')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingStaff(null)}
                        className="px-4 py-2 text-xs font-semibold text-ink-muted hover:text-ink"
                      >
                        {t('বাতিল', 'Cancel')}
                      </button>
                      <button type="submit" className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-on-primary text-xs font-bold rounded-[var(--radius-btn)]">
                        {t('সংরক্ষণ করুন', 'Save Teacher')}
                      </button>
                    </div>
                  </form>
                )}

                {/* Staff Cards List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {staffList.map((st) => (
                    <div key={st.id} className="p-4 rounded-[var(--radius-card)] bg-surface-2 border border-line/25 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-primary-700 dark:text-primary-300">{st.roleBn}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingStaff(st)}
                              className="p-1 text-ink-muted hover:text-primary-600"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteStaff(st.id)}
                              className="p-1 text-ink-muted hover:text-danger"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-2">
                          {st.photoUrl ? (
                            <img src={st.photoUrl} alt={st.nameBn} className="w-10 h-10 rounded-[var(--radius-btn)] object-cover border border-line/30 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-[var(--radius-btn)] bg-primary-100 text-primary-900 flex items-center justify-center font-bold text-sm shrink-0">
                              {st.nameBn.charAt(0)}
                            </div>
                          )}
                          <div>
                            <strong className="text-sm font-bold text-ink block">{st.nameBn}</strong>
                            <p className="text-[11px] text-ink-muted">{st.qualification}</p>
                          </div>
                        </div>

                        {st.bio && <p className="text-xs text-ink-muted italic line-clamp-2">"{st.bio}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery Photos Section */}
              <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/30 shadow-xs">
                <div className="pb-4 border-b border-line/25 mb-6">
                  <h3 className="font-heading font-extrabold text-xl text-ink">
                    {t('ফটো গ্যালারি ব্যবস্থাপনা', 'Photo Gallery Management')}
                  </h3>
                  <p className="text-xs text-ink-muted">{t('ক্যাম্পাস, শ্রেণিকক্ষ ও বার্ষিক অনুষ্ঠানের ছবি', 'Building, classes, events')}</p>
                </div>

                {/* Add Photo Form */}
                <form onSubmit={handleAddPhoto} className="mb-6 p-4 bg-surface-2 rounded-[var(--radius-card)] border border-line/25 space-y-3">
                  <span className="text-xs font-bold text-ink block">{t('নতুন ছবি যুক্ত করুন', 'Add New Photo')}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <input
                      type="text"
                      required
                      placeholder={t('ছবির শিরোনাম...', 'Photo Title...')}
                      value={newPhotoTitle}
                      onChange={(e) => setNewPhotoTitle(e.target.value)}
                      className="px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs bg-surface text-ink"
                    />
                    <select
                      value={newPhotoCategory}
                      onChange={(e: any) => setNewPhotoCategory(e.target.value)}
                      className="px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs bg-surface text-ink"
                    >
                      <option value="classes">{t('শ্রেণিকক্ষ (Classes)', 'Classes')}</option>
                      <option value="building">{t('ভবন ও ক্যাম্পাস (Building)', 'Building')}</option>
                      <option value="events">{t('অনুষ্ঠান ও ক্রীড়া (Events)', 'Events')}</option>
                      <option value="nature">{t('বাগান ও প্রকৃতি (Nature)', 'Nature')}</option>
                    </select>
                    <input
                      type="text"
                      required
                      placeholder={t('ছবির URL বা পাথ...', 'Photo URL / Path...')}
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      className="px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs bg-surface text-ink"
                    />
                    <label className={`cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-card hover:bg-primary-50 text-ink text-xs font-bold rounded-[var(--radius-btn)] border border-line/40 transition-colors shadow-xs ${uploadingGalleryPhoto ? 'opacity-60 pointer-events-none' : ''}`}>
                      {uploadingGalleryPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600" /> : <Upload className="w-3.5 h-3.5 text-primary-600" />}
                      <span>{uploadingGalleryPhoto ? t('অপ্টিমাইজ হচ্ছে...', 'Optimizing...') : t('ফাইল আপলোড করুন', 'Upload File')}</span>
                      <input type="file" accept="image/*" onChange={handleGalleryPhotoUpload} disabled={uploadingGalleryPhoto} className="hidden" />
                    </label>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-ink-muted">
                      {t('১২MB পর্যন্ত যেকোনো ছবি নির্বাচন করতে পারেন। ব্রাউজারে স্বয়ংক্রিয়ভাবে রিসাইজ (<২০০KB, ১২৮০px) হবে।', 'Accepts photos up to 12MB. Automatically compressed under 200KB (max 1280px).')}
                    </p>
                    <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-on-primary text-xs font-bold rounded-[var(--radius-btn)] shrink-0">
                      {t('ছবি যুক্ত করুন', 'Add Photo')}
                    </button>
                  </div>
                </form>

                {/* Photos Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {galleryPhotos.map((photo) => (
                    <div key={photo.id} className="relative group rounded-[var(--radius-card)] overflow-hidden border border-line/25 bg-surface-2">
                      <div className="aspect-[4/3]">
                        <img src={photo.photoUrl} alt={photo.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2.5 bg-surface-card text-xs">
                        <span className="text-[10px] font-bold text-primary-700 dark:text-primary-300 uppercase block">{photo.category}</span>
                        <strong className="text-ink truncate block">{photo.title}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteGalleryPhoto(photo.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-danger text-on-danger opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parent Testimonials Section */}
              <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/30 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-line/25 mb-6">
                  <div>
                    <h3 className="font-heading font-extrabold text-xl text-ink flex items-center gap-2">
                      <MessageSquareQuote className="w-5 h-5 text-primary-600" />
                      <span>{t('অভিভাবকদের অভিমত (Testimonials)', 'Parent Testimonials')}</span>
                    </h3>
                    <p className="text-xs text-ink-muted">
                      {t('হোমপেজের আস্থা ও মতামত সেকশনে প্রদর্শিত লাইভ অভিভাবক মন্তব্য।', 'Live guardian quotes displayed on the homepage testimonials section.')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingTestimonial({
                        parentNameBn: '',
                        parentNameEn: '',
                        childGradeBn: '',
                        childGradeEn: '',
                        locationBn: schoolSettings.area,
                        locationEn: '',
                        feedbackBn: '',
                        feedbackEn: '',
                        order: testimonials.length,
                      })
                    }
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-on-primary text-xs font-bold rounded-[var(--radius-btn)] flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('নতুন অভিমত যোগ করুন', 'Add Testimonial')}</span>
                  </button>
                </div>

                {editingTestimonial && (
                  <form onSubmit={handleSaveTestimonialForm} className="mb-6 p-5 bg-surface-2 rounded-[var(--radius-card)] border border-line/30 space-y-4">
                    <h4 className="text-xs font-bold text-primary-700 dark:text-primary-300 uppercase">
                      {editingTestimonial.id ? t('অভিমত সম্পাদন', 'Edit Testimonial') : t('নতুন অভিভাবক অভিমত', 'New Testimonial')}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder={t('অভিভাবকের নাম (বাংলা) *', 'Parent Name (Bengali) *')}
                        value={editingTestimonial.parentNameBn || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, parentNameBn: e.target.value })}
                        className="px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs bg-surface text-ink"
                      />
                      <input
                        type="text"
                        placeholder={t('অভিভাবকের নাম (ইংরেজি)', 'Parent Name (English)')}
                        value={editingTestimonial.parentNameEn || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, parentNameEn: e.target.value })}
                        className="px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs bg-surface text-ink"
                      />
                      <input
                        type="text"
                        placeholder={t('সন্তানের শ্রেণি (বাংলা)', 'Student Class (Bengali)')}
                        value={editingTestimonial.childGradeBn || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, childGradeBn: e.target.value })}
                        className="px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs bg-surface text-ink"
                      />
                      <input
                        type="text"
                        placeholder={t('এলাকা / ঠিকানা (বাংলা)', 'Location (Bengali)')}
                        value={editingTestimonial.locationBn || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, locationBn: e.target.value })}
                        className="px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs bg-surface text-ink"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <textarea
                        rows={2}
                        required
                        placeholder={t('অভিভাবকের মতামত (বাংলা) *', 'Feedback Quote (Bengali) *')}
                        value={editingTestimonial.feedbackBn || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, feedbackBn: e.target.value })}
                        className="px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs bg-surface text-ink"
                      />
                      <textarea
                        rows={2}
                        placeholder={t('অভিভাবকের মতামত (ইংরেজি)', 'Feedback Quote (English)')}
                        value={editingTestimonial.feedbackEn || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, feedbackEn: e.target.value })}
                        className="px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs bg-surface text-ink"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingTestimonial(null)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-ink-muted hover:text-ink"
                      >
                        {t('বাতিল', 'Cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-on-primary text-xs font-bold rounded-[var(--radius-btn)]"
                      >
                        {t('সংরক্ষণ করুন', 'Save Testimonial')}
                      </button>
                    </div>
                  </form>
                )}

                {testimonials.length === 0 ? (
                  <p className="text-xs text-ink-muted py-4">
                    {t(
                      'লাইভ Firestore-এ কোনো অভিমত নেই (ডিফল্ট কনফিগ অভিমত প্রদর্শিত হচ্ছে)। নতুন অভিমত যোগ করলে তা লাইভে প্রদর্শিত হবে।',
                      'No live Firestore testimonials yet (default config testimonials are displayed until you add one).'
                    )}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {testimonials.map((item) => (
                      <div key={item.id} className="p-4 rounded-[var(--radius-card)] bg-surface-2 border border-line/25 flex flex-col justify-between gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <strong className="text-sm font-bold text-ink block">{item.parentNameBn}</strong>
                            <span className="text-[11px] text-ink-muted">
                              {item.childGradeBn}{item.locationBn ? ` · ${item.locationBn}` : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setEditingTestimonial(item)}
                              className="p-1 text-ink-muted hover:text-primary-600"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTestimonial(item.id)}
                              className="p-1 text-ink-muted hover:text-danger"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-ink-muted italic leading-[1.7]">"{item.feedbackBn}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: NOTICES */}
          {activeTab === 'notices' && (
            <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/30 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-line/25 mb-6">
                <div>
                  <h2 className="font-heading font-extrabold text-xl text-ink">
                    {t('নোটিশ ও ভর্তি ব্যানার নিয়ন্ত্রণ', 'Notice Board & Admission Switch')}
                  </h2>
                  <p className="text-xs text-ink-muted">
                    {t('বিশেষ ভর্তি নোটিশের অন/অফ সুইচ হোমপেজের ব্যানার ও কাউন্টডাউন নিয়ন্ত্রণ করে।', 'The special admission notice switch directly toggles the homepage countdown banner.')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditingNotice({
                      title: '',
                      content: '',
                      isAdmissionNotice: false,
                      admissionActive: false,
                      startDate: new Date().toISOString().split('T')[0],
                      endDate: '2026-12-31',
                    })
                  }
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-on-primary text-xs font-bold rounded-[var(--radius-btn)] flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('নতুন নোটিশ তৈরি', 'New Notice')}</span>
                </button>
              </div>

              {/* Edit / New Notice Form */}
              {editingNotice && (
                <form onSubmit={handleSaveNoticeForm} className="mb-6 p-5 bg-surface-2 rounded-[var(--radius-card)] border border-line/30 space-y-4">
                  <h4 className="text-xs font-bold text-primary-700 dark:text-primary-300 uppercase">
                    {editingNotice.id ? t('নোটিশ সম্পাদন', 'Edit Notice') : t('নতুন নোটিশ খসড়া', 'Draft Notice')}
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">{t('নোটিশের শিরোনাম *', 'Notice Title *')}</label>
                    <input
                      type="text"
                      required
                      value={editingNotice.title || ''}
                      onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })}
                      placeholder={t('যেমন: নতুন শিক্ষাবর্ষে প্লে থেকে ৫ম শ্রেণিতে ভর্তি চলছে', 'e.g. Admission open for upcoming year')}
                      className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 text-sm bg-surface text-ink"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">{t('বিস্তারিত বিবরণ *', 'Notice Content *')}</label>
                    <textarea
                      rows={3}
                      required
                      value={editingNotice.content || ''}
                      onChange={(e) => setEditingNotice({ ...editingNotice, content: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 text-sm bg-surface text-ink"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">{t('শুরুর তারিখ', 'Start Date')}</label>
                      <input
                        type="date"
                        value={editingNotice.startDate || ''}
                        onChange={(e) => setEditingNotice({ ...editingNotice, startDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs bg-surface text-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">{t('শেষ তারিখ (কাউন্টডাউন সমাপ্তি)', 'End Date / Deadline')}</label>
                      <input
                        type="date"
                        value={editingNotice.endDate || ''}
                        onChange={(e) => setEditingNotice({ ...editingNotice, endDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs bg-surface text-ink"
                      />
                    </div>
                  </div>

                  {/* Special Admission Notice Switch */}
                  <div className="p-4 bg-surface-card rounded-[var(--radius-btn)] border border-line/30 flex items-center justify-between gap-4">
                    <div>
                      <strong className="text-xs font-bold text-ink block">
                        {t('এটি কি একটি বিশেষ "ভর্তি বিজ্ঞপ্তি"?', 'Is this a special "Admission Notice"?')}
                      </strong>
                      <span className="text-[11px] text-ink-muted">
                        {t('এটি অন করলে হোমপেজে বড় ভর্তি ব্যানার ও লাইভ কাউন্টডাউন টাইমার সক্রিয় হবে।', 'Controls the homepage prominent countdown banner.')}
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingNotice.isAdmissionNotice && editingNotice.admissionActive)}
                        onChange={(e) =>
                          setEditingNotice({
                            ...editingNotice,
                            isAdmissionNotice: true,
                            admissionActive: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-2 border border-line/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-card after:border-line/40 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingNotice(null)}
                      className="px-4 py-2 text-xs font-semibold text-ink-muted hover:text-ink"
                    >
                      {t('বাতিল', 'Cancel')}
                    </button>
                    <button type="submit" className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-on-primary text-xs font-bold rounded-[var(--radius-btn)]">
                      {t('নোটিশ সংরক্ষণ করুন', 'Save Notice')}
                    </button>
                  </div>
                </form>
              )}

              {/* Notices List */}
              <div className="space-y-4">
                {notices.map((n) => (
                  <div key={n.id} className="p-5 rounded-[var(--radius-card)] bg-surface-2 border border-line/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm sm:text-base font-bold text-ink">{n.title}</strong>
                        {n.isAdmissionNotice && (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              n.admissionActive ? 'bg-success-soft text-on-success-soft' : 'bg-surface border border-line/30 text-ink-muted'
                            }`}
                          >
                            {n.admissionActive ? t('ভর্তি ব্যানার চালু', 'Banner Active') : t('ব্যানার বন্ধ', 'Banner Inactive')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-ink-muted">{n.content}</p>
                      {n.endDate && (
                        <span className="text-[11px] text-ink-muted block font-mono">
                          {t('মেয়াদ:', 'Deadline:')} {n.endDate}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {n.isAdmissionNotice && (
                        <button
                          type="button"
                          onClick={() => toggleAdmissionBanner(n)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-[var(--radius-btn)] border transition-colors ${
                            n.admissionActive
                              ? 'bg-warning-soft text-on-warning-soft border-warning/30'
                              : 'bg-surface-card text-ink border-line/35 hover:bg-primary-50'
                          }`}
                        >
                          {n.admissionActive ? t('ব্যানার বন্ধ করুন', 'Turn Off Banner') : t('ব্যানার চালু করুন', 'Turn On Banner')}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setEditingNotice(n)}
                        className="p-2 text-ink-muted hover:text-primary-600"
                        title="Edit notice"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteNotice(n.id)}
                        className="p-2 text-ink-muted hover:text-danger"
                        title="Delete notice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 5: FEES & PAYMENT (OWNER ONLY) */}
          {activeTab === 'fees' && (
            <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/30 shadow-xs">
              <div className="pb-4 border-b border-line/25 mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-heading font-extrabold text-xl text-ink">
                    {t('ভর্তি ফি ও বিকাশ/নগদ পেমেন্ট সেটিংস', 'Fees & Mobile Financial Payment Settings')}
                  </h2>
                  <p className="text-xs text-ink-muted">
                    {t('নিরাপত্তার স্বার্থে এই অংশটি কেবলমাত্র প্রধান শিক্ষক (Owner) পরিবর্তন করতে পারেন।', 'Protected: Editable by owner/principal only.')}
                  </p>
                </div>

                {!isOwner && (
                  <span className="px-3 py-1 bg-danger-soft text-on-danger-soft border border-danger/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-danger" />
                    <span>{t('শুধুমাত্র পড়ার অনুমতি', 'Read-Only Mode')}</span>
                  </span>
                )}
              </div>

              <form onSubmit={handleSaveFees} className="space-y-6">

                {/* Mobile Money Numbers */}
                <div className="p-5 bg-surface-2 rounded-[var(--radius-card)] border border-line/25 space-y-4">
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-primary-600" />
                    <span>{t('মোবাইল ফিনান্সিয়াল সার্ভিস (MFS) অ্যাকাউন্ট নম্বর', 'Mobile Banking Accounts')}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-primary-700 dark:text-primary-300 mb-1">
                        {t('বিকাশ নম্বর ও বিবরণ *', 'bKash Number & Type *')}
                      </label>
                      <input
                        type="text"
                        disabled={!isOwner}
                        value={feesForm.bkashNumber}
                        onChange={(e) => setFeesForm({ ...feesForm, bkashNumber: e.target.value })}
                        placeholder="01712-345678 (Personal)"
                        className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 text-sm font-mono bg-surface text-ink disabled:bg-surface-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-accent mb-1">
                        {t('নগদ নম্বর ও বিবরণ *', 'Nagad Number & Type *')}
                      </label>
                      <input
                        type="text"
                        disabled={!isOwner}
                        value={feesForm.nagadNumber}
                        onChange={(e) => setFeesForm({ ...feesForm, nagadNumber: e.target.value })}
                        placeholder="01823-987654 (Merchant)"
                        className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 text-sm font-mono bg-surface text-ink disabled:bg-surface-2"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('পেমেন্ট নির্দেশিকা (অভিভাবকদের জন্য প্রদর্শিত)', 'Payment Instructions')}
                    </label>
                    <textarea
                      rows={2}
                      disabled={!isOwner}
                      value={feesForm.paymentInstructionsBn}
                      onChange={(e) => setFeesForm({ ...feesForm, paymentInstructionsBn: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 text-sm bg-surface text-ink disabled:bg-surface-2"
                    />
                  </div>
                </div>

                {/* Per-Class Admission & Monthly Fees */}
                <div>
                  <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-3">
                    {t('শ্রেণিভিত্তিক এককালীন ভর্তি ফি ও মাসিক বেতন (টাকায়)', 'Per-Class Admission & Monthly Fees (BDT)')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {levels.map((lvl) => {
                      const cls = lvl.gradeKey || lvl.name.en.split(' ')[0] || lvl.id;
                      return (
                        <div key={cls} className="p-3 bg-surface-2 rounded-[var(--radius-btn)] border border-line/25 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-ink">{lvl.name[lang]}</span>
                            <span className="text-[10px] text-ink-muted font-mono">{cls}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-ink-muted block mb-0.5">{t('ভর্তি ফি', 'Admission')}</span>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-ink-muted">৳</span>
                                <input
                                  type="number"
                                  disabled={!isOwner}
                                  value={feesForm.admissionFees[cls] ?? 1500}
                                  onChange={(e) =>
                                    setFeesForm({
                                      ...feesForm,
                                      admissionFees: {
                                        ...feesForm.admissionFees,
                                        [cls]: Number(e.target.value),
                                      },
                                    })
                                  }
                                  className="w-full px-2 py-1 bg-surface border border-line/40 rounded-[var(--radius-input)] text-xs font-mono font-bold text-ink disabled:bg-surface-2"
                                />
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] text-ink-muted block mb-0.5">{t('মাসিক বেতন', 'Monthly')}</span>
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-ink-muted">৳</span>
                                <input
                                  type="number"
                                  disabled={!isOwner}
                                  value={feesForm.monthlyFees?.[cls] ?? 500}
                                  onChange={(e) =>
                                    setFeesForm({
                                      ...feesForm,
                                      monthlyFees: {
                                        ...feesForm.monthlyFees,
                                        [cls]: Number(e.target.value),
                                      },
                                    })
                                  }
                                  className="w-full px-2 py-1 bg-surface border border-line/40 rounded-[var(--radius-input)] text-xs font-mono font-bold text-ink disabled:bg-surface-2"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {isOwner && (
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingFees}
                      className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-on-primary font-bold text-sm rounded-[var(--radius-btn)] shadow-md transition-colors"
                    >
                      {savingFees ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('ফি সেটিংস সংরক্ষণ করুন', 'Save Fee Settings')}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* TAB 6: APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/30 shadow-xs space-y-6">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line/25">
                <div>
                  <h2 className="font-heading font-extrabold text-xl text-ink">
                    {t('অনলাইন ভর্তি আবেদন তালিকা', 'Admission Applications List')}
                  </h2>
                  <p className="text-xs text-ink-muted">
                    {t(`মোট ${formatNumber(applications.length)} টি আবেদন সংরক্ষিত`, `Total ${formatNumber(applications.length)} applications in database`)}
                  </p>
                </div>

                {isOwner ? (
                  <button
                    type="button"
                    onClick={exportApplicationsToCSV}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-on-primary text-xs font-bold rounded-[var(--radius-btn)] flex items-center gap-2 transition-colors self-start sm:self-center shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('CSV ব্যাকআপ ডাউনলোড (Owner)', 'Export Safe CSV (Owner)')}</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-btn)] bg-surface-2 border border-line/30 text-[11px] font-semibold text-ink-muted self-start sm:self-center">
                    <Lock className="w-3.5 h-3.5" />
                    <span>{t('CSV ব্যাকআপ কেবল প্রধান শিক্ষকের জন্য', 'CSV Export restricted to Owner')}</span>
                  </span>
                )}
              </div>

              {/* Weekly Backup Status Card for Owner */}
              {isOwner && (
                <div className={`p-3.5 rounded-[var(--radius-card)] border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  needsWeeklyBackup
                    ? 'bg-warning-soft border-warning/30 text-on-warning-soft'
                    : 'bg-surface-2 border-line/25 text-ink-muted'
                }`}>
                  <span>
                    <strong className="text-ink mr-1.5">
                      {t('সাপ্তাহিক ব্যাকআপ নীতি:', 'Weekly Backup Policy:')}
                    </strong>
                    {lastBackupAt
                      ? t(
                          `সর্বশেষ CSV রপ্তানি: ${new Date(lastBackupAt).toLocaleString('bn-BD')} (ছবি ও হ্যাশ বাদ দিয়ে কেবল নিরাপদ তথ্য রপ্তানি হয়)।`,
                          `Last exported: ${new Date(lastBackupAt).toLocaleString()} (safe text fields only, no image blobs or hashes).`
                        )
                      : t(
                          'প্রতি সপ্তাহে অন্তত একবার CSV ব্যাকআপ ডাউনলোড করুন (ছবি ও সিকিউরিটি হ্যাশ ছাড়া কেবল আবেদনকারীর তথ্য)।',
                          'Export a weekly CSV backup (includes safe fields only; excludes photo blobs and verify hashes).'
                        )}
                  </span>
                </div>
              )}

              {/* Search & Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    placeholder={t('নাম, ফোন নম্বর বা TrxID খুঁজুন...', 'Search name, phone, or TrxID...')}
                    className="w-full pl-9 pr-3.5 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
                  />
                </div>

                <div>
                  <select
                    value={appClassFilter}
                    onChange={(e) => setAppClassFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs bg-surface text-ink font-medium"
                  >
                    <option value="all">{t('সকল শ্রেণি (All Classes)', 'All Classes')}</option>
                    {levels.map((lvl) => {
                      const c = lvl.gradeKey || lvl.name.en.split(' ')[0] || lvl.id;
                      return (
                        <option key={c} value={c}>
                          {lvl.name[lang]} ({c})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <select
                    value={appStatusFilter}
                    onChange={(e) => setAppStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 text-xs bg-surface text-ink font-medium"
                  >
                    <option value="all">{t('সকল স্ট্যাটাস (All Status)', 'All Status')}</option>
                    <option value="pending">{t('অপেক্ষমান (Pending)', 'Pending')}</option>
                    <option value="approved">{t('অনুমোদিত (Approved)', 'Approved')}</option>
                    <option value="waitlist">{t('অপেক্ষাতালিকা (Waitlist)', 'Waitlist')}</option>
                    <option value="rejected">{t('বাতিল (Rejected)', 'Rejected')}</option>
                  </select>
                </div>
              </div>

              {/* Applications Table */}
              <div className="overflow-x-auto border border-line/30 rounded-[var(--radius-card)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-2 border-b border-line/25 text-ink-muted font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">{t('আবেদন নং', 'App No')}</th>
                      <th className="px-4 py-3">{t('শিক্ষার্থীর নাম', 'Student')}</th>
                      <th className="px-4 py-3">{t('শ্রেণি', 'Class')}</th>
                      <th className="px-4 py-3">{t('অভিভাবকের ফোন', 'Phone')}</th>
                      <th className="px-4 py-3">{t('পেমেন্ট ও TrxID', 'TrxID')}</th>
                      <th className="px-4 py-3">{t('স্ট্যাটাস', 'Status')}</th>
                      <th className="px-4 py-3 text-right">{t('অ্যাকশন', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/20 bg-surface-card">
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-ink-muted">
                          {t('কোনো আবেদন খুঁজে পাওয়া যায়নি।', 'No matching applications found.')}
                        </td>
                      </tr>
                    ) : (
                      filteredApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-surface-2/60 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-ink">{app.applicationNo}</td>
                          <td className="px-4 py-3">
                            <strong className="block text-ink">{app.studentNameBn}</strong>
                            <span className="text-[11px] text-ink-muted">{app.gender}</span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-ink-muted">{app.appliedClass}</td>
                          <td className="px-4 py-3 font-mono text-ink">{app.guardianPhone}</td>
                          <td className="px-4 py-3 font-mono">
                            <span className="text-success font-bold block">{app.trxId || 'N/A'}</span>
                            <span className="text-[10px] text-ink-muted">৳{app.admissionFee}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                app.status === 'approved'
                                  ? 'bg-success-soft text-on-success-soft'
                                  : app.status === 'pending'
                                  ? 'bg-warning-soft text-on-warning-soft'
                                  : app.status === 'waitlist'
                                  ? 'bg-accent-soft text-on-accent-soft'
                                  : 'bg-danger-soft text-on-danger-soft'
                              }`}
                            >
                              {app.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAppDetail(app);
                                setInternalNoteDraft(app.internalNotes || '');
                              }}
                              className="px-3 py-1 bg-surface-2 hover:bg-primary-50 text-ink border border-line/25 font-bold rounded-[var(--radius-btn)] text-xs transition-colors"
                            >
                              {t('বিস্তারিত', 'View')}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Detail Modal View */}
              {selectedAppDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs">
                  <div className="bg-surface-card rounded-[var(--radius-card)] max-w-xl w-full p-6 sm:p-8 border border-line/35 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">

                    <div className="flex items-center justify-between pb-3 border-b border-line/25">
                      <div>
                        <span className="text-xs font-mono font-bold text-primary-700 dark:text-primary-300 block">
                          {selectedAppDetail.applicationNo}
                        </span>
                        <h3 className="font-heading font-extrabold text-xl text-ink">
                          {selectedAppDetail.studentNameBn}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedAppDetail(null)}
                        className="p-1.5 rounded-full bg-surface-2 hover:bg-primary-50 text-ink-muted"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-ink bg-surface-2 p-4 rounded-[var(--radius-card)] border border-line/25">
                      <div>
                        <span className="text-ink-muted block">{t('ভর্তির শ্রেণি:', 'Class:')}</span>
                        <strong className="text-ink text-sm">{selectedAppDetail.appliedClass}</strong>
                      </div>
                      <div>
                        <span className="text-ink-muted block">{t('জন্ম তারিখ:', 'DOB:')}</span>
                        <strong className="text-ink">{selectedAppDetail.birthDate}</strong>
                      </div>
                      <div>
                        <span className="text-ink-muted block">{t('পিতার নাম:', "Father's Name:")}</span>
                        <strong className="text-ink">{selectedAppDetail.fatherName}</strong>
                      </div>
                      <div>
                        <span className="text-ink-muted block">{t('মোবাইল নম্বর:', 'Phone:')}</span>
                        <strong className="text-ink font-mono">{selectedAppDetail.guardianPhone}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-ink-muted block">{t('ঠিকানা:', 'Address:')}</span>
                        <span>{selectedAppDetail.address}</span>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-line/25">
                        <span className="text-ink-muted block">{t('পেমেন্ট ও TrxID:', 'Payment TrxID:')}</span>
                        <strong className="text-success font-mono text-sm">{selectedAppDetail.trxId}</strong> (৳{selectedAppDetail.admissionFee})
                      </div>
                    </div>

                    {/* Change Status Buttons */}
                    <div>
                      <label className="block text-xs font-bold text-ink mb-2">
                        {t('আবেদনের স্ট্যাটাস হালনাগাদ করুন:', 'Update Application Status:')}
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['pending', 'approved', 'waitlist', 'rejected'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={async () => {
                              await updateApplicationStatus(selectedAppDetail.id, st, internalNoteDraft);
                              setSelectedAppDetail({ ...selectedAppDetail, status: st, internalNotes: internalNoteDraft });
                              showFeedback(t(`স্ট্যাটাস '${st}' করা হয়েছে।`, `Status changed to ${st}`));
                            }}
                            className={`py-2 px-2 text-xs font-bold rounded-[var(--radius-btn)] border transition-all ${
                              selectedAppDetail.status === st
                                ? 'bg-primary-600 text-on-primary border-primary-700 shadow-xs'
                                : 'bg-surface-2 text-ink border-line/30 hover:bg-primary-50'
                            }`}
                          >
                            {st.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Internal Notes */}
                    <div>
                      <label className="block text-xs font-bold text-ink mb-1">
                        {t('অভ্যন্তরীণ নোট (Internal Note):', 'Internal Note (Staff only):')}
                      </label>
                      <textarea
                        rows={2}
                        value={internalNoteDraft}
                        onChange={(e) => setInternalNoteDraft(e.target.value)}
                        placeholder={t('অফিসের কাজের জন্য বিশেষ নোট লিখুন...', 'Add internal note...')}
                        className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink text-xs focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          await updateApplicationStatus(selectedAppDetail.id, selectedAppDetail.status, internalNoteDraft);
                          showFeedback(t('নোট সংরক্ষিত হয়েছে।', 'Note saved.'));
                        }}
                        className="mt-1.5 px-3 py-1 bg-primary-600 hover:bg-primary-700 text-on-primary text-xs font-bold rounded-[var(--radius-btn)]"
                      >
                        {t('নোট সংরক্ষণ করুন', 'Save Note')}
                      </button>
                    </div>

                    <div className="pt-3 border-t border-line/20 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(t('আপনি কি নিশ্চিতভাবে এই আবেদনটি মুছে ফেলতে চান?', 'Delete this application?'))) {
                            await deleteApplication(selectedAppDetail.id);
                            setSelectedAppDetail(null);
                            showFeedback(t('আবেদন মুছে ফেলা হয়েছে।', 'Application deleted.'));
                          }
                        }}
                        className="text-xs text-danger hover:underline font-semibold"
                      >
                        {t('আবেদন মুছে ফেলুন', 'Delete Application')}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedAppDetail(null)}
                        className="px-4 py-2 bg-surface-2 hover:bg-primary-50 text-ink border border-line/30 text-xs font-bold rounded-[var(--radius-btn)]"
                      >
                        {t('বন্ধ করুন', 'Close')}
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 6B: CAMPUS VISIT INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/30 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line/25">
                <div>
                  <h2 className="font-heading font-extrabold text-xl text-ink flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-primary-600" />
                    <span>{t('ক্যাম্পাস ভিজিট ও ভর্তি অনুসন্ধান', 'Campus Visit Bookings & Inquiries')}</span>
                  </h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {t(
                      'অভিভাবকদের ভিজিট অনুরোধগুলো দেখুন, কল করুন এবং স্ট্যাটাস আপডেট করুন।',
                      'Review guardian campus visit requests, call directly, and update follow-up status.'
                    )}
                  </p>
                </div>

                {/* Status Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { key: 'all', label: t(`সব (${inquiries.length})`, `All (${inquiries.length})`) },
                      { key: 'new', label: t('নতুন', 'New') },
                      { key: 'contacted', label: t('যোগাযোগ হয়েছে', 'Contacted') },
                      { key: 'completed', label: t('ভিজিট সম্পন্ন', 'Completed') },
                    ] as Array<{ key: 'all' | InquiryItem['status']; label: string }>
                  ).map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setInquiryFilter(f.key)}
                      className={`px-3 py-1.5 rounded-[var(--radius-btn)] text-xs font-bold border transition-colors ${
                        inquiryFilter === f.key
                          ? 'bg-primary-600 text-on-primary border-primary-600'
                          : 'bg-surface-2 text-ink border-line/30 hover:bg-primary-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredInquiries.length === 0 ? (
                <div className="p-10 text-center bg-surface-2 rounded-[var(--radius-card)] border border-line/25 text-ink-muted text-sm">
                  {t('এই বিভাগে কোনো ভিজিট বুকিং বা অনুসন্ধান পাওয়া যায়নি।', 'No campus visit inquiries match this filter.')}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredInquiries.map((inq) => {
                    const submittedLabel = inq.createdAt?.toDate
                      ? inq.createdAt.toDate().toLocaleString()
                      : typeof inq.createdAt === 'string'
                      ? new Date(inq.createdAt).toLocaleString()
                      : '';

                    return (
                      <div
                        key={inq.id}
                        className="p-5 rounded-[var(--radius-card)] bg-surface-2 border border-line/30 flex flex-col justify-between gap-4"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-heading font-bold text-base text-ink">{inq.parentName}</h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <a
                                  href={`tel:${inq.phone}`}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-btn)] bg-primary-50 dark:bg-surface text-primary-700 dark:text-primary-300 border border-primary-200/60 font-mono text-xs font-bold hover:underline"
                                >
                                  <PhoneCall className="w-3.5 h-3.5" />
                                  <span>{inq.phone}</span>
                                </a>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-btn)] bg-surface text-ink-muted border border-line/25 text-[11px] font-semibold">
                                  <Users className="w-3 h-3" />
                                  <span>{formatNumber(inq.visitorCount)} {t('জন', 'visitor(s)')}</span>
                                </span>
                              </div>
                            </div>

                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${
                                inq.status === 'completed'
                                  ? 'bg-success-soft text-on-success-soft'
                                  : inq.status === 'contacted'
                                  ? 'bg-accent-soft text-on-accent-soft'
                                  : 'bg-warning-soft text-on-warning-soft'
                              }`}
                            >
                              {inq.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-ink font-medium">
                            <Clock className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                            <span>{t('পছন্দের সময়:', 'Preferred Time:')} {inq.preferredDateTime}</span>
                          </div>

                          {inq.message && (
                            <p className="p-3 rounded-[var(--radius-input)] bg-surface border border-line/20 text-xs text-ink-muted leading-[1.7]">
                              "{inq.message}"
                            </p>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-ink-muted">
                            <span className="inline-flex items-center gap-1 text-success font-semibold">
                              <CheckCircle className="w-3 h-3" />
                              <span>{t('গোপনীয়তা সম্মতি গৃহীত', 'Privacy consent verified')}</span>
                            </span>
                            {submittedLabel && <span className="font-mono">{submittedLabel}</span>}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-line/20 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {(['new', 'contacted', 'completed'] as const).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={async () => {
                                  await updateInquiryStatus(inq.id, st);
                                  showFeedback(
                                    t(`ভিজিট স্ট্যাটাস '${st}' করা হয়েছে।`, `Inquiry marked as ${st}.`)
                                  );
                                }}
                                className={`px-2.5 py-1 rounded-[var(--radius-btn)] text-[11px] font-bold border transition-colors ${
                                  inq.status === st
                                    ? 'bg-primary-600 text-on-primary border-primary-600'
                                    : 'bg-surface text-ink border-line/30 hover:bg-primary-50'
                                }`}
                              >
                                {st === 'new'
                                  ? t('নতুন', 'New')
                                  : st === 'contacted'
                                  ? t('যোগাযোগ হয়েছে', 'Contacted')
                                  : t('সম্পন্ন', 'Completed')}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={async () => {
                              if (
                                confirm(
                                  t('এই ভিজিট অনুরোধটি মুছে ফেলতে চান?', 'Delete this campus visit inquiry?')
                                )
                              ) {
                                await deleteInquiry(inq.id);
                                showFeedback(t('ভিজিট অনুরোধ মুছে ফেলা হয়েছে।', 'Inquiry deleted.'));
                              }
                            }}
                            className="p-1.5 rounded-[var(--radius-btn)] text-ink-muted hover:text-danger hover:bg-danger-soft transition-colors"
                            title={t('মুছুন', 'Delete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: USERS & AUDIT LOGS (OWNER ONLY) */}
          {activeTab === 'users_logs' && isOwner && (
            <div className="space-y-8">

              {/* Moderators Management Box */}
              <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/30 shadow-xs">
                <div className="pb-4 border-b border-line/25 mb-6">
                  <h2 className="font-heading font-extrabold text-xl text-ink">
                    {t('মডারেটর নিয়োগ ও ব্যবস্থাপনা', 'Moderator Roles & Team Access')}
                  </h2>
                  <p className="text-xs text-ink-muted">
                    {t('মডারেটররা নোটিশ, ছবি, ও আবেদন দেখতে ও স্ট্যাটাস পরিবর্তন করতে পারবেন; কিন্তু ইউজার ম্যানেজ বা ফি পরিবর্তন করতে পারবেন না।', 'Moderators can edit content and applications, but cannot manage users or payment settings.')}
                  </p>
                </div>

                {/* Add Moderator by Gmail */}
                <form onSubmit={handleAddMod} className="mb-6 p-4 bg-surface-2 rounded-[var(--radius-card)] border border-line/25 flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    value={newModeratorEmail}
                    onChange={(e) => setNewModeratorEmail(e.target.value)}
                    placeholder="e.g. teacher@gmail.com"
                    className="flex-1 px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 text-xs sm:text-sm bg-surface text-ink focus:border-primary-600 focus-visible:ring-2 focus-visible:ring-ring/30 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-on-primary font-bold text-xs rounded-[var(--radius-btn)] shadow-xs transition-colors shrink-0"
                  >
                    {t('মডারেটর হিসেবে যোগ করুন', 'Add as Moderator')}
                  </button>
                </form>

                {/* Active Moderators List */}
                <div className="space-y-3">
                  {moderators.map((mod) => (
                    <div
                      key={mod.email}
                      className="p-4 rounded-[var(--radius-card)] bg-surface-2 border border-line/25 flex items-center justify-between gap-4"
                    >
                      <div>
                        <strong className="text-xs sm:text-sm text-ink block font-mono">{mod.email}</strong>
                        <span className="text-[11px] text-ink-muted">
                          {t('পদবি:', 'Role:')} <strong>{mod.role.toUpperCase()}</strong> · {t('যোগদান:', 'Added:')} {mod.addedAt ? mod.addedAt.split('T')[0] : 'N/A'}
                        </span>
                      </div>

                      {mod.role !== 'owner' && (
                        <button
                          type="button"
                          onClick={() => removeModerator(mod.email)}
                          className="px-3 py-1.5 text-xs text-danger hover:bg-danger-soft border border-danger/30 rounded-[var(--radius-btn)] transition-colors font-semibold"
                        >
                          {t('অব্যাহতি দিন', 'Remove')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Logs Audit Box */}
              <div className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-8 border border-line/30 shadow-xs">
                <div className="pb-4 border-b border-line/25 mb-6">
                  <h3 className="font-heading font-extrabold text-xl text-ink">
                    {t('প্রশাসনিক কার্যক্রমের অডিট লগ', 'Activity Audit Trail')}
                  </h3>
                  <p className="text-xs text-ink-muted">
                    {t('ড্যাশবোর্ডে কখন কোন অ্যাডমিন কী পরিবর্তন করেছেন তার সময়লিপি।', 'Chronological log of changes performed in dashboard.')}
                  </p>
                </div>

                {activityLogs.length === 0 ? (
                  <div className="p-8 text-center text-ink-muted text-xs">
                    {t('কোনো অ্যাক্টিভিটি রেকর্ড পাওয়া যায়নি।', 'No activity logs found.')}
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-96 overflow-y-auto">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-surface-2 rounded-[var(--radius-btn)] border border-line/25 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <strong className="text-ink block font-bold">{log.action}</strong>
                          <span className="text-ink-muted text-[11px]">{log.details}</span>
                        </div>
                        <div className="text-right sm:self-center shrink-0">
                          <span className="text-[10px] text-ink-muted font-mono block">
                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                          </span>
                          <span className="text-[10px] text-primary-700 dark:text-primary-300 font-mono font-medium">
                            {log.performedByEmail}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </main>

      </div>
    </div>
  );
};
