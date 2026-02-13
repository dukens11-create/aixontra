# Aixontra

AIXONTRA is a curated AI music gallery where creators can share exceptional AI-generated music. The platform features moderation, user profiles, and an AI-powered song creation tool.

## Features

- 🎵 **Curated Music Gallery**: Browse and discover AI-generated music
- ✨ **Create Song Feature**: Generate songs with AI-powered lyrics and music (NEW!)
- 📤 **Track Upload**: Upload your AI-generated tracks for review
- 👥 **User Profiles**: Creator pages with tracks and stats
- 🎯 **Admin Review System**: Content moderation before publication
- ❤️ **Like & Play Tracking**: Engagement metrics for tracks
- 🔐 **Secure Authentication**: User accounts with role-based access

## Quick Start

[Existing quick start instructions here]

## Create Song Feature (NEW!)

The Create Song feature allows logged-in users to generate AI-powered songs with lyrics and music. Features include:

- **AI Lyrics Generation**: Using OpenAI GPT models
- **Music Generation**: Support for Suno, Stable Audio, and Riffusion
- **Demo Mode**: Works without API keys using sample data
- **Multi-step Process**: Generate lyrics → Generate music → Publish

For detailed setup and usage instructions, see [docs/CREATE_SONG_FEATURE.md](docs/CREATE_SONG_FEATURE.md)

### Quick Setup

1. Add API keys to `.env` (optional - works in demo mode without keys):
   ```env
   OPENAI_API_KEY=sk-your-key-here  # For lyrics generation
   SUNO_API_KEY=your-key-here       # For music generation (optional)
   ```

2. Run database migration:
   ```bash
   # Execute supabase/migrations/002_add_create_song_fields.sql in Supabase
   ```

3. Access the feature at `/create` (login required)

## Admin Account Setup

AIXONTRA provides multiple methods to create your first admin account securely. **Important:** For security reasons, admin creation is only allowed when no admin account exists yet.

### Method 1: Web Interface (Recommended)

The easiest method is to use the web-based setup page:

1. Start your application:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/setup`

3. Fill in the form with your desired admin credentials:
   - Email address
   - Password (minimum 8 characters)

4. Click "Create Admin Account"

5. Once successful, you can log in with your new admin credentials

**Note:** The `/setup` page will automatically disable itself after the first admin account is created for security reasons.

### Method 2: CLI Script

For command-line or automation scenarios, use the CLI script:

1. Make sure your environment variables are set:
   ```bash
   # Copy .env.example to .env and fill in your Supabase credentials
   cp .env.example .env
   ```

2. Ensure the following variables are configured in your `.env` file:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (required for admin operations)

3. Run the admin creation script:
   ```bash
   npm run create-admin
   ```
   
   **Note:** The password will be visible when you type it. Make sure you're in a secure environment.

4. Follow the interactive prompts:
   - Enter admin email
   - Enter admin password (min 8 characters)

5. The script will confirm successful creation

**Example:**
```bash
$ npm run create-admin

🔐 AIXONTRA Admin Account Setup

Enter admin email: admin@example.com
Enter admin password (min 8 characters): ********

⏳ Creating admin account...

✅ User created: abc123-uuid-here
✅ Admin role set successfully!

🎉 Admin account created successfully!

📧 Email: admin@example.com
🔑 Role: admin

✅ You can now log in with these credentials.
```

### Security Notes

- **No Default Credentials:** There are no default admin credentials for security reasons
- **One-Time Setup:** Admin creation is only allowed when no admin exists yet
- **Strong Passwords:** Use passwords with at least 8 characters (longer and more complex is better)
- **Service Role Key:** Keep your `SUPABASE_SERVICE_ROLE_KEY` secure and never commit it to version control
- **Environment Variables:** Always use `.env` files for local development and environment variables in production

### Troubleshooting

**Error: "Supabase environment variables not found!"**
- Make sure you've created a `.env` file with the required variables
- Check that your `.env` file is in the project root directory
- Verify that the variable names match exactly: `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

**Error: "Admin account already exists"**
- An admin account has already been created
- Contact the existing admin to create additional admin accounts
- If you've lost access, you'll need to manually update the database

**Error: "Password must be at least 8 characters"**
- Use a longer password
- Consider using a password manager for strong, unique passwords