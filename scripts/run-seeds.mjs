#!/usr/bin/env node

/**
 * Seed runner script
 * Executes all seed SQL files in order by directly inserting via Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_PUBLISHABLE_KEY) in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const seedFiles = [
  '../supabase/seeds/01_trusts_institutes.sql',
  '../supabase/seeds/02_colleges.sql',
  '../supabase/seeds/03_departments.sql',
  '../supabase/seeds/04_courses.sql',
  '../supabase/seeds/05_committees.sql',
  '../supabase/seeds/06_accreditations.sql',
  '../supabase/seeds/07_placement_statistics.sql',
];

async function runSeedFile(filepath, index) {
  const filename = filepath.split('/').pop();
  console.log(`\n[${index + 1}/${seedFiles.length}] 📄 ${filename}`);

  const fullPath = join(__dirname, filepath);
  const sql = readFileSync(fullPath, 'utf-8');

  console.log('   Executing SQL...');

  // Since we can't execute raw SQL via REST API, we'll need to use psql or direct DB connection
  // For now, let's inform the user to run manually
  console.log('   ⚠️  Please run this SQL manually in Supabase SQL Editor');

  return true;
}

async function main() {
  console.log('================================');
  console.log('SVIT Database Seeding');
  console.log('================================');
  console.log(`\n📡 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Using key: ${supabaseKey.substring(0, 20)}...`);

  console.log('\n⚠️  Note: Supabase REST API does not support raw SQL execution.');
  console.log('Please run the seed files manually:');
  console.log('\n1. Go to: https://supabase.com/dashboard/project/agezrfclusigfqysbxwb/sql/new');
  console.log('2. Copy and paste each seed file content (in order)');
  console.log('3. Execute each one\n');

  console.log('Seed files to run in order:');
  seedFiles.forEach((file, i) => {
    console.log(`   ${i + 1}. ${file.split('/').pop()}`);
  });

  console.log('\n📖 Or use: npx supabase db execute --file <seed-file.sql>');
  console.log('   (Requires Supabase CLI and linked project)\n');
}

main();
