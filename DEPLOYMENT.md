# Commercial Multi-School Deployment & Handover Playbook

> **Internal Developer SOP** — Standard operating procedure to launch a new school website + admission system using **one GitHub template repository**, **one dedicated Firebase project per school**, and **one dedicated Vercel project per school**.

---

## Architecture Overview (Multi-School Isolation)

- **Codebase (Shared Git Template):** React 19 + Vite 8 + Tailwind v4 + TypeScript.
- **Database & Auth (Per-School Isolated):** Firebase Authentication (Google Sign-In) + Cloud Firestore (**Spark free plan — zero Firebase Storage required**; images are client-side compressed into Firestore documents).
- **Frontend Hosting (Per-School Isolated):** Vercel static SPA deployment with `vercel.json` rewrites + immutable asset caching.
- **Commercial Business Protection (Ownership Lock):**
  - Only emails listed in `developerEmails` (`src/config/schoolConfig.ts`) AND `developerEmails()` (`firestore.rules`) can assign/reassign school ownership.
  - Once you assign the school Principal's Gmail (`ownershipLocked: true`), the Principal gets full day-to-day control over school identity, theme, fees, notices, staff, gallery, applications, inquiries, and moderators — **but can never transfer ownership to another Gmail**.

---

## Pre-Flight: One-Time Template Master Check

Before deploying for client schools, verify your master template repo has **your** developer Gmail(s) synchronized in **two** places:

1. `src/config/schoolConfig.ts`
   - `developerEmails: ["your-dev-email@gmail.com"]`
   - `ownerEmail: "your-dev-email@gmail.com"` (initial fallback before `settings/ownership` is written)
2. `firestore.rules`
   - `function developerEmails() { return ["your-dev-email@gmail.com"]; }`
   - `function ownerEmail() { return "your-dev-email@gmail.com"; }`

> **Rule:** Never keep temporary school credentials or SMS gateway secrets inside client code or `VITE_*` variables.

---

## Step 1: Create a New Firebase Project for the School

