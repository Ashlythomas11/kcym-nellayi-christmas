# KCYM Christmas Prize Coupon – Official Results Website
### St. Mary's Forane Church, Nellayi, Thrissur District, Kerala, India
**Diocese of Irinjalakuda • Kerala Catholic Youth Movement (KCYM)**

---

## 🎄 Project Overview

A production-ready, accessible, mobile-first web portal for **KCYM, St. Mary's Church, Nellayi**. Church patrons and coupon purchasers scan a QR code printed on their physical Christmas prize coupons to:
1. **Explore the Gift Gallery:** View major prizes (Hero Electric Scooter / Gold Sovereign, Samsung 4K TV, Refrigerator, Washing Machine, Home Appliances, and Consolation Hampers).
2. **Watch the Live Countdown:** Real-time countdown to **December 25, 2026 at 12:00 AM IST** (Asia/Kolkata timezone).
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
- **Unified Hybrid Storage:** Works out of the box with zero external dependencies (interactive local storage), and connects seamlessly to Supabase PostgreSQL with Row Level Security.

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

# 3. Start local development server
npm run dev

# 4. Or build and test production bundle
npm run build
npm run preview
```

The production preview server runs at:
`http://localhost:4173/`

---

## 🔐 Administrator Access

- Click the **Admin** button in the header/footer, or visit `?admin=true` / `#admin`.
- **Pre-configured Demo Credentials:**
  - **Email:** `admin@kcymnellayi.org`
  - **Password:** `Christmas2026!`
  - *(A "Quick Fill Demo Admin Credentials" button is provided on the sign-in modal for quick review.)*

### Admin Capabilities:
- **Draw Status & Timing:** Configure exact draw datetime in IST, publish results with two-step confirmation, or unpublish with an audit reason.
- **Prize Catalog:** Add, edit, reorder, delete prizes, and upload gift photos.
- **Enter Winners:** Enter coupon numbers and winner names with duplicate prevention.
- **Private Results Preview:** Test and preview the exact public results page before going live.
- **QR Code Studio:** Generate print-ready QR codes pointing to the live domain.
- **Audit Trail:** Review timestamps and administrator emails for every change.

---

## 🗄️ Supabase Database Setup & RLS

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Run the schema script located in `src/sql/schema.sql`.
4. In your project's **Storage**, create a public bucket named `prize-images`.
5. Enter your `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env` or paste them into the **Database & Sync** panel inside the Admin Dashboard.

---

## 📦 Deployment Instructions

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` from the project root.
3. Set Environment Variables in project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Set custom domain (e.g. `coupon.kcymnellayi.org`) and ensure HTTPS is active.

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
All 4 test suites verify countdown timing, public winner privacy, duplicate coupon prevention, and IST formatting.

---

*© 2026 KCYM St. Mary's Church, Nellayi. Dedicated to youth empowerment and parish charity.*
