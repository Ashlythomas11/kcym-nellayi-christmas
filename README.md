# KCYM Christmas Prize Coupon – Official Results Website
### St. Mary's Forane Church, Nellayi, Thrissur District, Kerala, India
**Diocese of Irinjalakuda • Kerala Catholic Youth Movement (KCYM)**

---

## 🎄 Project Overview

A production-ready, accessible, mobile-first web portal for **KCYM, St. Mary's Church, Nellayi**. Church patrons and coupon purchasers scan a QR code printed on their physical Christmas prize coupons to:
1. **Explore the Gift Gallery:** View major prizes (Hero Electric Scooter / Gold Sovereign, Samsung 4K TV, Refrigerator, Washing Machine, Home Appliances, and Consolation Hampers).
2. **Watch the Live Countdown:** Real-time countdown to **December 24, 2026 at 11:00 PM IST** (Asia/Kolkata timezone).
3. **Instant Coupon Verification & Search:** Search winning coupon numbers with celebratory confetti and prize claim guidelines.
4. **Official Parish Results Notice:** Printable parish notice board sheet with ecclesiastical sign-offs.
5. **Secure Administrative Backoffice:** Strict role-based management, private results preview, duplicate coupon validation, and explicit two-step publication workflow.

---

## 🌟 Key Architecture & Highlights

- **Bilingual Interface:** English & Malayalam (മലയാളം) with authentic liturgical phrasing and font rendering (*Cinzel*, *Plus Jakarta Sans*, and *Noto Sans Malayalam*).
- **Asia/Kolkata Timezone Precision:** Exact countdown math comparing epoch timestamps, immune to client device local clock drift.
- **Privacy & RLS Security:** Unpublished winning coupons and winner names are **strictly inaccessible** to public visitors, network inspectors, and API consumers until manual administrator publication.
- **Expiry Safety:** Reaching zero on the countdown does **never** reveal winners automatically. It transitions safely to an interim status: *"The draw time has arrived. Official results will be published here once confirmed."*
- **QR Code Studio:** In-app generator for high-resolution 300 DPI QR codes configured with direct lookup deep links (`?coupon=XXXX`) ready for the coupon printing press.
- **WCAG 2.2 AA Accessibility:** Screen reader semantic tags, ARIA live regions, focus rings, high contrast ratios (4.5:1+), and a toggleable reduced-motion mode.
- **Shared Results Storage:** Prize and winner data are stored in Supabase PostgreSQL. Browser storage is used only as a local cache and is not a shared or authoritative database.

---

## 🛠️ Technology Stack

- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS with festive liturgical palette (Emerald Green, Crimson Red, Royal Gold, Ivory)
- **Icons:** Lucide React
- **Animations:** Canvas Confetti (celebratory win animations)
- **QR Generation:** QRCode 300 DPI canvas engine
- **Backend:** PostgreSQL (Supabase) + Row Level Security (RLS)

---

## 🚀 Quick Start (Development)

```bash
# 1. Navigate to project directory
cd kcym-nellayi-christmas

# 2. Install dependencies
npm install

# 3. Configure Supabase in .env.local (see Database Setup below)

# 4. Start local development server
npm run dev

# 5. Or build and test production bundle
npm run build
npm run preview
```

The production preview server runs at:
`http://localhost:4173/`

---

## 🔐 Administrator Access

- Sign-in is handled by Supabase Auth through the `admin-username-login` Edge Function.
- Each administrator must be an existing Supabase Auth user with trusted `app_metadata.role` set to `superadmin` or `organizer`, and a username mapped to that user's email in `public.admin_usernames`.
- No demo password or hardcoded administrator account is provided.

### Admin Capabilities:
- **Draw Status & Timing:** Configure exact draw datetime in IST, publish results with two-step confirmation, or unpublish with an audit reason.
- **Prize Catalog:** Add, edit, reorder, delete prizes, and upload gift photos.
- **Enter Winners:** Enter coupon numbers and winner names with duplicate prevention.
- **Private Results Preview:** Test and preview the exact public results page before going live.
- **QR Code Studio:** Generate print-ready QR codes pointing to the live domain.
- **Audit Trail:** Review timestamps and administrator emails for every change.

---

## 🗄️ Supabase Database Setup & RLS

Supabase is the shared, persistent database. Do not rely on browser storage for cross-device results.

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. In the Supabase Dashboard, open **SQL Editor** and run the complete script in `src/sql/schema.sql`. It creates the draw settings, published-results snapshot, database trigger, public read policies, and administrator-only write policies.
3. In **Project Settings → API**, copy the Project URL and the public `anon` key. This existing login function is designed to use the anon key. It is safe for frontend use with the schema's RLS policies; never use the service-role key or database password in the website.
4. In the project root, create or edit `.env.local` (do not overwrite an existing file) with:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
   ```

   Restart `npm run dev` after changing the file. The credentials form in **Database & Sync** stores credentials in that browser only; deployment environment variables take precedence.
5. Create the administrator in **Authentication → Users** and assign trusted `app_metadata.role` as `superadmin` or `organizer` using Supabase Auth Admin. Add the matching username and account email in SQL Editor:

   ```sql
   INSERT INTO public.admin_usernames (username, email)
   VALUES ('your-admin-username', 'the-existing-auth-user-email@example.com');
   ```

6. Deploy `supabase/functions/admin-username-login` to the same Supabase project. In PowerShell, from the project folder, run:

   ```powershell
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase functions deploy admin-username-login
   ```

   Find `YOUR_PROJECT_REF` in your Supabase project URL (the text before `.supabase.co`). Configure the Edge Function's `SUPABASE_SERVICE_ROLE_KEY` secret in Supabase's Edge Function secrets if it is not already available to the function. The service-role key must never be added to `.env.local` with a `VITE_` prefix, Vercel, browser storage, or frontend code.

The SQL schema preserves the current `prize-1` through `prize-8` IDs. Winner assignments are saved against those IDs in `draw_settings.prizes`; the database trigger updates the sanitized public snapshot when an administrator saves or publishes changes. Unpublished winners remain private.

---

## 📦 Deployment Instructions

### Vercel
1. Push these website code changes to the GitHub repository connected to Vercel, then open the existing project in the Vercel Dashboard and select **Settings → Environment Variables**.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same public values used in `.env.local`. Select Production (and Preview/Development if desired).
3. Save the variables, then redeploy the latest deployment. Vite embeds these public values at build time; setting them alone does not update an already-built deployment.
4. Check the deployed site in a private browser window. The results section should load from Supabase without asking you to enter credentials on that device.

The SQL schema is run in Supabase and does not require a Vercel deployment. Deploy the Edge Function separately to Supabase; Vercel does not host the database or admin login function. Future winner edits and publication are saved directly to Supabase from the admin portal and do not require another GitHub push or Vercel deployment.

### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Configure environment variables in Netlify site settings.

---

## 🧪 Acceptance Tests Verification

To run the automated acceptance test suite:
```bash
node scripts/verify-requirements.js
```
All 5 test suites verify countdown timing, public winner privacy, duplicate coupon prevention, draw-settings fields, and IST formatting.

---

*© 2026 KCYM St. Mary's Church, Nellayi. Dedicated to youth empowerment and parish charity.*