1. Open [Firebase Console](https://console.firebase.google.com/) and click **Create a project**.
2. Name it clearly per school, e.g. `school-greenfield-high` (disable Google Analytics unless requested).
3. **Enable Google Authentication:**
   - Go to **Build → Authentication → Get started**.
   - Select **Sign-in method → Google → Enable**.
   - Set **Project support email** to your developer or school support Gmail and click **Save**.
4. **Create Firestore Database:**
   - Go to **Build → Firestore Database → Create database**.
   - Choose **Standard edition** and select the closest region (recommended: `asia-south1` Mumbai or `asia-southeast1` Singapore).
   - Start in **Production mode** (we will deploy hardened `firestore.rules` in Step 2).
5. **Register Web App:**
   - Go to **Project settings (gear icon) → General → Your apps → Add app (`</>`)**.
   - Register nickname e.g. `school-web` (no need to enable Firebase Hosting if hosting on Vercel).
   - Keep the generated `firebaseConfig` (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`) ready for Step 4.

---

## Step 2: Deploy Firestore Security Rules to the New School Project

This repository includes `firebase.json` configured for the AI Studio workspace (`"database": "ai-studio-..."`). New standard Firebase projects created in Step 1 use the **`(default)`** Firestore database.

To deploy `firestore.rules` to a **new client school's `(default)` database** safely:

1. Ensure you have Firebase CLI installed and logged in:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. Verify `firestore.rules` contains your synchronized `developerEmails()`.
3. Deploy rules **without overwriting the template repo's AI Studio config**, either by:
   - **Option A (Recommended for CLI):** Temporarily point a local `firebase deploy` using `--project <new-school-project-id>` after ensuring `"database"` in `firebase.json` matches `(default)` (or omit `"database"` locally when deploying to standard Firebase projects, and do not commit client-specific `.firebaserc` changes back to the template repo):
     ```bash
     # In a local deployment folder or clean branch:
     # Ensure firebase.json "firestore" block uses: { "rules": "firestore.rules" }
     firebase deploy --only firestore:rules --project <NEW_SCHOOL_PROJECT_ID>
     ```
   - **Option B (Zero CLI edits — Firebase Console UI):**
     1. Open **Firebase Console → Firestore Database → Rules** on the new school's project.
     2. Copy the full contents of `/firestore.rules` from this repository.
     3. Paste into the Firebase Rules editor and click **Publish**.

4. **Verify Rules Published:** Confirm the Rules timestamp updated cleanly with zero syntax warnings.

---

## Step 3: Create a Dedicated Vercel Project from the Same Git Repository

You do **not** need a separate Git repo for every school. Connect the **same GitHub repository** to a new Vercel project per school:

1. Open [Vercel Dashboard](https://vercel.com/) → **Add New… → Project**.
2. Import your template GitHub repository.
3. Configure Build Settings:
   - **Project Name:** e.g. `greenfield-high-school`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Do NOT click Deploy yet** — expand **Environment Variables** first (Step 4).

---

## Step 4: Configure School-Specific Environment Variables in Vercel

In Vercel **Project Settings → Environment Variables** (apply to **Production** and **Preview**), add the client school's Firebase keys from Step 1:

| Variable Name | Value / Notes |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | From school's Firebase Web App config |
| `VITE_FIREBASE_AUTH_DOMAIN` | e.g. `<project-id>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | School's Firebase `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | From school's Firebase Web App config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | From school's Firebase Web App config |
| `VITE_FIREBASE_APP_ID` | From school's Firebase Web App config |
| `VITE_FIREBASE_MEASUREMENT_ID` | Optional (`G-...`) |
| `VITE_FIREBASE_DATABASE_ID` | Set to `(default)` for all standard new Firebase projects |
| `VITE_APP_ENV` | `production` |
| `VITE_FIREBASE_APPCHECK_SITE_KEY` | *(Optional)* reCAPTCHA v3 Site Key if App Check is enforced |

> **Critical Security Reminder:**
> - **NEVER** place SMS gateway secrets (`SMS_API_KEY`, `SMS_API_SECRET`) or private admin tokens inside `VITE_*` variables or Firestore. Those belong strictly in Firebase Cloud Functions Secret Manager when SMS automation is activated.
> - When `VITE_FIREBASE_PROJECT_ID` is set, `src/firebase/config.ts` automatically switches from `firebase-applet-config.json` to the Vercel environment variables and defaults the database ID to `(default)`.

Click **Deploy** in Vercel and wait for the production URL (e.g. `https://greenfield-high.vercel.app`).

---

## Step 5: Configure Firebase Authorized Domains

Google Sign-In popups will be blocked (`auth/unauthorized-domain`) until the Vercel domain is whitelisted:

1. Copy the school's Vercel production domain (and any custom domain, e.g. `www.greenfieldhigh.edu.bd`).
2. Open **Firebase Console → Authentication → Settings → Authorized domains**.
3. Click **Add domain** and add:
   - `<your-school>.vercel.app`
   - `<custom-domain.edu.bd>` (if using a custom domain)

### (Optional) Enable Firebase App Check
1. Create a **reCAPTCHA v3** key pair in Google reCAPTCHA Admin Console for the school's domains.
2. Add the Site Key to Vercel as `VITE_FIREBASE_APPCHECK_SITE_KEY` and redeploy.
3. Register the Secret Key in **Firebase Console → App Check → Apps → Register (reCAPTCHA v3)** and test before turning on Firestore enforcement.

---

## Step 6: First Launch, School Setup & Ownership Lock (`ownershipLocked: true`)

1. Open the newly deployed site: `https://<school-domain>/#admin` (or `/admin`).
2. Click **Sign in with Google** using **your Developer Gmail** (listed in `developerEmails`).
3. Verify the **System Info & Deployment Status** card inside **Users & Audit Logs** confirms:
   - **Config Source:** `Vercel / Vite Env Variables`
   - **Project ID:** matches the new client school's Firebase project ID (NOT the master template project!)
   - **Database ID:** `(default)`
   - **Demo Mode:** `Off (Live Firestore)`
4. Configure the school directly from Admin UI (zero code edits required):
   - **School Identity Tab:**
     - Select **School Level Preset** (`Kindergarten`, `Primary`, or `High School`).
     - Upload official **School Logo** and **Browser Favicon** (auto-compressed client-side).
     - Fill Bengali & English **School Name, Short Name, Slogan, Hero Headline & Subtitle**.
     - Fill **Principal Name, Title & Bani (Message)**.
     - Fill **Address, Upazila, District, Post Code, Hotline, WhatsApp, Email, Social Links & Google Map Coordinates (`lat`/`lng`/URLs)**.
     - Fill **EIIN, MPO Status, School Code, Reg No, and Stats counters**.
     - Configure **Top Announcement Bar** if needed, then click **Save School Identity**.
   - **Appearance Tab:**
     - Pick the school's **Theme Pack** (`Dawn`, `Campus`, `Meadow`, `Ocean`, `Royal`, or `Slate`), **Light/Dark Mode**, **Font Pair**, **Corner Radius**, and **Hero Layout**.
   - **Fees & Payment Tab:**
     - Enter the school's **bKash** and **Nagad** numbers + payment instructions + per-class admission & monthly tuition fees.
   - **Notices Tab:**
     - Publish the current year's **Active Admission Circular** with the exact **Deadline Date** so countdown and auto-close work properly.
5. **Test Public Flows Before Locking Owner:**
   - Submit 1 test admission application on `/apply` → verify it appears in Admin **Applications** and verify its status on `/status` using Application No + Phone. Delete the test record afterward.
   - Submit 1 test visit booking via Campus Visit form → verify it appears in **Visit Inquiries**, then delete the test record.
6. **Lock Ownership to the School Principal (CRITICAL STEP):**
   - Go to **School Identity Tab → Developer Ownership Transfer & Lock**.
   - Enter the Principal's **Google / Gmail address** (verify spelling carefully!).
   - Type `TRANSFER` (or the school's exact name) in the confirmation box.
   - Click **Assign Owner & Lock Ownership**.
   - Confirm:
     - `settings/ownership` now has `ownerEmail: "<principal@gmail.com>"` and `ownershipLocked: true`.
     - `activity_logs` recorded the ownership assignment event.
     - Refresh or sign in later: confirm **Owner Transfer UI is completely hidden** for normal Owners.

---

## Step 7: What to Send the Principal After Handover

Send the following onboarding summary (in Bangla/English) to the Principal after locking ownership:

```text
আসসালামু আলাইকুম / শুভেচ্ছা,
আপনাদের বিদ্যালয়ের ওয়েবসাইট ও অনলাইন ভর্তি পোর্টাল সম্পূর্ণভাবে চালু হয়েছে।

১. ওয়েবসাইট ঠিকানা: https://<school-domain>
২. অনলাইন ভর্তি ফরম: https://<school-domain>/#apply
৩. আবেদন যাচাই (অভিভাবকদের জন্য): https://<school-domain>/#status
৪. অ্যাডমিন ড্যাশবোর্ড: https://<school-domain>/#admin

লগইন ও পরিচালনা নির্দেশিকা:
- অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করতে আপনার নিবন্ধিত Gmail (<principal@gmail.com>) দিয়ে "গুগল দিয়ে প্রবেশ করুন" বাটনে ক্লিক করুন।
- আপনি কোড ছাড়াই বিদ্যালয়ের নাম, লোগো, অধ্যক্ষের বাণী, ঠিকানা, ফোন/WhatsApp, ভর্তি ফি, বিকাশ/নগদ নম্বর, থিম/রঙ, নোটিশ, শিক্ষক তালিকা এবং গ্যালারির ছবি পরিবর্তন করতে পারবেন।
- অফিস সহকারী বা শিক্ষকদের আবেদন/নোটিশ পরিচালনার জন্য "মডারেটর ও লগ" ট্যাব থেকে তাদের Gmail মডারেটর হিসেবে যোগ করতে পারবেন (মডারেটররা ফি, থিম বা স্কুলের মূল পরিচিতি পরিবর্তন করতে পারবেন না)।
- প্রতি সপ্তাহে অন্তত একবার "ভর্তি আবেদনসমূহ" ট্যাব থেকে "CSV ব্যাকআপ ডাউনলোড" করে সংরক্ষণ করার অনুরোধ রইল।
- নিরাপত্তার স্বার্থে ওয়েবসাইটের মূল মালিকানা (Owner License) আপনার Gmail-এ লক করা রয়েছে। ভবিষ্যতে মালিকানা বা মূল Gmail পরিবর্তনের প্রয়োজন হলে আমাদের সাথে যোগাযোগ করুন।
```

---

## Troubleshooting Quick Reference

| Issue | Likely Cause | Fix |
| --- | --- | --- |
| Google Sign-In closes with `auth/unauthorized-domain` | Vercel or custom domain missing from Firebase Auth | Add domain in **Firebase Console → Auth → Settings → Authorized domains** |
| Developer or Principal sees `Access Denied` on `/admin` | Email casing/typo or rules not published | Verify Gmail in `settings/ownership` (lowercase) and publish `firestore.rules` |
| Site still connects to wrong Firebase DB | Missing `VITE_FIREBASE_PROJECT_ID` in Vercel or stale build cache | Check Vercel Env Vars (`VITE_FIREBASE_DATABASE_ID=(default)`), trigger a fresh Vercel **Redeploy** |
| Owner tries to edit `ownerEmail` / transfer ownership | Intentional commercial security lock | Working as designed (`settings/ownership` is Developer-only). Sign in as Developer if a legitimate reassignment is needed |
| Red sticky banner says `Demo mode — data is NOT saved` | Browser has `localStorage.school_demo_mode === 'true'` | Clear site storage or set `localStorage.removeItem('school_demo_mode')` and reload |
