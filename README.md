# AIXONTRA

**A curated AI-music publishing & streaming platform** - Discover, share, and explore AI-generated music from creators around the world.

![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.49.1-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38bdf8)

## Features

### 🎵 Core Features
- **Track Management** - Upload, edit, and manage AI-generated music tracks
- **Smart Discovery** - Browse tracks by genre, mood, and AI tool
- **Audio Player** - Advanced player with waveform visualization
- **Social Features** - Follow creators, like tracks, and comment on music
- **Playlists** - Create and share custom playlists

### 🔐 Authentication & Security
- Secure authentication via Supabase Auth
- Role-based access control (User, Admin, Moderator)
- Rate limiting on all API endpoints
- XSS protection and input sanitization
- Row-level security (RLS) on all database tables

### 👤 User Features
- User profiles with customizable avatars
- Following system to stay updated with favorite creators
- Listening history tracking
- Personal music library
- Real-time notifications

### 🎨 UI/UX
- Modern, responsive design with dark theme
- Accessible components built with Radix UI
- Smooth animations and transitions
- Mobile-first approach
- Keyboard navigation support

### 🛠️ Admin Features
- Track approval/rejection workflow
- Content moderation dashboard
- User and content reporting system
- Platform analytics
- Tag management

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Audio**: [WaveSurfer.js](https://wavesurfer-js.org/)
- **Data Fetching**: [SWR](https://swr.vercel.app/)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dukens11-create/aixontra.git
   cd aixontra
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL script from `supabase/schema.sql`
   - Then run the migration from `supabase/migrations/001_enhanced_schema.sql`

5. **Create storage buckets**
   
   In your Supabase dashboard, create these public buckets:
   - `tracks` - For audio files
   - `covers` - For track cover images
   - `avatars` - For user avatars

6. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Account Setup

After deploying AIXONTRA, you need to create the first admin account.

### Method 1: Web Interface (Easiest)

1. Visit: `https://your-app.onrender.com/setup` (or `http://localhost:3000/setup` in development)
2. Enter admin email and password
3. Click "Create Admin Account"
4. Done! Log in with those credentials

**Note:** This page only works once (when no admin exists). After the first admin is created, the page will be disabled for security.

### Method 2: Command Line

1. Clone the repository
2. Install dependencies: `npm install`
3. Set environment variables in `.env.local`
4. Run: `npm run create-admin`
5. Follow the prompts

### Method 3: Manual SQL (Advanced)

1. Sign up on the website
2. Go to Supabase Dashboard → SQL Editor
3. Run:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
);
```

### Default Admin Credentials

For security, there are NO default credentials. You must create your own admin account using one of the methods above.

## Project Structure

```
aixontra/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/               # API routes
│   │   ├── admin/             # Admin pages
│   │   ├── track/             # Track detail pages
│   │   ├── upload/            # Upload page
│   │   └── ...
│   ├── components/            # React components
│   │   ├── ui/               # UI component library
│   │   ├── AudioPlayer.tsx
│   │   ├── Nav.tsx
│   │   └── ...
│   ├── lib/                   # Utilities and helpers
│   │   ├── supabase/         # Supabase clients
│   │   ├── validators.ts     # Zod schemas
│   │   ├── utils.ts          # Helper functions
│   │   └── ...
│   ├── stores/                # Zustand state stores
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript type definitions
├── supabase/
│   ├── schema.sql            # Base database schema
│   └── migrations/           # Database migrations
├── public/                    # Static assets
└── ...config files
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests (when configured)
npm run create-admin # Create admin account (requires .env.local)
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the maintainers.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

Made with ❤️ by the AIXONTRA team

