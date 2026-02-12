# Setup Guide

This guide will help you set up AIXONTRA for development.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm**
- A **Supabase** account (free tier is fine for development)
- A code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/dukens11-create/aixontra.git
cd aixontra
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run `supabase/schema.sql`
4. Run `supabase/migrations/001_enhanced_schema.sql`

### 5. Create Storage Buckets

Create these public buckets in Supabase Storage:
- `tracks` - For audio files
- `covers` - For track cover images
- `avatars` - For user avatars

### 6. Set Admin Role

After signing up, update your user role:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your_user_id';
```

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

For detailed setup instructions, see the full documentation.
