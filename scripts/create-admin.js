// Node.js script to create admin account via Supabase API
// Usage: node scripts/create-admin.js

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  console.log('\n🔐 AIXONTRA Admin Account Setup\n');
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: Supabase environment variables not found!');
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
    process.exit(1);
  }
  
  // Create admin client
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  // Get email and password
  const email = await question('Enter admin email: ');
  const password = await question('Enter admin password (min 8 characters): ');
  
  if (password.length < 8) {
    console.error('❌ Password must be at least 8 characters');
    rl.close();
    process.exit(1);
  }
  
  console.log('\n⏳ Creating admin account...\n');
  
  try {
    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });
    
    if (authError) {
      console.error('❌ Error creating user:', authError.message);
      rl.close();
      process.exit(1);
    }
    
    const userId = authData.user.id;
    console.log('✅ User created:', userId);
    
    // Update profile role to admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId);
    
    if (updateError) {
      console.error('❌ Error setting admin role:', updateError.message);
      rl.close();
      process.exit(1);
    }
    
    console.log('✅ Admin role set successfully!');
    
    // Verify
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single();
    
    console.log('\n🎉 Admin account created successfully!\n');
    console.log('📧 Email:', email);
    console.log('🔑 Role:', profile?.role);
    console.log('\n✅ You can now log in with these credentials.\n');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
  
  rl.close();
}

createAdmin();
