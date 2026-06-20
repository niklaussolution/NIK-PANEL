# NIK Hosting — Setup Guide

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Copy `.env.local` and fill in your real credentials:

```env
# Firebase (Client SDK)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Server-side — use your service account JSON)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

### 3. Firebase Setup
1. Go to https://console.firebase.google.com
2. Create a project and enable **Firestore** and **Authentication**
3. Enable **Email/Password** and **Google** sign-in providers
4. Get your web app config for the client SDK variables
5. Generate a **service account key** (Project Settings → Service Accounts) for admin variables

#### Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /vps/{doc} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /orders/{doc} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /tickets/{doc} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /payments/{doc} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 4. Razorpay Setup
1. Create account at https://razorpay.com
2. Get Test API keys from Dashboard → Settings → API Keys
3. Add to `.env.local`

### 5. Create Admin User
After registering your account, update the user document in Firestore:
- Go to Firestore → `users` collection → your user document
- Change `role` field from `"user"` to `"admin"`
- Access admin panel at `/admin`

### 6. Run Development Server
```bash
npm run dev
```
Open http://localhost:3000

### 7. Production Build
```bash
npm run build
npm start
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                   # Home
│   ├── plans/page.tsx             # VPS Plans
│   ├── features/page.tsx          # Features
│   ├── about/page.tsx             # About
│   ├── contact/page.tsx           # Contact
│   ├── login/page.tsx             # Login
│   ├── register/page.tsx          # Register
│   ├── checkout/page.tsx          # Checkout + Razorpay
│   ├── dashboard/                 # Customer Dashboard
│   │   ├── page.tsx               # Overview
│   │   ├── vps/page.tsx           # My VPS list
│   │   ├── vps/[id]/page.tsx      # VPS detail + controls
│   │   ├── billing/page.tsx       # Orders & payments
│   │   ├── support/page.tsx       # Ticket system
│   │   └── settings/page.tsx      # Profile & password
│   ├── admin/                     # Admin Panel
│   │   ├── page.tsx               # Admin overview
│   │   ├── users/page.tsx         # User management
│   │   ├── orders/page.tsx        # Order management
│   │   ├── vps/page.tsx           # VPS management
│   │   ├── plans/page.tsx         # Plan overview
│   │   └── tickets/page.tsx       # Support tickets
│   └── api/
│       ├── create-order/route.ts  # Razorpay order creation
│       └── verify-payment/route.ts # Payment verification
├── components/
│   ├── layout/        Navbar, Footer
│   ├── home/          Hero, Features, Stats, PlansPreview, CTA
│   ├── plans/         PlanCard
│   ├── dashboard/     Sidebar
│   ├── admin/         AdminSidebar
│   ├── animations/    FadeIn, SlideUp
│   └── ui/            Button, Input, Badge, Textarea, LoadingSpinner
├── context/
│   └── AuthContext.tsx            # Firebase Auth provider
├── lib/
│   ├── firebase.ts                # Client SDK
│   ├── firebaseAdmin.ts           # Server SDK (lazy init)
│   └── plans.ts                   # VPS plan definitions
└── types/
    └── index.ts                   # TypeScript interfaces
```

## Customization

### Change VPS Plans
Edit `src/lib/plans.ts` — update prices, specs, or add new plans.

### Change Theme Colors
Edit `tailwind.config.ts` — primary orange `#FF6B00`, blue `#0066FF`.

### Payment Currency
Currently set to INR (₹). Change `currency: "INR"` in `create-order/route.ts`.
