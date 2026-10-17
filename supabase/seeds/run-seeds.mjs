#!/usr/bin/env node

/**
 * Seed runner script
 * Executes all seed SQL files in order via Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read credentials from .env
const envPath = join(__dirname, '../.env');
const envContent = readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const [key, ...values] = line.split('=');
      return [key, values.join('=')];
    })
);

const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_PUBLISHABLE_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const seedFiles = [
  '01_trusts_institutes.sql',
  '02_colleges.sql',
  '03_departments.sql',
  '04_courses.sql',
  '05_committees.sql',
  '06_accreditations.sql',
  '07_placement_statistics.sql',
];

async function runSeed(filename) {
  const filePath = join(__dirname, filename);
  const sql = readFileSync(filePath, 'utf-8');

  // Remove comments and split into statements
  const statements = sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`\n📄 Running ${filename}...`);
  console.log(`   Found ${statements.length} SQL statements`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt) continue;

    try {
      const { error } = await supabase.rpc('exec', { sql: stmt + ';' });

      if (error) {
        console.error(`   ❌ Statement ${i + 1} failed:`, error.message);
        throw error;
      }

      process.stdout.write('.');
    } catch (err) {
      console.error(`\n   ❌ Error executing statement ${i + 1}:`, err);
      throw err;
    }
  }

  console.log('\n   ✅ Complete');
}

async function main() {
  console.log('================================');
  console.log('Starting SVIT Database Seeding');
  console.log('================================');
  console.log(`\n📡 Connected to: ${supabaseUrl}`);

  try {
    for (let i = 0; i < seedFiles.length; i++) {
      await runSeed(seedFiles[i]);
    }

    console.log('\n================================');
    console.log('✅ Seeding Complete!');
    console.log('================================');
    console.log('\nSummary:');
    console.log('- Trusts: 1');
    console.log('- Institutes: 1');
    console.log('- Colleges: 4 (SVIT, SVICA, SVION, COA)');
    console.log('- Departments: 21');
    console.log('- Courses: 25');
    console.log('- Committees: 5');
    console.log('- Accreditations: 4');
    console.log('- Placement Records: 18\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
