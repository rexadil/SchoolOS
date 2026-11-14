import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import {
  db,
  handleFirestoreError,
  OperationType,
  DEMO_MODE,
  isDeveloperEmail,
} from '../firebase/config';
import {
  schoolConfig as defaultStaticConfig,
  SchoolType,
  ThemePreset,
  SchoolLevel,
  ApplyFieldsConfig,
  presets,
  generateDefaultFeesForLevels,
} from '../config/schoolConfig';
import { useAuth } from './AuthContext';
import { generateApplicationNumber, computeStatusVerifyHash } from '../utils/applicationNumber';
import {
  SmsSettingsData,
  NotificationQueueItem,
  DEFAULT_SMS_SETTINGS,
  normalizeSmsSettings,
  prepareStatusNotificationPayload,
} from '../utils/smsAutomation';

export interface SchoolSettingsData {
  nameBn: string;
  nameEn: string;
  shortNameBn: string;
  shortNameEn: string;
  sloganBn: string;
  sloganEn: string;
  addressLine: string;
  area: string;
  upazila: string;
  district: string;
  postCode: string;
  phonePrimary: string;
  phoneSecondary: string;
  whatsappNumber: string;
  email: string;
  logoUrl?: string;
  themeColor?: string; // hex or preset
  heroTitleBn: string;
  heroTitleEn: string;
  heroSubtitleBn: string;
  heroSubtitleEn: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  schoolType?: SchoolType;
  themePreset?: ThemePreset;
  eiin?: string;
  mpoStatus?: string;
  schoolCode?: string;
  registrationNo?: string;
  /** Read-only flag managed exclusively by Developer accounts once a school Principal is assigned */
  ownershipLocked?: boolean;
  principalNameBn: string;
  principalNameEn: string;
  principalTitleBn: string;
  principalTitleEn: string;
  principalMessageBn: string;
  principalMessageEn: string;
  applyFields?: ApplyFieldsConfig;
  map?: {
    shareUrl?: string;
    embedUrl?: string;
    lat?: number;
    lng?: number;
  };
  stats?: {
    studentsCount?: number;
    teachersCount?: number;
    yearsCount?: number;
    successRate?: string;
  };
}

export interface FeeSettingsData {
  bkashNumber: string;
  nagadNumber: string;
  paymentInstructionsBn: string;
  paymentInstructionsEn: string;
  admissionFees: Record<string, number>; // dynamic per level/class
  monthlyFees: Record<string, number>;
}

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  isAdmissionNotice?: boolean;
  admissionActive?: boolean;
  classesOpen?: string[];
  startDate?: string;
  endDate?: string;
  createdAt?: any;
  createdBy?: string;
}

export interface StaffItem {
  id: string;
  nameBn: string;
  nameEn: string;
  roleBn: string;
  roleEn: string;
  qualification: string;
  bio: string;
  photoUrl: string;
  order: number;
}

export interface GalleryPhotoItem {
  id: string;
  title: string;
  category: 'building' | 'classes' | 'events' | 'nature';
  photoUrl: string;
  order: number;
  createdAt?: string;
}

export interface ApplicationItem {
  id: string;
  applicationNo: string;
  studentNameBn: string;
  studentNameEn?: string;
  birthDate: string;
  gender: string;
  appliedClass: string;
  previousSchool?: string;
  previousResult?: string;
  birthRegistrationNo?: string;
  preferredGroup?: string;
  fatherName: string;
  motherName?: string;
  guardianPhone: string;
  address: string;
  photoUrl?: string;
  admissionFee: number;
  trxId?: string;
  paymentMethod?: string;
  status: 'pending' | 'approved' | 'waitlist' | 'rejected';
  internalNotes?: string;
  createdAt?: any;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  details: string;
  performedByEmail: string;
  timestamp: string;
}

export interface AdminUserItem {
  email: string;
  role: 'owner' | 'moderator';
  addedBy: string;
  addedAt: string;
}

export interface InquiryItem {
  id: string;
  parentName: string;
  phone: string;
  preferredDateTime: string;
  visitorCount: number;
  message?: string | null;
  consent: boolean;
  status: 'new' | 'contacted' | 'completed';
  createdAt?: any;
  updatedAt?: any;
}

export interface TestimonialItem {
  id: string;
  parentNameBn: string;
  parentNameEn: string;
  childGradeBn: string;
  childGradeEn: string;
  locationBn: string;
  locationEn: string;
  feedbackBn: string;
  feedbackEn: string;
  order: number;
}

interface SchoolDataContextType {
  schoolSettings: SchoolSettingsData;
  feeSettings: FeeSettingsData;
  schoolType: SchoolType;
  themePreset: ThemePreset;
  levels: SchoolLevel[];
  applyFields: ApplyFieldsConfig;
  notices: NoticeItem[];
  admissionNotice: NoticeItem | undefined;
  staffList: StaffItem[];
  galleryPhotos: GalleryPhotoItem[];
  applications: ApplicationItem[];
  inquiries: InquiryItem[];
  testimonials: TestimonialItem[];
  activityLogs: ActivityLogItem[];
  moderators: AdminUserItem[];
  smsSettings: SmsSettingsData;
  notificationQueue: NotificationQueueItem[];
  loading: boolean;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  getDemoApplicationStatus: (appNumber: string, hash: string) => { firstName: string; class: string; status: string; updatedAt?: string } | null;
  
