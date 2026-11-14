# আশার আলো কিন্ডারগার্টেন স্কুল (Ashar Alo Kindergarten School)
### দিনবাজার, ঘড়িয়ালডাঙ্গা, রাজারহাট, কুড়িগ্রাম, বাংলাদেশ

দ্বিভাষিক (বাংলা ও ইংরেজি) কিন্ডারগার্টেন ও প্রাথমিক বিদ্যালয় ওয়েবসাইট, অনলাইন ভর্তি পোর্টাল (`/apply`), ট্র্যাকিং স্ট্যাটাস পোর্টাল (`/status`), এবং সম্পূর্ণ অ্যাডমিন ড্যাশবোর্ড (`/admin`)।

---

## 📋 ফায়ারবেস সেটআপ চেকলিস্ট (Setup Checklist in Bangla)

বিদ্যালয়টির লাইভ ডেটাবেজ ও অ্যাডমিন প্যানেল সক্রিয় করতে নিচের ধাপগুলো অনুসরণ করুন:

1. **ফায়ারবেস প্রজেক্ট তৈরি (Firebase Project):**
   - [Firebase Console](https://console.firebase.google.com) এ যান এবং একটি নতুন প্রজেক্ট তৈরি করুন।
2. **গুগল সাইন-ইন চালু (Google Sign-In):**
   - **Authentication** > **Sign-in method** এ গিয়ে **Google** প্রোভাইডার চালু (Enable) করুন এবং সাপোর্ট ইমেইল নির্বাচন করুন।
3. **ফায়ারস্টোর ডাটাবেজ তৈরি (Firestore Database):**
   - **Firestore Database** এ ক্লিক করে **Create Database** নির্বাচন করুন।
   - লোকেশন হিসেবে কাছাকাছি রিজিয়ন (যেমন: `asia-southeast1`) নির্বাচন করুন।
4. **কনফিগারেশন পেস্ট (Paste Keys):**
   - প্রজেক্টের **Project settings** > **General** > **Your apps** থেকে Web App যোগ করে কনফিগারেশনটি `firebase-applet-config.json` ফাইলে পেস্ট করুন।
5. **ডেমো মোড বন্ধ করা (Set demo: false):**
   - `src/firebase/config.ts` ফাইলে গিয়ে `DEMO_MODE = false` নিশ্চিত করুন।
6. **Developer ও Initial Owner Email সেট করা (দুই স্থানে):**
   - `src/config/schoolConfig.ts`-এ `developerEmails` ও `ownerEmail` সেট করুন।
   - `firestore.rules`-এর শীর্ষে `developerEmails()` এবং `ownerEmail()` ঠিক একই Gmail-এ রাখুন।
7. **সিকিউরিটি রুলস ডিপ্লয় (Deploy Rules):**
   - টার্মিনালে `firebase deploy --only firestore:rules` রান করে রুলস ডিপ্লয় করুন।
8. **অথরাইজড ডোমেইন যুক্ত করা (Authorized Domains):**
   - **Firebase Console** > **Authentication** > **Settings** > **Authorized domains** ট্যাবে গিয়ে আপনার Vercel বা কাস্টম ডোমেইন যুক্ত করুন।

---

## 🛡️ প্রধান কারিগরি বৈশিষ্ট্যসমূহ (Architecture & Security)

1. **জিরো ফায়ারবেস স্টোরেজ (No Paid Storage Plan Needed):**
   - ব্রাউজার-সাইড এইচটিএমএল ক্যানভাস ভিত্তিক `compressImage()` ইউটিলিটি।
   - যেকোনো ১২ মেগাবাইট পর্যন্ত ছবি স্বয়ংক্রিয়ভাবে অপ্টিমাইজ হয়ে ফায়ারস্টোরে ডকুমেন্টের ভেতরে সেভ হয়:
     - লোগো ও শিক্ষকের ছবি: সর্বোচ্চ ৪৮০px (~১২০-১৫০ KB)
     - গ্যালারি ছবি: সর্বোচ্চ ১২৮০px (~২৩০ KB)
     - শিক্ষার্থীর ছবি: সর্বোচ্চ ৪৮০px (~১৫০ KB)
   - প্রতিটি ডকুমেন্ট ফায়ারস্টোরের ১ মেগাবাইট লিমিটের অনেক নিচে থাকে।
2. **হার্ডেনড ফায়ারস্টোর রুলস (Hardened Firestore Security):**
   - অ্যাডমিনদের জন্য `request.auth.token.email_verified == true` বাধ্যতামূলক।
   - অ্যাপ্লিকেশন তৈরির ক্ষেত্রে শুধুমাত্র `status == 'pending'`, `createdAt == request.time`, সঠিক কীসমূহ (`hasOnly`), ১১ ডিজিটের বাংলাদেশি ফোন নম্বর এবং কঠোর ফিল্ড লেন্থ সীমাবদ্ধতা কার্যকর।
   - ফি ও মডারেটর ম্যানেজমেন্ট শুধুমাত্র ওনারের জন্য সংরক্ষিত।
3. **পাবলিক স্ট্যাটাস ভেরিফিকেশন (`/status`):**
   - অভিভাবক আবেদন নম্বর ও ১১ ডিজিটের মোবাইল নম্বর দিলে সিস্টেম `"NUMBER:PHONE"` এর SHA-256 হ্যাশ গণনা করে `application_status/{number}` ডকুমেন্টের `verifyHash` এর সাথে মিলিয়ে স্ট্যাটাস প্রদর্শন করে।
   - যেকোনো মিসম্যাচ বা অস্তিত্বহীন আবেদনে একই ধরনের নিরাপদ বার্তা প্রদর্শন করায় ডেটা গণনা (Enumeration Attack) রোধ হয়।
4. **স্প্যাম প্রতিরোধ:**
   - হিডেন হানিপট (Honeypot) ফিল্ড।
   - ৬০ সেকেন্ডের ক্লায়েন্ট-সাইড কুল-ডাউন টাইমার।
   - গত ২৪ ঘণ্টার মধ্যে একই শিক্ষার্থী ও মোবাইল নম্বরে ডুপ্লিকেট জমা প্রতিরোধ।
5. **ডেমো মোড সেফটি ব্যানার:**
   - ডেমো মোড চালু থাকলে প্রতিটি পেজের শীর্ষে লাল স্টিকি সতর্কবার্তা প্রদর্শিত হয়: `"ডেমো মোড — এখানে দেওয়া তথ্য সংরক্ষিত হবে না / Demo mode — data is NOT saved"`।

---

## 🔒 বাণিজ্যিক মালিকানা সুরক্ষা (Developer Ownership Lock)

1. **হার্ডকোডেড ডেভেলপার তালিকা:** `src/config/schoolConfig.ts` (`developerEmails`) এবং `firestore.rules` (`developerEmails()`) উভয় স্থানে একই ডেভেলপার Gmail যুক্ত থাকতে হবে।
2. **প্রথম ওনার হস্তান্তর ও লক:** ডেভেলপার `/admin` এ প্রবেশ করে বিদ্যালয়ের অধ্যক্ষের Gmail সেট করলে Firestore-এর `settings/ownership` এবং `settings/school` ডকুমেন্টে `ownershipLocked: true` সেট হয় এবং `activity_logs`-এ তা লিপিবদ্ধ হয়।
3. **অধ্যক্ষের প্যানেলে হস্তান্তর নিষিদ্ধ:** একবার হস্তান্তরের পর অধ্যক্ষ (Normal Owner) বিদ্যালয়ের নাম, স্লোগান, ঠিকানা, ম্যাপ, ফোন, WhatsApp, ইমেইল, ফেসবুক, অধ্যক্ষের বাণী ও অ্যানাউন্সমেন্ট বার সহ সব কনটেন্ট এডিট করতে পারবেন; কিন্তু অ্যাডমিন প্যানেলে **Owner Transfer UI সম্পূর্ণ লুকানো** থাকবে এবং Firestore Security Rules অনুযায়ী তিনি `ownerEmail` বা `ownershipLocked` পরিবর্তন করতে পারবেন না।

---

## 🚀 Multi-School Vercel Deployment Guide (ভার্সেল ডিপ্লয়মেন্ট গাইড)

এই প্রজেক্টটি **প্রতিটি বিদ্যালয়ের জন্য আলাদা Firebase প্রজেক্ট + আলাদা Vercel প্রজেক্ট** হিসেবে স্ট্যাটিক Vite + React SPA মোডে ডিপ্লয় করার জন্য সম্পূর্ণ প্রস্তুত:

1. **নতুন স্কুলের জন্য Firebase প্রজেক্ট সেটআপ:**
   - প্রতিটি ক্লায়েন্ট স্কুলের জন্য একটি করে নতুন Firebase প্রজেক্ট তৈরি করুন, Google Auth ও Firestore চালু করুন এবং `firebase deploy --only firestore:rules` চালিয়ে `firestore.rules` ডিপ্লয় করুন।
2. **Vercel-এ নতুন প্রজেক্ট ইমপোর্ট:**
   - [Vercel Dashboard](https://vercel.com) থেকে **Add New Project** নির্বাচন করে একই GitHub টেমপ্লেট রিপোজিটরি ইমপোর্ট করুন (প্রতিটি স্কুলের জন্য আলাদা Vercel প্রজেক্ট)।
   - Framework Preset: **Vite** | Build Command: `npm run build` | Output Directory: `dist`।
3. **স্কুল-নির্দিষ্ট Environment Variables যোগ করুন:**
   - Vercel Project Settings → **Environment Variables**-এ `.env.example` অনুযায়ী ওই স্কুলের Firebase প্রজেক্টের মান বসান:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_FIREBASE_DATABASE_ID` (নতুন প্রজেক্টের জন্য `(default)`)
     - `VITE_FIREBASE_APPCHECK_SITE_KEY` (ঐচ্ছিক, App Check চালু করলে)
   - *(নোট: কোনো `VITE_*` ভেরিয়েবলে কখনোই SMS বা সার্ভার গোপন API কী রাখবেন না।)*
4. **Firebase Authorized Domains আপডেট:**
   - **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**-এ ওই স্কুলের Vercel ডোমেইন (যেমন `school-name.vercel.app` ও কাস্টম ডোমেইন) যুক্ত করুন।
5. **প্রথম লগইন ও Ownership Lock সম্পন্ন করা:**
   - ডিপ্লয়ের পর ডেভেলপার `/admin`-এ লগইন করে **স্কুল পরিচিতি** ট্যাব থেকে বিদ্যালয়ের প্রাথমিক তথ্য দিন এবং অধ্যক্ষের Gmail সেট করে `ownershipLocked: true` লক করুন।
6. **SPA Routing ও ক্যাশিং (`vercel.json`):**
   - `vercel.json` সব ডাইরেক্ট পাথ (`/admin`, `/apply`, `/status`, `/visit`) `/index.html`-এ রি-রাইট করবে, `assets/` ও `images/` ফোল্ডারে `immutable` ক্যাশ হেডার দেবে এবং `/sw.js` ও `/manifest.webmanifest`-এ `must-revalidate` নিশ্চিত করবে।
7. **সম্পূর্ণ অভ্যন্তরীণ ডিপ্লয়মেন্ট ও হ্যান্ডওভার প্লেবুক:**
   - নতুন প্রতিটি স্কুলের জন্য Firebase + Vercel তৈরি, Rules ডিপ্লয়, Ownership Lock ও অধ্যক্ষ হ্যান্ডওভারের বিস্তারিত ধাপসমূহ [`DEPLOYMENT.md`](./DEPLOYMENT.md) ফাইলে সংরক্ষিত রয়েছে।


