import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolData } from '../context/SchoolDataContext';
import { schoolConfig } from '../config/schoolConfig';
import { getAdmissionClosedInfo } from '../utils/admissionStatus';
import { X, CheckCircle, Printer, Phone, Calendar, User, MapPin, Send, AlertCircle, ShieldCheck } from 'lucide-react';

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClass?: string;
}

export const AdmissionModal: React.FC<AdmissionModalProps> = ({
  isOpen,
  onClose,
  preselectedClass,
}) => {
  const { lang, t } = useLanguage();
  const { levels, schoolSettings, admissionNotice } = useSchoolData();
  const closedInfo = getAdmissionClosedInfo(admissionNotice);
  const displayEndDate = lang === 'bn' ? closedInfo.formattedEndDateBn : closedInfo.formattedEndDateEn;

  const [formData, setFormData] = useState({
    studentNameBn: '',
    studentNameEn: '',
    birthDate: '',
    gender: 'male',
    appliedClass: preselectedClass || levels[0]?.name[lang] || 'Play',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    guardianPhone: '',
    villageUnion: `${schoolSettings.area}, ${schoolSettings.upazila}`,
    previousSchool: '',
    agreedToTerms: false,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (closedInfo.closed) {
      setErrorMsg(t('আবেদন বন্ধ রয়েছে।', 'Admission is closed.'));
      return;
    }

    // Validation
    if (!formData.studentNameBn.trim() && !formData.studentNameEn.trim()) {
      setErrorMsg(t('অনুগ্রহ করে শিক্ষার্থীর নাম লিখুন।', 'Please enter the student name.'));
      return;
    }
    if (!formData.guardianPhone.trim() || formData.guardianPhone.length < 10) {
      setErrorMsg(t('অনুগ্রহ করে অভিভাবকের সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।', 'Please provide a valid mobile number.'));
      return;
    }
    if (!formData.agreedToTerms) {
      setErrorMsg(
        t(
          'আবেদন জমা দেওয়ার আগে অনুগ্রহ করে গোপনীয়তা ও সম্মতি বাক্সে টিক দিন।',
          'Please accept the Privacy Notice & consent checkbox before submitting.'
        )
      );
      return;
    }

    // Generate unique application tracking code
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const appId = `${schoolConfig.applicationPrefix}-${new Date().getFullYear()}-${randomNum}`;
    setApplicationId(appId);
    setIsSubmitted(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      studentNameBn: '',
      studentNameEn: '',
      birthDate: '',
      gender: 'male',
      appliedClass: levels[0]?.name[lang] || 'Play',
      fatherName: '',
      fatherOccupation: '',
      motherName: '',
      guardianPhone: '',
      villageUnion: `${schoolSettings.area}, ${schoolSettings.upazila}`,
      previousSchool: '',
      agreedToTerms: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-surface-card text-ink rounded-[var(--radius-card)] shadow-2xl border border-line/35 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        
        {/* Top Header Bar */}
        <div className="bg-primary-600 px-6 py-4 text-on-primary flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-lg sm:text-xl">
              {t('অনলাইন ভর্তি আবেদন ফরম', 'Online Admission Application')}
            </h3>
            <p className="text-xs text-on-primary/85 font-medium">
              {schoolConfig.identity.name[lang]} · {schoolSettings.area}, {schoolSettings.upazila}, {schoolSettings.district}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-on-primary/15 hover:bg-on-primary/25 text-on-primary transition-colors"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
          {closedInfo.closed ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-[var(--radius-card)] bg-danger-soft text-on-danger-soft flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-danger-soft text-on-danger-soft text-xs font-bold">
                {t('আবেদন বন্ধ', 'Admission Closed')}
              </span>
              <h4 className="font-heading font-bold text-xl text-ink">
                {t('ভর্তি আবেদন কার্যক্রম বর্তমানে বন্ধ রয়েছে', 'Admissions Are Currently Closed')}
              </h4>
              {displayEndDate && (
                <p className="text-xs font-semibold text-ink-muted">
                  {t(`আবেদনের শেষ তারিখ: ${displayEndDate}`, `End Date: ${displayEndDate}`)}
                </p>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-on-primary text-xs font-bold rounded-[var(--radius-btn)]"
              >
                {t('বন্ধ করুন', 'Close')}
              </button>
            </div>
          ) : !isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Notice pill */}
              <div className="p-3.5 bg-warning-soft rounded-[var(--radius-card)] border border-warning/30 text-xs sm:text-sm text-on-warning-soft leading-[1.6]">
                <strong>{t('জরুরি নির্দেশিকা:', 'Important Note:')}</strong>{' '}
                {t(
                  'অনলাইনে ফরমটি জমা দেওয়ার পর একটি ডিজিটাল আবেদন স্লিপ তৈরি হবে। স্লিপটি সংরক্ষণ করুন এবং অফিস চলাকালীন স্কুলে উপস্থিত হয়ে ভর্তি নিশ্চিত করুন।',
                  'Submitting this form generates a digital application slip. Please save or print it and visit our school campus to finalize enrollment.'
                )}
              </div>

              {errorMsg && (
                <div className="p-3 bg-danger-soft text-on-danger-soft text-xs sm:text-sm rounded-[var(--radius-btn)] border border-danger/30 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Student Info Group */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-line/25 pb-1.5">
                  <User className="w-3.5 h-3.5 text-primary-600" />
                  <span>{t('১. শিক্ষার্থীর সাধারণ তথ্য', '1. Student Information')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('শিক্ষার্থীর নাম (বাংলায়) *', "Student's Full Name (Bengali) *")}
                    </label>
                    <input
                      type="text"
                      name="studentNameBn"
                      value={formData.studentNameBn}
                      onChange={handleChange}
                      placeholder={t('যেমন: তানভীর আহমেদ অর্ণব', 'e.g. Tanvir Ahmed')}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink focus:border-primary-600 focus:ring-2 focus:ring-ring/25 text-sm outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('শিক্ষার্থীর নাম (ইংরেজিতে)', "Student's Full Name (English)")}
                    </label>
                    <input
                      type="text"
                      name="studentNameEn"
                      value={formData.studentNameEn}
                      onChange={handleChange}
                      placeholder="e.g. Tanvir Ahmed Ornob"
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink focus:border-primary-600 focus:ring-2 focus:ring-ring/25 text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('ভর্তির শ্রেণি *', 'Class Applying For *')}
                    </label>
                    <select
                      name="appliedClass"
                      value={formData.appliedClass}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink focus:border-primary-600 focus:ring-2 focus:ring-ring/25 text-sm outline-none font-medium"
                    >
                      {levels.map((cls) => (
                        <option key={cls.id} value={cls.name[lang]}>
                          {cls.name[lang]} {cls.age ? `(${cls.age[lang]})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                      <span>{t('জন্ম তারিখ', 'Date of Birth')}</span>
                    </label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink focus:border-primary-600 focus:ring-2 focus:ring-ring/25 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('লিঙ্গ', 'Gender')}
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink focus:border-primary-600 focus:ring-2 focus:ring-ring/25 text-sm outline-none"
                    >
                      <option value="male">{t('ছেলে (Male)', 'Male')}</option>
                      <option value="female">{t('মেয়ে (Female)', 'Female')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Parents & Guardians Info */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5 border-b border-line/25 pb-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary-600" />
                  <span>{t('২. অভিভাবক ও যোগাযোগের ঠিকানা', '2. Guardian & Contact Info')}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('পিতার নাম *', "Father's Name *")}
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      placeholder={t('পিতার পূর্ণ নাম', "Father's Full Name")}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink focus:border-primary-600 focus:ring-2 focus:ring-ring/25 text-sm outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('মাতার নাম', "Mother's Name")}
                    </label>
                    <input
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleChange}
                      placeholder={t('মাতার পূর্ণ নাম', "Mother's Full Name")}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink focus:border-primary-600 focus:ring-2 focus:ring-ring/25 text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      {t('অভিভাবকের মোবাইল নম্বর *', "Guardian's Mobile Number *")}
                    </label>
                    <input
                      type="tel"
                      name="guardianPhone"
                      value={formData.guardianPhone}
                      onChange={handleChange}
                      placeholder="01712-XXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink focus:border-primary-600 focus:ring-2 focus:ring-ring/25 text-sm outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-ink-muted" />
                      <span>{t('গ্রাম ও এলাকা / ইউনিয়ন *', 'Village & Union / Area *')}</span>
                    </label>
                    <input
                      type="text"
                      name="villageUnion"
                      value={formData.villageUnion}
                      onChange={handleChange}
                      placeholder={t(`যেমন: ${schoolSettings.area}, ${schoolSettings.upazila}`, `e.g. ${schoolSettings.area}, ${schoolSettings.upazila}`)}
                      className="w-full px-3.5 py-2.5 rounded-[var(--radius-input)] border border-line/40 bg-surface text-ink focus:border-primary-600 focus:ring-2 focus:ring-ring/25 text-sm outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Notice & Required Guardian Consent */}
              <div className="p-3.5 rounded-[var(--radius-card)] bg-surface-2 border border-line/30 space-y-2.5">
                <div className="flex items-start gap-2 text-xs text-ink-muted leading-[1.6]">
                  <ShieldCheck className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                  <span>
                    {t(
                      'তথ্য গোপনীয়তা: প্রদত্ত সকল তথ্য শুধুমাত্র বিদ্যালয়ের ভর্তি কার্যক্রমে ব্যবহৃত হবে এবং কোনো তৃতীয় পক্ষের সাথে বিনিময় করা হবে না।',
                      'Privacy Notice: Collected details are used solely for school admission processing and never shared with third parties.'
                    )}
                  </span>
                </div>

                <label className="flex items-start gap-2.5 pt-2 border-t border-line/20 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, agreedToTerms: e.target.checked }));
                      setErrorMsg('');
                    }}
                    required
                    className="mt-0.5 w-4 h-4 rounded accent-primary-600 shrink-0 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-ink leading-[1.5]">
                    {t(
                      'আমি গোপনীয়তা বিজ্ঞপ্তিতে সম্মতি দিচ্ছি এবং নিশ্চিত করছি প্রদত্ত তথ্য সঠিক। *',
                      'I consent to the Privacy Notice and confirm all provided details are accurate. *'
                    )}
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-line/25 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-[var(--radius-btn)] text-ink-muted hover:text-ink font-semibold text-sm transition-colors"
                >
                  {t('বাতিল', 'Cancel')}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-[var(--radius-btn)] bg-primary-600 hover:bg-primary-700 text-on-primary font-bold text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('আবেদনপত্র জমা দিন', 'Submit Application')}</span>
                </button>
              </div>

            </form>
          ) : (
            /* Submission Confirmation / Printable Admission Slip */
            <div id="printable-admission-token" className="space-y-6">
              
              <div className="p-4 bg-success-soft rounded-[var(--radius-card)] border border-success/30 text-center">
                <CheckCircle className="w-10 h-10 text-success mx-auto mb-2" />
                <h4 className="font-heading font-bold text-xl text-on-success-soft">
                  {t('ভর্তি আবেদন সফলভাবে গৃহীত হয়েছে!', 'Application Submitted Successfully!')}
                </h4>
                <p className="text-xs sm:text-sm text-on-success-soft/90 mt-1">
                  {t(
                    'আপনার আবেদনটি আমাদের কেন্দ্রীয় তালিকায় অন্তর্ভুক্ত করা হয়েছে।',
                    'Your application token has been registered in the school admission roster.'
                  )}
                </p>
              </div>

              {/* Printable Slip Card */}
              <div className="p-6 bg-surface-2 rounded-[var(--radius-card)] border-2 border-dashed border-primary-400">
                <div className="text-center pb-4 border-b border-line/25">
                  <h3 className="font-heading font-extrabold text-xl text-ink">
                    {schoolConfig.identity.name[lang]}
                  </h3>
                  <p className="text-xs text-ink-muted">
                    {schoolConfig.location.area[lang]}, {schoolConfig.location.upazila[lang]}, {schoolConfig.location.district[lang]}
                  </p>
                  <div className="mt-2 inline-block px-3 py-1 bg-primary-100 rounded-md text-xs font-mono font-bold text-primary-900">
                    {t('আবেদন ট্র্যাকিং নং:', 'Application Tracking No:')} {applicationId}
                  </div>
                </div>

                <div className="py-4 grid grid-cols-2 gap-3 text-xs sm:text-sm text-ink-muted">
                  <div>
                    <span className="block">{t('শিক্ষার্থীর নাম:', "Student's Name:")}</span>
                    <strong className="text-ink">{formData.studentNameBn || formData.studentNameEn}</strong>
                  </div>
                  <div>
                    <span className="block">{t('ভর্তির শ্রেণি:', 'Applied Class:')}</span>
                    <strong className="text-ink">{formData.appliedClass}</strong>
                  </div>
                  <div>
                    <span className="block">{t('পিতার নাম:', "Father's Name:")}</span>
                    <strong className="text-ink">{formData.fatherName}</strong>
                  </div>
                  <div>
                    <span className="block">{t('যোগাযোগের ফোন:', 'Contact Phone:')}</span>
                    <strong className="text-ink">{formData.guardianPhone}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="block">{t('ঠিকানা:', 'Address:')}</span>
                    <span className="text-ink">{formData.villageUnion}</span>
                  </div>
                </div>

                {/* Checklist to bring to campus */}
                <div className="pt-3 border-t border-line/25 text-xs text-ink-muted">
                  <p className="font-bold text-ink mb-1">
                    {t('স্কুলে আসার সময় সাথে যা আনতে হবে:', 'Please bring the following to campus:')}
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {schoolConfig.admission.requiredDocuments[lang].map((doc: string, idx: number) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons for Slip */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-semibold text-ink-muted hover:text-ink"
                >
                  {t('নতুন আবেদন করুন', 'Submit Another Application')}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-2 rounded-[var(--radius-btn)] bg-surface-2 hover:bg-primary-50 border border-line/30 text-ink font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-ink-muted" />
                    <span>{t('স্লিপ প্রিন্ট / সংরক্ষণ করুন', 'Print / Save Slip')}</span>
                  </button>

                  <a
                    href={`https://wa.me/${schoolConfig.contact.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `আসসালামু আলাইকুম, আমি ${schoolConfig.identity.name.bn} এ ভর্তির অনলাইন আবেদন করেছি। ট্র্যাকিং নং: ${applicationId}, শিক্ষার্থীর নাম: ${formData.studentNameBn || formData.studentNameEn}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-[var(--radius-btn)] bg-success hover:opacity-90 text-on-success font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>{t('হোয়াটসঅ্যাপে জানান', 'Send on WhatsApp')}</span>
                  </a>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
