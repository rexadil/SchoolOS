import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSchoolData } from '../context/SchoolDataContext';
import { schoolConfig } from '../config/schoolConfig';
import { VisitBookingForm } from './VisitBookingForm';
import { MapPin, Phone, MessageCircle, Clock, Navigation, ExternalLink, CalendarCheck } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { lang, t } = useLanguage();
  const { schoolSettings } = useSchoolData();

  const rawWaDigits = (schoolSettings.whatsappNumber || '').replace(/[^0-9]/g, '');
  const formattedWaDigits =
    rawWaDigits.startsWith('01') && rawWaDigits.length === 11 ? `88${rawWaDigits}` : rawWaDigits;
  const waPrefill =
    lang === 'bn'
      ? `আসসালামু আলাইকুম, ${schoolSettings.nameBn} এ ভর্তি সম্পর্কে জানতে চাই।`
      : `Assalamu Alaikum, I would like admission information for ${schoolSettings.nameEn}.`;

  return (
    <section id="contact" className="py-16 sm:py-24 bg-cream-paper border-b border-line/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider mb-2">
            <MapPin className="w-4 h-4" />
            <span>{t('যোগাযোগ ও অবস্থান', 'Contact & Campus Location')}</span>
          </div>

          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink tracking-tight">
            {t(`${schoolSettings.area}, ${schoolSettings.upazila} ক্যাম্পাসে আপনাকে স্বাগতম`, `Visit Our Campus at ${schoolSettings.area}, ${schoolSettings.upazila}`)}
          </h2>

          <p className="mt-3 text-ink-muted text-sm sm:text-base leading-[1.7]">
            {t(
              'যে কোনো জিজ্ঞাসা, নতুন ভর্তি কিংবা স্কুল ক্যাম্পাস ঘুরে দেখার জন্য আমাদের সরাসরি ফোন করুন অথবা অফিসে চলে আসুন।',
              'Feel free to call our helpline, chat on WhatsApp, or visit our green campus during regular school hours.'
            )}
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Contact & Location Info */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Campus Address Card */}
            <div className="bg-surface-card rounded-[var(--radius-card)] p-6 border border-line/30 shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-[var(--radius-btn)] bg-primary-100 text-primary-800 border border-primary-300 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-ink">
                    {lang === 'bn' ? schoolSettings.nameBn : schoolSettings.nameEn}
                  </h3>
                  <p className="text-sm text-ink-muted mt-1 leading-[1.6]">
                    {schoolSettings.addressLine}, {schoolSettings.area}
                  </p>
                  <p className="text-xs text-ink-muted font-medium mt-0.5">
                    {schoolSettings.upazila}, {schoolSettings.district}, {schoolConfig.location.country[lang]}
                  </p>

                  <div className="mt-3 pt-3 border-t border-line/20 text-xs text-ink-muted space-y-1">
                    <div>
                      <strong className="text-ink">{t('চেনার সহজ উপায়:', 'Landmark:')}</strong> {schoolConfig.location.landmark[lang]}
                    </div>
                    <div className="text-[11px] font-semibold text-primary-700 dark:text-primary-300">
                      {schoolConfig.brand.productName} · {lang === 'bn' ? schoolConfig.brand.attributionBn : schoolConfig.brand.attribution}
                    </div>
                  </div>
                </div>
              </div>

              {/* Road Directions */}
              <div className="mt-4 p-3 bg-surface-2 rounded-[var(--radius-input)] border border-line/25 flex items-start gap-2 text-xs text-ink-muted">
                <Navigation className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                <span>{schoolConfig.location.directions[lang]}</span>
              </div>
            </div>

            {/* Quick Contact Numbers & Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Phone Hotlines */}
              <div className="bg-surface-card rounded-[var(--radius-card)] p-5 border border-line/30 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
                  <Phone className="w-4 h-4 text-primary-600" />
                  <span>{t('জরুরি হটলাইন', 'Hotline Numbers')}</span>
                </div>
                <a
                  href={`tel:${schoolSettings.phonePrimary}`}
                  className="block text-sm sm:text-base font-bold text-ink hover:text-primary-700 dark:hover:text-primary-300 transition-colors font-mono"
                >
                  {schoolSettings.phonePrimary}
                </a>
                <a
                  href={`tel:${schoolSettings.phoneSecondary}`}
                  className="block text-xs text-ink-muted hover:text-ink transition-colors mt-0.5 font-mono"
                >
                  {schoolSettings.phoneSecondary}
                </a>
              </div>

              {/* WhatsApp Direct */}
              {formattedWaDigits && (
                <div className="bg-surface-card rounded-[var(--radius-card)] p-5 border border-line/30 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">
                    <MessageCircle className="w-4 h-4 text-success" />
                    <span>{t('হোয়াটসঅ্যাপ সেবা', 'WhatsApp Support')}</span>
                  </div>
                  <a
                    href={`https://wa.me/${formattedWaDigits}?text=${encodeURIComponent(waPrefill)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-success hover:underline transition-colors"
                  >
                    <span>{t('সরাসরি চ্যাট করুন', 'Chat on WhatsApp')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <p className="text-[11px] text-ink-muted mt-1">
                    {t('দ্রুত জবাব দেওয়া হয়', 'Fast reply during school hours')}
                  </p>
                </div>
              )}

              {/* Office Hours */}
              <div className="bg-surface-card rounded-[var(--radius-card)] p-5 border border-line/30 shadow-xs sm:col-span-2">
                <div className="flex items-center gap-2 text-xs font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                  <Clock className="w-4 h-4 text-accent" />
                  <span>{t('অফিস সময়সূচি', 'Office Visiting Hours')}</span>
                </div>
                <p className="text-xs sm:text-sm text-ink font-medium">
                  {schoolConfig.contact.officeHours[lang]}
                </p>
              </div>

            </div>

          </div>

          {/* Right Column: Interactive Map & Inquiry Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Styled Map Container */}
            {(() => {
              const mapLat = schoolSettings.map?.lat ?? schoolConfig.map.lat ?? schoolConfig.location.geoCoordinates.lat;
              const mapLng = schoolSettings.map?.lng ?? schoolConfig.map.lng ?? schoolConfig.location.geoCoordinates.lng;
              const mapEmbedUrl = (schoolSettings.map?.embedUrl ?? schoolConfig.map.embedUrl ?? '').trim();
              const mapShareUrl =
                (schoolSettings.map?.shareUrl ?? schoolConfig.map.shareUrl ?? '').trim() ||
                `https://maps.google.com/?q=${mapLat},${mapLng}`;

              return (
                <div className="bg-surface-card rounded-[var(--radius-card)] p-4 sm:p-5 border border-line/30 shadow-xs overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <h3 className="font-heading font-bold text-sm sm:text-base text-ink flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary-600" />
                      <span>{t(`মানচিত্রে ${schoolSettings.area} ক্যাম্পাস`, `${schoolSettings.area} Campus on Map`)}</span>
                    </h3>

                    <a
                      href={mapShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-btn)] bg-primary-600 hover:bg-primary-700 text-on-primary text-xs font-bold transition-colors shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{t('দিকনির্দেশনা দেখুন', 'Get Directions')}</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  </div>

                  {/* Clean Map Representation or Placeholder */}
                  <div className="relative aspect-[16/9] w-full rounded-[var(--radius-btn)] overflow-hidden bg-surface-2 border border-line/25">
                    {mapEmbedUrl ? (
                      <iframe
                        title={`${lang === 'bn' ? schoolSettings.nameBn : schoolSettings.nameEn} Location Map`}
                        src={mapEmbedUrl}
                        className="w-full h-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-surface-2">
                        <div className="w-12 h-12 rounded-[var(--radius-btn)] bg-primary-100 text-primary-800 flex items-center justify-center mb-3 border border-primary-300">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <p className="font-heading font-bold text-sm sm:text-base text-ink">
                          {lang === 'bn' ? schoolSettings.nameBn : schoolSettings.nameEn}
                        </p>
                        <p className="text-xs text-ink-muted mt-1 max-w-sm">
                          {schoolSettings.addressLine}, {schoolSettings.area}, {schoolSettings.upazila}, {schoolSettings.district}
                        </p>
                        <p className="text-[11px] font-mono text-ink-muted mt-2">
                          {mapLat.toFixed(4)}° N, {mapLng.toFixed(4)}° E
                        </p>
                      </div>
                    )}

                    {/* Overlay Pin Callout */}
                    {mapEmbedUrl && (
                      <div className="absolute bottom-3 left-3 bg-surface-card/95 backdrop-blur-xs px-3.5 py-2 rounded-[var(--radius-input)] shadow-md border border-line/30 text-xs">
                        <span className="font-bold text-ink block font-heading">
                          {lang === 'bn' ? schoolSettings.nameBn : schoolSettings.nameEn}
                        </span>
                        <span className="text-ink-muted text-[11px]">
                          {schoolSettings.area}, {schoolSettings.upazila}, {schoolSettings.district}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Real Campus Visit Booking & Inquiry Form (Firestore inquiries collection) */}
            <div id="visit-booking" className="bg-surface-card rounded-[var(--radius-card)] p-6 sm:p-7 border border-line/30 shadow-xs">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider mb-1">
                <CalendarCheck className="w-4 h-4" />
                <span>{t('ক্যাম্পাস পরিদর্শন ও জিজ্ঞাসা', 'Book a Campus Visit')}</span>
              </div>
              <h3 className="font-heading font-bold text-lg sm:text-xl text-ink mb-1.5">
                {t('ক্যাম্পাস ভিজিট বুকিং ও সরাসরি বার্তা', 'Schedule Your Visit or Send an Inquiry')}
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted mb-5 leading-[1.6]">
                {t(
                  'সপরিবারে আমাদের শ্রেণিকক্ষ, পরিবেশ ও শিক্ষকবৃন্দের সাথে দেখা করার জন্য পছন্দের সময় বুক করুন।',
                  'Pick a preferred date and time to tour our campus and meet our teachers in person.'
                )}
              </p>

              <VisitBookingForm />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
