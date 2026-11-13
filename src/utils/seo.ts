import { SchoolConfig } from '../config/schoolConfig';
import { SchoolSettingsData } from '../context/SchoolDataContext';
import { AppearanceSettings } from '../theme/themes';

export type SeoRoute = 'home' | 'apply' | 'status' | 'admin' | 'visit';

export interface VideoEmbedInfo {
  kind: 'iframe' | 'video';
  src: string;
}

/**
 * Safely converts a YouTube, Vimeo, or direct MP4/WebM URL into an embeddable source.
 * Returns null for invalid or unsafe protocols.
 */
export function parseVideoEmbedUrl(rawUrl?: string): VideoEmbedInfo | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    // YouTube standard, shorts, or youtu.be
    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0];
      if (id) {
        return {
          kind: 'iframe',
          src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`,
        };
      }
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (url.pathname.startsWith('/embed/')) {
        return { kind: 'iframe', src: url.toString() };
      }
      const v = url.searchParams.get('v');
      if (v) {
        return {
          kind: 'iframe',
          src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v)}?rel=0`,
        };
      }
      if (url.pathname.startsWith('/shorts/')) {
        const id = url.pathname.split('/')[2];
        if (id) {
          return {
            kind: 'iframe',
            src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`,
          };
        }
      }
    }

    // Vimeo
    if (host === 'vimeo.com') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) {
        return {
          kind: 'iframe',
          src: `https://player.vimeo.com/video/${encodeURIComponent(id)}`,
        };
      }
    }
    if (host === 'player.vimeo.com') {
      return { kind: 'iframe', src: url.toString() };
    }

    // Direct video asset
    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url.pathname)) {
      return { kind: 'video', src: url.toString() };
    }
  } catch {
    return null;
  }

  return null;
}

function setOrCreateMeta(attrName: 'name' | 'property', attrValue: string, content: string) {
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function syncSeoHeadAndSchema(params: {
  route: SeoRoute;
  lang: 'bn' | 'en';
  schoolConfig: SchoolConfig;
  schoolSettings: SchoolSettingsData;
  appearance: AppearanceSettings;
}) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const { route, lang, schoolConfig, schoolSettings, appearance } = params;
  const schoolName = lang === 'bn' ? schoolSettings.nameBn : schoolSettings.nameEn;
  const slogan = lang === 'bn' ? schoolSettings.sloganBn : schoolSettings.sloganEn;
  const locationStr = `${schoolSettings.area}, ${schoolSettings.upazila}, ${schoolSettings.district}`;
  const origin = window.location.origin;

  const routePath = route === 'home' ? '/' : `/#${route}`;
  const canonicalUrl = `${origin}${routePath}`;
  const ogImageUrl = `${origin}/images/hero_school_sunrise.webp`;

  const routeMeta: Record<SeoRoute, { title: string; desc: string }> = {
    home: {
      title: `${schoolName} | ${schoolConfig.brand.productName}`,
      desc: `${schoolName} (${locationStr}) — ${slogan}. ${schoolConfig.brand.attribution}.`,
    },
    apply: {
      title:
        lang === 'bn'
          ? `অনলাইন ভর্তি আবেদন | ${schoolName}`
          : `Online Admission Application | ${schoolName}`,
      desc:
        lang === 'bn'
          ? `${schoolName}-এর অনলাইন ভর্তি ফরম পূরণ করুন। মাত্র ২ মিনিটে আবেদন ও ডিজিটাল টোকেন সংগ্রহ।`
          : `Submit your online admission application to ${schoolName} (${locationStr}) in 2 minutes.`,
    },
    status: {
      title:
        lang === 'bn'
          ? `ভর্তি আবেদনের অবস্থা যাচাই | ${schoolName}`
          : `Check Admission Status | ${schoolName}`,
      desc:
        lang === 'bn'
          ? `আবেদন নম্বর ও মোবাইল নম্বর দিয়ে ${schoolName}-এর ভর্তি আবেদনের সর্বশেষ অবস্থা যাচাই করুন।`
          : `Verify your admission application status at ${schoolName} with your application number and phone.`,
    },
    visit: {
      title:
        lang === 'bn'
          ? `ক্যাম্পাস ভিজিট বুকিং | ${schoolName}`
          : `Book a Campus Visit | ${schoolName}`,
      desc:
        lang === 'bn'
          ? `${schoolName} ক্যাম্পাস সরাসরি পরিদর্শনের জন্য সময় বুক করুন (${locationStr})।`
          : `Schedule a guided campus tour at ${schoolName} in ${locationStr}.`,
    },
    admin: {
      title:
        lang === 'bn'
          ? `প্রশাসক পোর্টাল | ${schoolName}`
          : `Admin Portal | ${schoolName}`,
      desc: `${schoolName} institutional management portal.`,
    },
  };

  const { title, desc } = routeMeta[route];

  document.title = title;
  document.documentElement.lang = lang;

  setOrCreateMeta('name', 'description', desc);
  setOrCreateMeta('property', 'og:site_name', schoolConfig.brand.productName);
  setOrCreateMeta('property', 'og:title', title);
  setOrCreateMeta('property', 'og:description', desc);
  setOrCreateMeta('property', 'og:url', canonicalUrl);
  setOrCreateMeta('property', 'og:image', ogImageUrl);
  setOrCreateMeta('name', 'twitter:title', title);
  setOrCreateMeta('name', 'twitter:description', desc);
  setOrCreateMeta('name', 'twitter:image', ogImageUrl);

  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = canonicalUrl;

  // Dynamic Favicon
  let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }
  const customFavicon = appearance.faviconUrl || appearance.logoUrl || schoolSettings.logoUrl;
  if (customFavicon) {
    favicon.type = 'image/png';
    favicon.href = customFavicon;
  } else {
    favicon.type = 'image/svg+xml';
    favicon.href = '/favicon.svg';
  }

  // Dynamic School Schema.org JSON-LD
  const sameAs = [
    appearance.socialLinks.facebook,
    appearance.socialLinks.youtube,
    appearance.socialLinks.instagram,
    appearance.socialLinks.website,
  ]
    .map((u) => (u || '').trim())
    .filter((u) => /^https?:\/\//i.test(u));

  const mapLat = schoolSettings.map?.lat ?? schoolConfig.map.lat;
  const mapLng = schoolSettings.map?.lng ?? schoolConfig.map.lng;
  const logoSrc =
    customFavicon && customFavicon.startsWith('http')
      ? customFavicon
      : `${origin}/pwa-512x512.png`;

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'School',
    name: schoolSettings.nameEn || schoolConfig.identity.name.en,
    alternateName: schoolSettings.nameBn || schoolConfig.identity.name.bn,
    description: desc,
    url: origin,
    logo: logoSrc,
    image: ogImageUrl,
    telephone: schoolSettings.phonePrimary,
    email: schoolSettings.email,
    foundingDate: String(schoolConfig.identity.establishedYear),
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${schoolSettings.addressLine}, ${schoolSettings.area}`,
      addressLocality: schoolSettings.upazila,
      addressRegion: schoolSettings.district,
      addressCountry: 'BD',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: mapLat,
      longitude: mapLng,
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  let ldScript = document.getElementById('school-jsonld') as HTMLScriptElement | null;
  if (!ldScript) {
    ldScript = document.createElement('script');
    ldScript.id = 'school-jsonld';
    ldScript.type = 'application/ld+json';
    document.head.appendChild(ldScript);
  }
  ldScript.textContent = JSON.stringify(schemaData);
}
