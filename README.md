# Aixontra

## Quick Start

[Existing quick start instructions here]

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