# Takamul

Static site (Vercel) with a Supabase backend for blog posts + photo/video uploads.
Styled to match https://takamul.company.

## Pages
- `index.html` — About Us
- `events.html` — Events
- `muathren.html` — Muathren
- `admin.html` — private admin panel (login, create posts, upload media, delete)

Each public page shows its own blog feed. `styles.css` holds all styling.

## How it works
- **Supabase Storage** stores the photo/video files.
- **Supabase Postgres** (`posts` table) stores blog posts and the media link.
- **Supabase Auth** protects the admin panel — public can only read.
- The browser talks to Supabase directly, so the site stays 100% static.

## One-time setup

### 1. Create a Supabase project
Go to https://supabase.com → New project.

### 2. Create the database + storage
Supabase Dashboard → **SQL Editor** → New query → paste all of `schema.sql` → Run.
This creates the `posts` table, the `media` storage bucket, and the security rules.

### 3. Create your admin user
Dashboard → **Authentication → Users → Add user** → set an email + password.
(That email/password is what you'll use to log in at `admin.html`.)

### 4. Connect the site
Dashboard → **Project Settings → API**. Copy:
- **Project URL**
- **anon / public key**  (safe to expose in frontend — Row Level Security protects data)

Paste both into `config.js`.

### 5. Test
Open `admin.html`, log in, create a post with a photo or video — it appears on the
matching page. (Open via a local server, e.g. `npx serve`, not a raw file:// path,
because the pages use ES modules.)

## Deploy to Vercel
No build step — plain static files.
1. Push this folder to a GitHub repo.
2. vercel.com → New Project → import repo → framework preset **Other** → Deploy.

## Notes
- Large videos upload straight from the browser to Supabase Storage (no serverless
  size limit to worry about).
- Free Supabase tier has storage/bandwidth caps — check pricing before hosting large videos.
