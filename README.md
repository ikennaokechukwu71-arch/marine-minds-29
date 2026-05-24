# 🌊 Marine Minds 29

> **The official class platform for Marine Minds 29, Department of Aquaculture & Fisheries Management.**
> Premium, community-driven, and built to make your class legendary.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏠 **Dashboard** | Stats, leaderboard, quote of the day, marine facts, birthdays, announcements |
| 🌊 **Crew Directory** | Searchable student profiles with bios, quotes, socials, and likes |
| 🌑 **Anonymous Wall** | Confessions, compliments, secrets, funny posts — with reactions |
| 🗳️ **Class Polls** | Anonymous polls with animated live vote bars |
| 📸 **Memory Gallery** | Masonry photo gallery with upload, categories, and lightbox |
| 📅 **Events** | Upcoming class events with dates and categories |
| 🛡️ **Admin Panel** | Moderation queue, announcements, event management |
| 🔐 **Auth** | Email signup/login with Supabase Auth and session management |

---

## 🚀 Quick Start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/marine-minds-29.git
cd marine-minds-29
npm install
```

### 2. Create a Supabase project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Name it `marine-minds-29`
4. Choose a region close to Nigeria (e.g. `eu-west-1`)
5. Set a strong database password and save it

### 3. Set up the database

1. In Supabase, go to **SQL Editor → New Query**
2. Paste the entire contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run** (top right)
4. All tables, RLS policies, triggers, and storage buckets will be created

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get these from: **Supabase → Project Settings → API**

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🌊

---

## 👑 Making Yourself Admin

After signing up:

1. Go to **Supabase → Authentication → Users** and copy your User UUID
2. Go to **SQL Editor** and run:

```sql
UPDATE students SET is_admin = TRUE WHERE user_id = 'YOUR-USER-UUID-HERE';
```

You'll now see the **Admin** link in the navigation.

---

## 🗄️ Database Structure

```
students              — Class profiles linked to auth users
anonymous_messages    — Wall posts (approved by admins before public)
reactions             — Per-user per-message reactions (like/laugh/fire)
polls                 — Class polls created by admins
poll_options          — Options for each poll
poll_votes            — One vote per user per poll
gallery_uploads       — Class photos (approved before public)
announcements         — Admin-posted announcements
events                — Upcoming class events
profile_likes         — Users liking each other's profiles
```

### Row Level Security Summary

| Table | Read | Write |
|---|---|---|
| `students` | Everyone (active only) | Own row only |
| `anonymous_messages` | Approved only | Any authenticated user |
| `reactions` | Authenticated | Own reactions |
| `polls` | Authenticated | Admins only |
| `poll_votes` | Own votes | Own vote (1 per poll) |
| `gallery_uploads` | Approved only | Own uploads |
| `announcements` | Everyone | Admins only |
| `events` | Everyone | Admins only |

---

## ☁️ Deploy to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts, then add environment variables in the Vercel dashboard.

### Option B — GitHub + Vercel (recommended)

1. Push your code to a GitHub repository
2. Go to [https://vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables (same as `.env.local`)
5. Click **Deploy**

### Environment Variables in Vercel

Go to your Vercel project → **Settings → Environment Variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL         ← set to your Vercel URL (e.g. https://marine-minds-29.vercel.app)
```

### Set Supabase Auth Redirect URL

In Supabase → **Authentication → URL Configuration**:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth/callback`

---

## 📱 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Backend/DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Deployment | Vercel |
| Fonts | Syne + DM Sans (Google Fonts) |

---

## 🛡️ Admin Guide

### Moderating Posts
1. Sign in as an admin
2. Go to `/dashboard/admin`
3. Click **Messages** tab — approve or reject pending posts
4. Approved posts appear live on the Anonymous Wall

### Posting Announcements
1. Admin panel → **Overview** tab
2. Fill in title and content
3. Toggle "Pin announcement" if important
4. Click **Post Announcement**

### Adding Events
1. Admin panel → **Overview** tab
2. Fill in event details and date
3. Click **Add Event** — it appears immediately in the Events page

### Approving Gallery Photos
1. Admin panel → **Gallery** tab
2. Review submitted photos
3. Approve or delete

---

## 🎨 Customization

### Change Class Name / Department
Edit `src/app/layout.tsx` → update `metadata.title` and `metadata.description`
Edit `src/app/page.tsx` → update hero text
Edit `src/components/layout/DashboardNav.tsx` → update logo text

### Color Palette
Edit `tailwind.config.ts` → `theme.extend.colors` → change `ocean`, `cyan`, `aqua` values

### Add a New Page
1. Create `src/app/dashboard/YOUR_PAGE/page.tsx`
2. Add to `NAV_ITEMS` in `src/components/layout/DashboardNav.tsx`
3. Build the page component

### Restrict Signup to Class Emails
In `src/app/auth/signup/page.tsx`, add validation:
```typescript
const domain = process.env.ALLOWED_EMAIL_DOMAIN
if (domain && !form.email.endsWith(`@${domain}`)) {
  toast.error(`Only @${domain} emails are allowed.`)
  return
}
```

---

## 🐛 Troubleshooting

**"relation does not exist" error** — Run the SQL schema in Supabase SQL Editor first.

**Auth redirect not working** — Make sure `NEXT_PUBLIC_APP_URL` matches your actual URL and is added to Supabase's allowed redirect URLs.

**Images not loading** — Check that your Supabase project URL is added to `next.config.js` under `images.remotePatterns`.

**Polls not counting votes** — The `increment_poll_vote` RPC function must exist. Re-run the SQL schema.

**Admin panel not appearing** — Run `UPDATE students SET is_admin = TRUE WHERE user_id = 'YOUR-UUID';` in Supabase SQL Editor.

---

## 📄 License

Built with love for Marine Minds 29. For class use only. 🌊

---

*One ocean. One crew. One legacy.*