  // Actions
  switchPreset: (preset: SchoolType) => void;
  switchTheme: (theme: ThemePreset) => void;
  updateSchoolSettings: (newSettings: Partial<SchoolSettingsData>) => Promise<void>;
  updateFeeSettings: (newFees: Partial<FeeSettingsData>) => Promise<void>;
  saveNotice: (notice: Partial<NoticeItem> & { id?: string }) => Promise<void>;
  deleteNotice: (noticeId: string) => Promise<void>;
  saveStaff: (staff: Partial<StaffItem> & { id?: string }) => Promise<void>;
  deleteStaff: (staffId: string) => Promise<void>;
  saveGalleryPhoto: (photo: Partial<GalleryPhotoItem> & { id?: string }) => Promise<void>;
  deleteGalleryPhoto: (photoId: string) => Promise<void>;
  submitApplication: (appData: Omit<ApplicationItem, 'id' | 'status' | 'applicationNo' | 'createdAt'>) => Promise<string>;
  updateApplicationStatus: (appId: string, status: ApplicationItem['status'], notes?: string) => Promise<void>;
  deleteApplication: (appId: string) => Promise<void>;
  submitInquiry: (inquiry: Omit<InquiryItem, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateInquiryStatus: (inquiryId: string, status: InquiryItem['status']) => Promise<void>;
  deleteInquiry: (inquiryId: string) => Promise<void>;
  saveTestimonial: (testimonial: Partial<TestimonialItem> & { id?: string }) => Promise<void>;
  deleteTestimonial: (testimonialId: string) => Promise<void>;
  updateSmsSettings: (newSms: Partial<SmsSettingsData>) => Promise<void>;
  queueNotification: (payload: Omit<NotificationQueueItem, 'id' | 'createdAt'>) => Promise<string>;
  deleteNotificationItem: (notifId: string) => Promise<void>;
  addModerator: (email: string) => Promise<void>;
  removeModerator: (email: string) => Promise<void>;
  transferOwnership: (newOwnerEmail: string) => Promise<void>;
  logActivity: (action: string, details: string) => Promise<void>;
}

const defaultSchoolSettings: SchoolSettingsData = {
  nameBn: defaultStaticConfig.identity.name.bn,
  nameEn: defaultStaticConfig.identity.name.en,
  shortNameBn: defaultStaticConfig.identity.shortName.bn,
  shortNameEn: defaultStaticConfig.identity.shortName.en,
  sloganBn: defaultStaticConfig.identity.slogan.bn,
  sloganEn: defaultStaticConfig.identity.slogan.en,
  addressLine: defaultStaticConfig.location.addressLine1.bn,
  area: defaultStaticConfig.location.area.bn,
  upazila: defaultStaticConfig.location.upazila.bn,
  district: defaultStaticConfig.location.district.bn,
  postCode: defaultStaticConfig.location.postCode || '',
  phonePrimary: defaultStaticConfig.contact.phonePrimary,
  phoneSecondary: defaultStaticConfig.contact.phoneSecondary,
  whatsappNumber: defaultStaticConfig.contact.whatsappNumber,
  email: defaultStaticConfig.contact.email,
  logoUrl: '',
  themeColor: 'var(--token-primary-500)',
  heroTitleBn: 'প্রতিটি শিশুর ভেতরে একটি আলো আছে',
  heroTitleEn: 'Inside every child lies an unawakened light',
  heroSubtitleBn: defaultStaticConfig.aboutParagraph?.bn || `${defaultStaticConfig.location.upazila.bn} এ ভীতিমুক্ত, আনন্দময় ও নৈতিক শিক্ষার পাঠশালা।`,
  heroSubtitleEn: defaultStaticConfig.aboutParagraph?.en || `A nurturing educational sanctuary in ${defaultStaticConfig.location.upazila.en}, ${defaultStaticConfig.location.district.en}.`,
  facebookUrl: '',
  youtubeUrl: '',
  schoolType: defaultStaticConfig.type || 'kindergarten',
  themePreset: defaultStaticConfig.themePreset || 'dawn',
  eiin: defaultStaticConfig.eiin || '123456',
  mpoStatus: defaultStaticConfig.mpoStatus || 'এমপিওভুক্ত (MPO Enlisted)',
  schoolCode: defaultStaticConfig.schoolCode || `${defaultStaticConfig.applicationPrefix}-4509`,
  registrationNo: defaultStaticConfig.registrationNo || `${defaultStaticConfig.location.district.bn}/${defaultStaticConfig.location.upazila.bn}/২০১৬-৭৮`,
  principalNameBn: defaultStaticConfig.principalMessage.author.bn,
  principalNameEn: defaultStaticConfig.principalMessage.author.en,
  principalTitleBn: defaultStaticConfig.principalMessage.title.bn,
  principalTitleEn: defaultStaticConfig.principalMessage.title.en,
  principalMessageBn: defaultStaticConfig.principalMessage.message.bn,
  principalMessageEn: defaultStaticConfig.principalMessage.message.en,
  applyFields: defaultStaticConfig.apply.fields,
  map: {
    shareUrl: defaultStaticConfig.map.shareUrl,
    embedUrl: defaultStaticConfig.map.embedUrl,
    lat: defaultStaticConfig.map.lat,
    lng: defaultStaticConfig.map.lng,
  },
  stats: {
    studentsCount: defaultStaticConfig.stats.studentsCount,
    teachersCount: defaultStaticConfig.stats.teachersCount,
    yearsCount: defaultStaticConfig.stats.yearsCount,
    successRate: defaultStaticConfig.stats.successRate,
  },
};

const initialFees = generateDefaultFeesForLevels(defaultStaticConfig.levels);
const defaultFeeSettings: FeeSettingsData = {
  bkashNumber: '',
  nagadNumber: '',
  paymentInstructionsBn: 'বিকাশ বা নগদ অ্যাপের "Send Money" অথবা "Payment" অপশন ব্যবহার করে নির্দিষ্ট ফি পরিশোধ করুন এবং নিচে Transaction ID দিন।',
  paymentInstructionsEn: 'Use bKash/Nagad "Send Money" or "Payment" to pay the admission fee and enter the TrxID below.',
  admissionFees: initialFees.admissionFees,
  monthlyFees: initialFees.monthlyFees,
};

const SchoolDataContext = createContext<SchoolDataContextType | undefined>(undefined);

export const SchoolDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, isOwner, isDeveloper, effectiveOwnerEmail, refreshRole } = useAuth();

  const [schoolType, setSchoolTypeState] = useState<SchoolType>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('school_active_preset') as SchoolType | null;
      if (stored && presets[stored]) return stored;
    }
    return defaultStaticConfig.type || 'kindergarten';
  });

  const [themePreset, setThemePresetState] = useState<ThemePreset>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('school_active_theme') as ThemePreset | null;
      if (stored) return stored;
    }
    return defaultStaticConfig.themePreset || 'dawn';
  });

  const [schoolSettings, setSchoolSettings] = useState<SchoolSettingsData>(defaultSchoolSettings);
  const [feeSettings, setFeeSettings] = useState<FeeSettingsData>(defaultFeeSettings);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhotoItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [moderators, setModerators] = useState<AdminUserItem[]>([]);
  const [smsSettings, setSmsSettings] = useState<SmsSettingsData>(DEFAULT_SMS_SETTINGS);
  const [notificationQueue, setNotificationQueue] = useState<NotificationQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Computed levels & apply fields from active preset or custom config
  const activePreset = presets[schoolType] || presets.kindergarten;
  const levels = useMemo(
    () => (activePreset.levels || defaultStaticConfig.levels) as SchoolLevel[],
    [activePreset]
  );
  const applyFields = useMemo(
    () => activePreset.apply?.fields || defaultStaticConfig.apply.fields,
    [activePreset]
  );

  const switchPreset = (type: SchoolType) => {
    const preset = presets[type];
    if (!preset) return;

    setSchoolTypeState(type);

    const updatedSettings: Partial<SchoolSettingsData> = {
      schoolType: type,
      nameBn: preset.identity?.name?.bn || schoolSettings.nameBn,
      nameEn: preset.identity?.name?.en || schoolSettings.nameEn,
      sloganBn: preset.identity?.slogan?.bn || schoolSettings.sloganBn,
      sloganEn: preset.identity?.slogan?.en || schoolSettings.sloganEn,
      eiin: preset.eiin ?? schoolSettings.eiin,
      mpoStatus: preset.mpoStatus ?? schoolSettings.mpoStatus,
      schoolCode: preset.schoolCode ?? schoolSettings.schoolCode,
      registrationNo: preset.registrationNo ?? schoolSettings.registrationNo,
      applyFields: preset.apply?.fields || applyFields,
    };
    setSchoolSettings((prev) => ({ ...prev, ...updatedSettings }));

    const newFees = generateDefaultFeesForLevels(preset.levels as SchoolLevel[]);
    setFeeSettings((prev) => ({
      ...prev,
      admissionFees: { ...prev.admissionFees, ...newFees.admissionFees },
      monthlyFees: { ...prev.monthlyFees, ...newFees.monthlyFees },
    }));

    if (typeof window !== 'undefined') {
      localStorage.setItem('school_active_preset', type);
    }
  };

  const switchTheme = (theme: ThemePreset) => {
    setThemePresetState(theme);
    setSchoolSettings((prev) => ({ ...prev, themePreset: theme }));
    if (typeof window !== 'undefined') {
      localStorage.setItem('school_active_theme', theme);
    }
  };

  // Demo Mode State
  const [demoMode, setDemoModeState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('school_demo_mode');
      if (stored !== null) return stored === 'true';
    }
    return DEMO_MODE;
  });

  const setDemoMode = (val: boolean) => {
    setDemoModeState(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('school_demo_mode', String(val));
    }
  };

  // Seed demo data if in demo mode and no applications stored
  useEffect(() => {
    if (!demoMode) return;
    try {
      const stored = localStorage.getItem('school_demo_applications');
      if (!stored) {
        const initialDemoApps: ApplicationItem[] = [
          {
            id: 'demo-app-1',
            applicationNo: 'AA-20261110-3K8MNP',
            studentNameBn: 'তানভীর আহমেদ',
            studentNameEn: 'Tanvir Ahmed',
            birthDate: '2021-02-14',
            gender: 'ছেলে (Male)',
            appliedClass: 'Play',
            previousSchool: '',
            fatherName: 'রফিকুল ইসলাম',
            motherName: 'তাহমিনা খাতুন',
            guardianPhone: '01712345678',
            address: `${defaultStaticConfig.location.area.bn}, ${defaultStaticConfig.location.upazila.bn}, ${defaultStaticConfig.location.district.bn}`,
            admissionFee: 1200,
            trxId: '9K8J7H6G5F',
            paymentMethod: 'bkash',
            status: 'pending',
            createdAt: { seconds: Math.floor(Date.now() / 1000) - 3600 },
          },
          {
            id: 'demo-app-2',
            applicationNo: 'AA-20261110-7B9XYZ',
            studentNameBn: 'সুমাইয়া জান্নাত',
            studentNameEn: 'Sumaiya Jannat',
            birthDate: '2020-05-20',
            gender: 'মেয়ে (Female)',
            appliedClass: 'Nursery',
            previousSchool: '',
            fatherName: 'মাহমুদুল হাসান',
            motherName: 'ফরিদা পারভীন',
            guardianPhone: '01812345678',
            address: `ঘড়িয়ালডাঙ্গা, ${defaultStaticConfig.location.upazila.bn}, ${defaultStaticConfig.location.district.bn}`,
            admissionFee: 1300,
            trxId: '8N7B6V5C4X',
            paymentMethod: 'nagad',
            status: 'approved',
            createdAt: { seconds: Math.floor(Date.now() / 1000) - 7200 },
          },
        ];
        localStorage.setItem('school_demo_applications', JSON.stringify(initialDemoApps));
        setApplications(initialDemoApps);

        (async () => {
          const hash1 = await computeStatusVerifyHash('AA-20261110-3K8MNP', '01712345678');
          const hash2 = await computeStatusVerifyHash('AA-20261110-7B9XYZ', '01812345678');
          const statusMap = {
            'AA-20261110-3K8MNP': {
              firstName: 'তানভীর',
              class: 'Play',
              status: 'pending',
              verifyHash: hash1,
              updatedAt: new Date().toISOString(),
            },
            'AA-20261110-7B9XYZ': {
              firstName: 'সুমাইয়া',
              class: 'Nursery',
              status: 'approved',
              verifyHash: hash2,
              updatedAt: new Date().toISOString(),
            },
          };
          localStorage.setItem('school_demo_app_status', JSON.stringify(statusMap));
        })();
      } else {
        setApplications(JSON.parse(stored));
      }
    } catch (e) {
      if (import.meta.env.DEV) console.warn('Demo init error:', e);
    }
  }, [demoMode]);

  const getDemoApplicationStatus = (appNumber: string, hash: string) => {
    try {
      const raw = localStorage.getItem('school_demo_app_status');
      if (raw) {
        const map = JSON.parse(raw);
        const item = map[appNumber.toUpperCase()];
        if (item && item.verifyHash === hash) {
          return item;
        }
      }
    } catch (e) {
      if (import.meta.env.DEV) console.warn('Demo status read error:', e);
    }
    return null;
  };

  // 1. Live Sync Public School Settings
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'school'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSchoolSettings((prev) => ({
            ...prev,
            ...data,
            map: { ...(prev.map || {}), ...(data?.map || {}) },
          }));
        }
      },
      (error) => {
        if (import.meta.env.DEV) console.warn('Settings snapshot fallback:', error);
      }
    );
    return () => unsub();
  }, []);

  // 2. Live Sync Fee Settings
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'fees'),
      (docSnap) => {
        if (docSnap.exists()) {
          setFeeSettings((prev) => ({ ...prev, ...docSnap.data() }));
        }
      },
      (error) => {
        if (import.meta.env.DEV) console.warn('Fee settings fallback:', error);
      }
    );
    return () => unsub();
  }, []);

  // 3. Live Sync Notices
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'notices'),
      (snapshot) => {
        const items: NoticeItem[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as NoticeItem[];
        setNotices(items);
      },
      (error) => {
        if (import.meta.env.DEV) console.warn('Notices listener:', error);
      }
    );
    return () => unsub();
  }, []);

  // 4. Live Sync Staff
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'staff'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: StaffItem[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as StaffItem[];
          items.sort((a, b) => (a.order || 0) - (b.order || 0));
          setStaffList(items);
        } else {
          // Initialize from static teachers if empty
          const staticStaff: StaffItem[] = defaultStaticConfig.teachers.map((t, idx) => ({
            id: `static-${idx}`,
            nameBn: t.name.bn,
            nameEn: t.name.en,
            roleBn: t.role.bn,
            roleEn: t.role.en,
            qualification: t.qualification.bn,
            bio: t.quote.bn,
            photoUrl: '',
            order: idx,
          }));
          setStaffList(staticStaff);
        }
      },
      (error) => {
        if (import.meta.env.DEV) console.warn('Staff listener:', error);
      }
    );
    return () => unsub();
  }, []);

  // 5. Live Sync Gallery Photos
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'gallery'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: GalleryPhotoItem[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as GalleryPhotoItem[];
          items.sort((a, b) => (a.order || 0) - (b.order || 0));
          setGalleryPhotos(items);
        } else {
          // Initialize from schoolConfig.galleryImages if Firestore collection is empty
          const categoryMap: Record<string, 'building' | 'classes' | 'events' | 'nature'> = {
            campus: 'building',
            classroom: 'classes',
            sports: 'events',
            nature: 'nature',
          };
          const initialPhotos: GalleryPhotoItem[] = defaultStaticConfig.galleryImages.map((img, idx) => ({
            id: img.id || `p${idx + 1}`,
            title: img.title.bn,
            category: categoryMap[img.category] || 'building',
            photoUrl: img.imageSrc,
            order: idx,
          }));
          setGalleryPhotos(initialPhotos);
        }
      },
      (error) => {
        if (import.meta.env.DEV) console.warn('Gallery listener:', error);
      }
    );
    return () => unsub();
  }, []);

  // 6. Live Sync Applications (Admin only)
  useEffect(() => {
    if (!isAdmin) {
      setApplications([]);
      return;
    }

    const q = query(collection(db, 'applications'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items: ApplicationItem[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ApplicationItem[];
        items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setApplications(items);
      },
      (error) => {
        if (import.meta.env.DEV) console.warn('Applications snapshot note (check admin status):', error);
      }
    );
    return () => unsub();
  }, [isAdmin]);

  // 6b. Live Sync Campus Visit Inquiries (Admin only)
  useEffect(() => {
    if (demoMode) {
      try {
        const raw = localStorage.getItem('school_demo_inquiries');
        if (raw) setInquiries(JSON.parse(raw));
      } catch {
        // ignore
      }
      return;
    }
    if (!isAdmin) {
      setInquiries([]);
      return;
    }

    const q = query(collection(db, 'inquiries'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items: InquiryItem[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as InquiryItem[];
        items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setInquiries(items);
      },
      (error) => {
        if (import.meta.env.DEV) console.warn('Inquiries snapshot note (check admin status):', error);
      }
    );
    return () => unsub();
  }, [isAdmin, demoMode]);

  // 6c. Live Sync Testimonials (Public read with schoolConfig fallback)
  useEffect(() => {
    const fallbackTestimonials: TestimonialItem[] = defaultStaticConfig.testimonials.map((item, idx) => ({
      id: `static-testimonial-${idx}`,
      parentNameBn: item.parentName.bn,
      parentNameEn: item.parentName.en,
      childGradeBn: item.childGrade.bn,
      childGradeEn: item.childGrade.en,
      locationBn: item.location.bn,
      locationEn: item.location.en,
      feedbackBn: item.feedback.bn,
      feedbackEn: item.feedback.en,
      order: idx,
    }));

    const unsub = onSnapshot(
      collection(db, 'testimonials'),
      (snapshot) => {
        if (!snapshot.empty) {
          const items = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as TestimonialItem[];
          items.sort((a, b) => (a.order || 0) - (b.order || 0));
          setTestimonials(items);
        } else {
          setTestimonials(fallbackTestimonials);
        }
      },
      (error) => {
        if (import.meta.env.DEV) console.warn('Testimonials listener fallback:', error);
        setTestimonials(fallbackTestimonials);
      }
    );
    return () => unsub();
  }, []);

  // 7. Live Sync Activity Logs, Moderators, SMS Settings & Notification Queue
  useEffect(() => {
    if (demoMode) {
      try {
        const storedSms = localStorage.getItem('school_demo_sms_settings');
        if (storedSms) setSmsSettings(normalizeSmsSettings(JSON.parse(storedSms)));
        const storedQueue = localStorage.getItem('school_demo_notification_queue');
        if (storedQueue) setNotificationQueue(JSON.parse(storedQueue));
      } catch {
        // ignore storage read error
      }
      return;
    }

    if (!isOwner && !isDeveloper) {
      setActivityLogs([]);
      setModerators([]);
      setSmsSettings(DEFAULT_SMS_SETTINGS);
      setNotificationQueue([]);
      return;
    }

    const unsubLogs = onSnapshot(
      collection(db, 'activity_logs'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ActivityLogItem[];
        items.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
        setActivityLogs(items);
      },
      (error) => {
        if (import.meta.env.DEV) console.warn('Activity logs listener:', error);
      }
    );

    const unsubAdmins = onSnapshot(
      collection(db, 'admins'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ ...d.data() })) as AdminUserItem[];
        setModerators(items);
      },
      (error) => {
        if (import.meta.env.DEV) console.warn('Admins listener:', error);
      }
    );

    if (!isOwner) {
      setSmsSettings(DEFAULT_SMS_SETTINGS);
      setNotificationQueue([]);
      return () => {
        unsubLogs();
        unsubAdmins();
      };
    }

    const unsubSms = onSnapshot(
      doc(db, 'settings', 'sms'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSmsSettings(normalizeSmsSettings(docSnap.data() as Partial<SmsSettingsData>));
        } else {
          setSmsSettings(DEFAULT_SMS_SETTINGS);
        }
      },
      (error) => {
        if (import.meta.env.DEV) console.warn('SMS settings listener:', error);
      }
    );

    const unsubQueue = onSnapshot(
      collection(db, 'notification_queue'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as NotificationQueueItem[];
        items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setNotificationQueue(items);
      },
      (error) => {
        if (import.meta.env.DEV) console.warn('Notification queue listener:', error);
      }
    );

    return () => {
      unsubLogs();
      unsubAdmins();
      unsubSms();
      unsubQueue();
    };
  }, [isOwner, isDeveloper, demoMode]);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Active Admission Notice Helper (falls back to inactive admission notice so admissionActive=false is respected)
  const admissionNotice = useMemo(
    () =>
      notices.find((n) => n.isAdmissionNotice && n.admissionActive) ||
      notices.find((n) => n.isAdmissionNotice),
    [notices]
  );

  // Activity Logger (conforms strictly to Firestore activity_logs schema & email match)
  const logActivity = async (action: string, details: string) => {
    const actorEmail = (user?.email || '').trim().toLowerCase();
    if (!actorEmail) return;
    try {
      await addDoc(collection(db, 'activity_logs'), {
        action: action.trim().slice(0, 200) || 'Activity',
        details: details.trim().slice(0, 1000) || 'Action performed',
        performedByEmail: actorEmail,
        timestamp: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      if (import.meta.env.DEV) console.warn('Activity log write error:', err);
    }
  };

  // Actions
  const updateSchoolSettings = async (newSettings: Partial<SchoolSettingsData>) => {
    if (!isOwner && !isDeveloper && !demoMode) {
      throw new Error('Only the school owner can update school identity settings.');
    }
    const merged: SchoolSettingsData = {
      ...schoolSettings,
      ...newSettings,
      map: {
        ...(schoolSettings.map || {}),
        ...(newSettings.map || {}),
      },
      stats: {
        ...(schoolSettings.stats || {}),
        ...(newSettings.stats || {}),
      },
    };

    // BUSINESS PROTECTION: Strip protected lock/ownership fields before normal
    // Owner writes so Firestore rules cannot be tripped or bypassed.
    const { ownershipLocked: _omitLocked, ownerEmail: _omitOwnerEmail, ...safePayload } =
      merged as SchoolSettingsData & { ownerEmail?: string };

    if (demoMode) {
      setSchoolSettings(merged);
      try {
        localStorage.setItem('school_demo_settings', JSON.stringify(merged));
      } catch {
        // ignore storage quota errors
      }
      return;
    }

    try {
      await setDoc(doc(db, 'settings', 'school'), safePayload, { merge: true });
      setSchoolSettings(merged);
      await logActivity('বিদ্যালয়ের পরিচিতি পরিবর্তন', 'বিদ্যালয়ের সাধারণ পরিচিতি, যোগাযোগ ও অধ্যক্ষের বাণী হালনাগাদ করা হয়েছে।');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/school');
    }
  };

  const updateFeeSettings = async (newFees: Partial<FeeSettingsData>) => {
    try {
      const updated = { ...feeSettings, ...newFees };
      await setDoc(doc(db, 'settings', 'fees'), updated, { merge: true });
      setFeeSettings(updated);
      await logActivity('ফি ও পেমেন্ট নম্বর পরিবর্তন', 'শ্রেণিভিত্তিক ভর্তি ও মাসিক ফি বা পেমেন্ট নম্বর আপডেট করা হয়েছে।');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/fees');
    }
  };

  const saveNotice = async (notice: Partial<NoticeItem> & { id?: string }) => {
    try {
      if (notice.id) {
        await updateDoc(doc(db, 'notices', notice.id), {
          ...notice,
          updatedAt: serverTimestamp(),
        });
        await logActivity('নোটিশ সম্পাদনা', `নোটিশ "${notice.title}" সম্পাদন করা হয়েছে।`);
      } else {
        await addDoc(collection(db, 'notices'), {
          ...notice,
          createdAt: serverTimestamp(),
          createdBy: user?.email || 'admin',
        });
        await logActivity('নতুন নোটিশ তৈরি', `নতুন নোটিশ "${notice.title}" প্রকাশ করা হয়েছে।`);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'notices');
    }
  };

  const deleteNotice = async (noticeId: string) => {
    try {
      await deleteDoc(doc(db, 'notices', noticeId));
      await logActivity('নোটিশ মুছে ফেলা', `নোটিশ আইডি ${noticeId} মুছে ফেলা হয়েছে।`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `notices/${noticeId}`);
    }
  };

  const saveStaff = async (staff: Partial<StaffItem> & { id?: string }) => {
    try {
      if (staff.id && !staff.id.startsWith('static-')) {
        await updateDoc(doc(db, 'staff', staff.id), {
          ...staff,
          updatedAt: serverTimestamp(),
        });
        await logActivity('শিক্ষক তথ্য সম্পাদন', `শিক্ষক ${staff.nameBn} এর তথ্য আপডেট করা হয়েছে।`);
      } else {
        const { id, ...data } = staff;
        await addDoc(collection(db, 'staff'), {
          ...data,
          order: staffList.length,
          createdAt: serverTimestamp(),
        });
        await logActivity('নতুন শিক্ষক যুক্ত', `নতুন শিক্ষক ${staff.nameBn} যুক্ত করা হয়েছে।`);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'staff');
    }
  };

  const deleteStaff = async (staffId: string) => {
    try {
      if (!staffId.startsWith('static-')) {
        await deleteDoc(doc(db, 'staff', staffId));
        await logActivity('শিক্ষক তথ্য মুছে ফেলা', `শিক্ষক আইডি ${staffId} তালিকা থেকে অপসারিত।`);
      } else {
        setStaffList((prev) => prev.filter((s) => s.id !== staffId));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `staff/${staffId}`);
    }
  };

  const saveGalleryPhoto = async (photo: Partial<GalleryPhotoItem> & { id?: string }) => {
    try {
      if (photo.id && !photo.id.startsWith('p')) {
        await updateDoc(doc(db, 'gallery', photo.id), {
          ...photo,
          updatedAt: serverTimestamp(),
        });
      } else {
        const { id, ...data } = photo;
        await addDoc(collection(db, 'gallery'), {
          ...data,
          order: galleryPhotos.length,
          createdAt: new Date().toISOString(),
        });
        await logActivity('নতুন ছবি আপলোড', `গ্যালারিতে "${photo.title}" ছবি যুক্ত করা হয়েছে।`);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'gallery');
    }
  };

  const deleteGalleryPhoto = async (photoId: string) => {
    try {
      if (!photoId.startsWith('p')) {
        await deleteDoc(doc(db, 'gallery', photoId));
        await logActivity('গ্যালারি ছবি মুছে ফেলা', `ছবি আইডি ${photoId} অপসারিত।`);
      } else {
        setGalleryPhotos((prev) => prev.filter((p) => p.id !== photoId));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `gallery/${photoId}`);
    }
  };

  // Public submission of admission application
  const submitApplication = async (appData: Omit<ApplicationItem, 'id' | 'status' | 'applicationNo' | 'createdAt'>): Promise<string> => {
    const appNumber = generateApplicationNumber();
    const firstName = appData.studentNameBn.trim().split(/\s+/)[0] || appData.studentNameBn;
    const verifyHash = await computeStatusVerifyHash(appNumber, appData.guardianPhone);

    if (demoMode) {
      // 1. Save to demo applications in localStorage
      const newApp: ApplicationItem = {
        ...appData,
        id: `demo-app-${Date.now()}`,
        applicationNo: appNumber,
        status: 'pending',
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
      };
      const existingApps: ApplicationItem[] = JSON.parse(localStorage.getItem('school_demo_applications') || '[]');
      const updatedApps = [newApp, ...existingApps];
      localStorage.setItem('school_demo_applications', JSON.stringify(updatedApps));
      setApplications(updatedApps);

      // 2. Save to demo public status map
      const statusMap = JSON.parse(localStorage.getItem('school_demo_app_status') || '{}');
      statusMap[appNumber] = {
        firstName,
        class: appData.appliedClass,
        status: 'pending',
        verifyHash,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('school_demo_app_status', JSON.stringify(statusMap));

      return appNumber;
    }

    try {
      // 1. Create full application doc with strict field conformance
      await addDoc(collection(db, 'applications'), {
        studentNameBn: appData.studentNameBn,
        studentNameEn: appData.studentNameEn || null,
        birthDate: appData.birthDate,
        gender: appData.gender,
        appliedClass: appData.appliedClass,
        previousSchool: appData.previousSchool || null,
        previousResult: appData.previousResult || null,
        birthRegistrationNo: appData.birthRegistrationNo || null,
        preferredGroup: appData.preferredGroup || null,
        fatherName: appData.fatherName,
        motherName: appData.motherName || null,
        guardianPhone: appData.guardianPhone,
        address: appData.address,
        photoUrl: appData.photoUrl || null,
        admissionFee: appData.admissionFee,
        trxId: appData.trxId || null,
        paymentMethod: appData.paymentMethod || null,
        applicationNo: appNumber,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // 2. Create minimal public status doc in application_status/{appNumber}
      await setDoc(doc(db, 'application_status', appNumber), {
        firstName,
        class: appData.appliedClass,
        status: 'pending',
        verifyHash,
        updatedAt: serverTimestamp(),
      });

      return appNumber;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'applications');
    }
  };

  const queueNotification = async (
    payload: Omit<NotificationQueueItem, 'id' | 'createdAt'>
  ): Promise<string> => {
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (demoMode) {
      const item: NotificationQueueItem = {
        ...payload,
        id: notifId,
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
      };
      const existing: NotificationQueueItem[] = JSON.parse(
        localStorage.getItem('school_demo_notification_queue') || '[]'
      );
      const updated = [item, ...existing].slice(0, 50);
      localStorage.setItem('school_demo_notification_queue', JSON.stringify(updated));
      setNotificationQueue(updated);
      return notifId;
    }

    try {
      await setDoc(doc(db, 'notification_queue', notifId), {
        eventType: payload.eventType,
        channel: 'sms',
        recipientPhone: payload.recipientPhone,
        recipientRole: payload.recipientRole,
        message: payload.message.slice(0, 480),
        applicationId: payload.applicationId || null,
        applicationNo: payload.applicationNo || null,
        studentName: payload.studentName || null,
        appliedClass: payload.appliedClass || null,
        targetStatus: payload.targetStatus || null,
        gateway: payload.gateway,
        status: payload.status,
        createdByEmail: payload.createdByEmail,
        createdAt: serverTimestamp(),
      });
      return notifId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `notification_queue/${notifId}`);
    }
  };

  const updateSmsSettings = async (newSms: Partial<SmsSettingsData>) => {
    if (!isOwner && !demoMode) {
      throw new Error('Only the school owner can update SMS automation settings.');
    }
    const normalized = normalizeSmsSettings({ ...smsSettings, ...newSms });
    const record: SmsSettingsData = {
      ...normalized,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.email || 'owner',
    };

    if (demoMode) {
      localStorage.setItem('school_demo_sms_settings', JSON.stringify(record));
      setSmsSettings(record);
      return;
    }

    try {
      await setDoc(doc(db, 'settings', 'sms'), record);
      setSmsSettings(record);
      await logActivity(
        'SMS অটোমেশন সেটিংস পরিবর্তন',
        `স্ট্যাটাস: ${record.enabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'}, গেটওয়ে: ${record.gateway}`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/sms');
    }
  };

  const deleteNotificationItem = async (notifId: string) => {
    if (demoMode) {
      const existing: NotificationQueueItem[] = JSON.parse(
        localStorage.getItem('school_demo_notification_queue') || '[]'
      );
      const updated = existing.filter((item) => item.id !== notifId);
      localStorage.setItem('school_demo_notification_queue', JSON.stringify(updated));
      setNotificationQueue(updated);
      return;
    }

    try {
      await deleteDoc(doc(db, 'notification_queue', notifId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `notification_queue/${notifId}`);
    }
  };

  const updateApplicationStatus = async (appId: string, status: ApplicationItem['status'], notes?: string) => {
    const targetApp = applications.find((a) => a.id === appId);
    const appNumber = targetApp?.applicationNo;

    const preparedNotif =
      targetApp && targetApp.status !== status
        ? prepareStatusNotificationPayload({
            targetStatus: status,
            phone: targetApp.guardianPhone,
            studentName: targetApp.studentNameBn,
            appliedClass: targetApp.appliedClass,
            applicationId: appId,
            applicationNo: targetApp.applicationNo,
            schoolNameBn: schoolSettings.nameBn,
            smsSettings: isOwner ? smsSettings : DEFAULT_SMS_SETTINGS,
            actorEmail: user?.email || 'admin@school.com',
          })
        : null;

    if (demoMode) {
      const existingApps: ApplicationItem[] = JSON.parse(localStorage.getItem('school_demo_applications') || '[]');
      const updatedApps = existingApps.map((a) => {
        if (a.id === appId) {
          return { ...a, status, internalNotes: notes !== undefined ? notes : a.internalNotes };
        }
        return a;
      });
      localStorage.setItem('school_demo_applications', JSON.stringify(updatedApps));
      setApplications(updatedApps);

      if (appNumber) {
        const statusMap = JSON.parse(localStorage.getItem('school_demo_app_status') || '{}');
        if (statusMap[appNumber]) {
          statusMap[appNumber].status = status;
          statusMap[appNumber].updatedAt = new Date().toISOString();
          localStorage.setItem('school_demo_app_status', JSON.stringify(statusMap));
        }
      }

      if (preparedNotif) {
        await queueNotification(preparedNotif);
      }
      return;
    }

    try {
      const payload: any = { status, updatedAt: serverTimestamp() };
      if (notes !== undefined) {
        payload.internalNotes = notes;
      }
      await updateDoc(doc(db, 'applications', appId), payload);

      // Mirror to public status doc
      if (appNumber) {
        await setDoc(
          doc(db, 'application_status', appNumber),
          { status, updatedAt: serverTimestamp() },
          { merge: true }
        );
      }

      // Prepare SMS notification payload in notification_queue for future Cloud Function dispatch
      if (preparedNotif && user?.email) {
        try {
          await queueNotification({
            ...preparedNotif,
            createdByEmail: user.email,
          });
        } catch (queueErr) {
          if (import.meta.env.DEV) console.warn('Notification queue preparation note:', queueErr);
        }
      }

      await logActivity('আবেদনের স্ট্যাটাস পরিবর্তন', `আবেদন নং ${appNumber || appId} এর স্ট্যাটাস '${status}' করা হয়েছে।`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `applications/${appId}`);
    }
  };

  const deleteApplication = async (appId: string) => {
    const targetApp = applications.find((a) => a.id === appId);
    const appNumber = targetApp?.applicationNo;

    if (demoMode) {
      const existingApps: ApplicationItem[] = JSON.parse(localStorage.getItem('school_demo_applications') || '[]');
      const updatedApps = existingApps.filter((a) => a.id !== appId);
      localStorage.setItem('school_demo_applications', JSON.stringify(updatedApps));
      setApplications(updatedApps);

      if (appNumber) {
        const statusMap = JSON.parse(localStorage.getItem('school_demo_app_status') || '{}');
        delete statusMap[appNumber];
        localStorage.setItem('school_demo_app_status', JSON.stringify(statusMap));
      }
      return;
    }

    try {
      await deleteDoc(doc(db, 'applications', appId));
      if (appNumber) {
        await deleteDoc(doc(db, 'application_status', appNumber));
      }
      await logActivity('আবেদন মুছে ফেলা', `আবেদন নং ${appNumber || appId} মুছে ফেলা হয়েছে।`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `applications/${appId}`);
    }
  };

  // Add Moderator (Owner only)
  const addModerator = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    try {
      await setDoc(doc(db, 'admins', cleanEmail), {
        email: cleanEmail,
        role: 'moderator',
        addedBy: user?.email || 'owner',
        addedAt: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });
      await logActivity('নতুন মডারেটর নিয়োগ', `Gmail: ${cleanEmail} কে মডারেটর হিসেবে নিয়োগ দেওয়া হয়েছে।`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `admins/${cleanEmail}`);
    }
  };

  // Remove Moderator (Owner only)
  const removeModerator = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await deleteDoc(doc(db, 'admins', cleanEmail));
      await logActivity('মডারেটর অব্যাহতি', `Gmail: ${cleanEmail} এর মডারেটর পদ প্রত্যাহার করা হয়েছে।`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `admins/${cleanEmail}`);
    }
  };

  /**
   * BUSINESS PROTECTION — DEVELOPER-ONLY OWNERSHIP TRANSFER & LOCK:
   * Only accounts in `DEVELOPER_EMAILS` (`isDeveloper === true`) may assign or
   * change `ownerEmail`. Once assigned to a real school Principal (non-developer),
   * `ownershipLocked` is set to `true` in both `/settings/ownership` and
   * `/settings/school`. Normal school Owners cannot execute or bypass this.
   */
  const transferOwnership = async (newOwnerEmail: string) => {
    const cleanNew = newOwnerEmail.trim().toLowerCase();
    const cleanOld = (effectiveOwnerEmail || '').trim().toLowerCase();
    const developerActor = (user?.email || '').trim().toLowerCase();

    if (!isDeveloper && !demoMode) {
      throw new Error('Ownership transfer is restricted strictly to authorized developer accounts.');
    }
    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(cleanNew)) {
      throw new Error('Please enter a valid Google email address.');
    }
    if (cleanNew === cleanOld) {
      throw new Error('New owner Gmail must be different from the current owner Gmail.');
    }

    const willLock = !isDeveloperEmail(cleanNew);

    if (demoMode) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('school_demo_owner_email', cleanNew);
        localStorage.setItem('school_demo_ownership_locked', willLock ? 'true' : 'false');
      }
      await refreshRole();
      return;
    }

    try {
      // 1. Grant owner role in admins/{newOwner}
      await setDoc(doc(db, 'admins', cleanNew), {
        email: cleanNew,
        role: 'owner',
        addedBy: developerActor,
        addedAt: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });

      // 2. Remove previous owner's admins entry if different (single owner at a time)
      if (cleanOld && cleanOld !== cleanNew) {
        try {
          await deleteDoc(doc(db, 'admins', cleanOld));
        } catch (cleanupErr) {
          if (import.meta.env.DEV) console.warn('Previous owner admin cleanup note:', cleanupErr);
        }
      }

      // 3. Persist ownershipLocked flag in settings/school (Developer-only rule permits this)
      await setDoc(
        doc(db, 'settings', 'school'),
        { ownershipLocked: willLock },
        { merge: true }
      );

      // 4. Write single-owner pointer & lock in settings/ownership (Developer-only in Firestore rules)
      await setDoc(doc(db, 'settings', 'ownership'), {
        ownerEmail: cleanNew,
        ownershipLocked: willLock,
        previousOwnerEmail: cleanOld,
        transferredBy: developerActor,
        transferredAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 5. Record clear developer audit log in activity_logs
      await addDoc(collection(db, 'activity_logs'), {
        action: 'ডেভেলপার কর্তৃক মালিকানা হস্তান্তর ও লক (Developer Ownership Lock)',
        details: `Developer (${developerActor}) changed ownerEmail from ${cleanOld || 'initial'} to ${cleanNew}. ownershipLocked=${willLock ? 'true' : 'false'}.`,
        performedByEmail: developerActor,
        timestamp: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });

      // 6. Refresh AuthContext role and ownership state immediately
      await refreshRole();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/ownership');
    }
  };

  // Public Campus Visit Booking / Inquiry submission
  const submitInquiry = async (
    inquiryData: Omit<InquiryItem, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    const cleanPhone = inquiryData.phone.replace(/[^0-9]/g, '');
    const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (demoMode) {
      const newItem: InquiryItem = {
        id: inquiryId,
        parentName: inquiryData.parentName.trim(),
        phone: cleanPhone,
        preferredDateTime: inquiryData.preferredDateTime.trim(),
        visitorCount: Number(inquiryData.visitorCount) || 1,
        message: inquiryData.message?.trim() || null,
        consent: true,
        status: 'new',
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
      };
      const existing: InquiryItem[] = JSON.parse(localStorage.getItem('school_demo_inquiries') || '[]');
      const updated = [newItem, ...existing];
      localStorage.setItem('school_demo_inquiries', JSON.stringify(updated));
      setInquiries(updated);
      return inquiryId;
    }

    try {
      await setDoc(doc(db, 'inquiries', inquiryId), {
        parentName: inquiryData.parentName.trim(),
        phone: cleanPhone,
        preferredDateTime: inquiryData.preferredDateTime.trim(),
        visitorCount: Number(inquiryData.visitorCount) || 1,
        message: inquiryData.message?.trim() || null,
        consent: true,
        status: 'new',
        createdAt: serverTimestamp(),
      });
      return inquiryId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `inquiries/${inquiryId}`);
    }
  };

  const updateInquiryStatus = async (inquiryId: string, status: InquiryItem['status']) => {
    if (demoMode) {
      const existing: InquiryItem[] = JSON.parse(localStorage.getItem('school_demo_inquiries') || '[]');
      const updated = existing.map((item) => (item.id === inquiryId ? { ...item, status } : item));
      localStorage.setItem('school_demo_inquiries', JSON.stringify(updated));
      setInquiries(updated);
      return;
    }

    try {
      await updateDoc(doc(db, 'inquiries', inquiryId), {
        status,
        updatedAt: serverTimestamp(),
      });
      await logActivity('ভিজিট বুকিং স্ট্যাটাস পরিবর্তন', `জিজ্ঞাসা আইডি ${inquiryId} এর অবস্থা '${status}' করা হয়েছে।`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inquiries/${inquiryId}`);
    }
  };

  const deleteInquiry = async (inquiryId: string) => {
    if (demoMode) {
      const existing: InquiryItem[] = JSON.parse(localStorage.getItem('school_demo_inquiries') || '[]');
      const updated = existing.filter((item) => item.id !== inquiryId);
      localStorage.setItem('school_demo_inquiries', JSON.stringify(updated));
      setInquiries(updated);
      return;
    }

    try {
      await deleteDoc(doc(db, 'inquiries', inquiryId));
      await logActivity('ভিজিট বুকিং মুছে ফেলা', `জিজ্ঞাসা আইডি ${inquiryId} মুছে ফেলা হয়েছে।`);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `inquiries/${inquiryId}`);
    }
  };

  const saveTestimonial = async (testimonial: Partial<TestimonialItem> & { id?: string }) => {
    try {
      if (testimonial.id && !testimonial.id.startsWith('static-')) {
        await updateDoc(doc(db, 'testimonials', testimonial.id), {
          ...testimonial,
          updatedAt: serverTimestamp(),
        });
        await logActivity('অভিভাবক মতামত সম্পাদন', `${testimonial.parentNameBn} এর মতামত আপডেট করা হয়েছে।`);
      } else {
        const { id, ...rest } = testimonial;
        await addDoc(collection(db, 'testimonials'), {
          ...rest,
          order: testimonials.length,
          createdAt: serverTimestamp(),
        });
        await logActivity('নতুন অভিভাবক মতামত', `${testimonial.parentNameBn} এর মতামত যুক্ত করা হয়েছে।`);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'testimonials');
    }
  };

  const deleteTestimonial = async (testimonialId: string) => {
    try {
      if (!testimonialId.startsWith('static-')) {
        await deleteDoc(doc(db, 'testimonials', testimonialId));
        await logActivity('অভিভাবক মতামত মুছে ফেলা', `মতামত আইডি ${testimonialId} মুছে ফেলা হয়েছে।`);
      } else {
        setTestimonials((prev) => prev.filter((item) => item.id !== testimonialId));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `testimonials/${testimonialId}`);
    }
  };

  const contextValue = useMemo<SchoolDataContextType>(
    () => ({
      schoolSettings,
      feeSettings,
      schoolType,
      themePreset,
      levels,
      applyFields,
      notices,
      admissionNotice,
      staffList,
      galleryPhotos,
      applications,
      inquiries,
      testimonials,
      activityLogs,
      moderators,
      smsSettings,
      notificationQueue,
      loading,
      demoMode,
      setDemoMode,
      getDemoApplicationStatus,
      switchPreset,
      switchTheme,
      updateSchoolSettings,
      updateFeeSettings,
      saveNotice,
      deleteNotice,
      saveStaff,
      deleteStaff,
      saveGalleryPhoto,
      deleteGalleryPhoto,
      submitApplication,
      updateApplicationStatus,
      deleteApplication,
      submitInquiry,
      updateInquiryStatus,
      deleteInquiry,
      saveTestimonial,
      deleteTestimonial,
      updateSmsSettings,
      queueNotification,
      deleteNotificationItem,
      addModerator,
      removeModerator,
      transferOwnership,
      logActivity,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      schoolSettings,
      feeSettings,
      schoolType,
      themePreset,
      levels,
      applyFields,
      notices,
      admissionNotice,
      staffList,
      galleryPhotos,
      applications,
      inquiries,
      testimonials,
      activityLogs,
      moderators,
      smsSettings,
      notificationQueue,
      loading,
      demoMode,
    ]
  );

  return (
    <SchoolDataContext.Provider value={contextValue}>
      {children}
    </SchoolDataContext.Provider>
  );
};

export const useSchoolData = () => {
  const context = useContext(SchoolDataContext);
  if (!context) {
    throw new Error('useSchoolData must be used within a SchoolDataProvider');
  }
  return context;
};
