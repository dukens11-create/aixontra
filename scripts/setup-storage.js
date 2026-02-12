// Node.js script to set up Supabase storage buckets
// Usage: node scripts/setup-storage.js

const { createClient } = require('@supabase/supabase-js');

async function setupStorage() {
  console.log('\n🗄️  AIXONTRA Storage Buckets Setup\n');
  
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
  
  // Define required buckets
  const buckets = [
    {
      name: 'tracks',
      description: 'Audio files for music tracks',
      public: true,
      fileSizeLimit: 52428800, // 50 MB
      allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3']
    },
    {
      name: 'covers',
      description: 'Cover images for music tracks',
      public: true,
      fileSizeLimit: 5242880, // 5 MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },
    {
      name: 'avatars',
      description: 'User profile avatars',
      public: true,
      fileSizeLimit: 2097152, // 2 MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    }
  ];
  
  console.log('⏳ Setting up storage buckets...\n');
  
  let successCount = 0;
  let skipCount = 0;
  
  for (const bucket of buckets) {
    try {
      // Check if bucket already exists
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      const exists = existingBuckets?.some(b => b.name === bucket.name);
      
      if (exists) {
        console.log(`⚠️  Bucket "${bucket.name}" already exists - skipping`);
        skipCount++;
        continue;
      }
      
      // Create bucket
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes
      });
      
      if (error) {
        console.error(`❌ Error creating bucket "${bucket.name}":`, error.message);
      } else {
        console.log(`✅ Created bucket: ${bucket.name}`);
        console.log(`   - Public: ${bucket.public}`);
        console.log(`   - Size limit: ${(bucket.fileSizeLimit / 1024 / 1024).toFixed(0)} MB`);
        console.log(`   - MIME types: ${bucket.allowedMimeTypes.join(', ')}`);
        console.log();
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Unexpected error creating bucket "${bucket.name}":`, error.message);
    }
  }
  
  // Summary
  console.log('\n📊 Summary:');
  console.log(`✅ Created: ${successCount} bucket(s)`);
  console.log(`⚠️  Skipped: ${skipCount} bucket(s) (already exist)`);
  console.log(`❌ Failed: ${buckets.length - successCount - skipCount} bucket(s)`);
  
  if (successCount > 0 || skipCount === buckets.length) {
    console.log('\n🎉 Storage setup complete!\n');
  } else {
    console.log('\n⚠️  Some buckets could not be created. Check the errors above.\n');
    process.exit(1);
  }
}

setupStorage();
