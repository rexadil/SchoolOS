import React, { createContext, useContext, useEffect, useState } from 'react';
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
import { db, handleFirestoreError, OperationType, DEMO_MODE } from '../firebase/config';
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

export interface SchoolSettingsData {
  nameBn: string;
  nameEn: string;
  sloganBn: string;
  sloganEn: string;
  addressLine: string;
  area: string;
  upazila: string;
  district: string;
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
  addModerator: (email: string) => Promise<void>;
  removeModerator: (email: string) => Promise<void>;
  logActivity: (action: string, details: string) => Promise<void>;
}

const defaultSchoolSettings: SchoolSettingsData = {
  nameBn: defaultStaticConfig.identity.name.bn,
  nameEn: defaultStaticConfig.identity.name.en,
  sloganBn: defaultStaticConfig.identity.slogan.bn,
  sloganEn: defaultStaticConfig.identity.slogan.en,
  addressLine: defaultStaticConfig.location.addressLine1.bn,
  area: defaultStaticConfig.location.area.bn,
  upazila: defaultStaticConfig.location.upazila.bn,
  district: defaultStaticConfig.location.district.bn,
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
  facebookUrl: 'https://facebook.com',
  youtubeUrl: 'https://youtube.com',
  schoolType: defaultStaticConfig.type || 'kindergarten',
  themePreset: defaultStaticConfig.themePreset || 'dawn',
  eiin: defaultStaticConfig.eiin || '123456',
  mpoStatus: defaultStaticConfig.mpoStatus || 'এমপিওভুক্ত (MPO Enlisted)',
  schoolCode: defaultStaticConfig.schoolCode || `${defaultStaticConfig.applicationPrefix}-4509`,
  registrationNo: defaultStaticConfig.registrationNo || `${defaultStaticConfig.location.district.bn}/${defaultStaticConfig.location.upazila.bn}/২০১৬-৭৮`,
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
  bkashNumber: '01712-345678 (Personal)',
  nagadNumber: '01823-987654 (Merchant)',
  paymentInstructionsBn: 'বিকাশ বা নগদ অ্যাপের "Send Money" অথবা "Payment" অপশন ব্যবহার করে নির্দিষ্ট ফি পরিশোধ করুন এবং নিচে Transaction ID দিন।',
  paymentInstructionsEn: 'Use bKash/Nagad "Send Money" or "Payment" to pay the admission fee and enter the TrxID below.',
  admissionFees: initialFees.admissionFees,
  monthlyFees: initialFees.monthlyFees,
};

const SchoolDataContext = createContext<SchoolDataContextType | undefined>(undefined);

export const SchoolDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, isOwner } = useAuth();

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
  const [loading, setLoading] = useState(true);

  // Computed levels & apply fields from active preset or custom config
  const activePreset = presets[schoolType] || presets.kindergarten;
  const levels = (activePreset.levels || defaultStaticConfig.levels) as SchoolLevel[];
  const applyFields = activePreset.apply?.fields || defaultStaticConfig.apply.fields;

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
      console.warn('Demo init error:', e);
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
      console.warn('Demo status read error:', e);
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
        console.warn('Settings snapshot fallback:', error);
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
        console.warn('Fee settings fallback:', error);
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
      (error) => console.warn('Notices listener:', error)
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
      (error) => console.warn('Staff listener:', error)
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
      (error) => console.warn('Gallery listener:', error)
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
        console.warn('Applications snapshot note (check admin status):', error);
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
        console.warn('Inquiries snapshot note (check admin status):', error);
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
        console.warn('Testimonials listener fallback:', error);
        setTestimonials(fallbackTestimonials);
      }
    );
    return () => unsub();
  }, []);

  // 7. Live Sync Activity Logs & Moderators (Owner only)
  useEffect(() => {
    if (!isOwner) {
      setActivityLogs([]);
      setModerators([]);
      return;
    }

    const unsubLogs = onSnapshot(
      collection(db, 'activity_logs'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ActivityLogItem[];
        items.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
        setActivityLogs(items);
      },
      (error) => console.warn('Activity logs listener:', error)
    );

    const unsubAdmins = onSnapshot(
      collection(db, 'admins'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ ...d.data() })) as AdminUserItem[];
        setModerators(items);
      },
      (error) => console.warn('Admins listener:', error)
    );

    return () => {
      unsubLogs();
      unsubAdmins();
    };
  }, [isOwner]);

  useEffect(() => {
    setLoading(false);
  }, []);

  // Active Admission Notice Helper (falls back to inactive admission notice so admissionActive=false is respected)
  const admissionNotice =
    notices.find((n) => n.isAdmissionNotice && n.admissionActive) ||
    notices.find((n) => n.isAdmissionNotice);

  // Activity Logger
  const logActivity = async (action: string, details: string) => {
    try {
      await addDoc(collection(db, 'activity_logs'), {
        action,
        details,
        performedByEmail: user?.email || 'admin@school.com',
        timestamp: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Activity log write error:', err);
    }
  };

  // Actions
  const updateSchoolSettings = async (newSettings: Partial<SchoolSettingsData>) => {
    try {
      const updated = { ...schoolSettings, ...newSettings };
      await setDoc(doc(db, 'settings', 'school'), updated, { merge: true });
      setSchoolSettings(updated);
      await logActivity('বিদ্যালয়ের তথ্য পরিবর্তন', 'বিদ্যালয়ের সাধারণ তথ্য ও ব্র্যান্ডিং আপডেট করা হয়েছে।');
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

  const updateApplicationStatus = async (appId: string, status: ApplicationItem['status'], notes?: string) => {
    const targetApp = applications.find((a) => a.id === appId);
    const appNumber = targetApp?.applicationNo;

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

  return (
    <SchoolDataContext.Provider
      value={{
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
        addModerator,
        removeModerator,
        logActivity,
      }}
    >
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
