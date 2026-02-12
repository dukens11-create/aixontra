# AIXENTRA (MVP)

A curated AI-music publishing & streaming platform (AI Music Gallery).

## Quick start

1) Install deps
```bash
npm install
```

2) Create `.env.local` in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

3) In Supabase:
- Create buckets: `tracks` (public), `covers` (public)
- Run the SQL in `supabase/schema.sql`
- Set your user as admin in `profiles.role = 'admin'`

4) Run:
```bash
npm run dev
```

Open http://localhost:3000

## Notes
- Uploads are **pending** until approved in Admin Review.
- This is an MVP; add CDN, waveform, search, and moderation later.
