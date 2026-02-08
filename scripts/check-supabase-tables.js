// Quick script to check existing Supabase tables
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  try {
    console.log('📊 Checking existing Supabase tables...\n');
    
    // Try to query each expected table
    const tables = [
      'users', 'user_stats', 'exams', 'exam_questions', 'exam_results',
      'question_bank', 'dsa_problems', 'dsa_submissions', 'user_solved_problems',
      'leaderboard_entries', 'proctoring_logs', 'daily_challenges',
      'user_daily_progress', 'school_exams', 'scheduled_exams',
      'scheduled_exam_registrations', 'notifications', 'achievements',
      'user_achievements'
    ];
    
    const existingTables = [];
    const missingTables = [];
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (error) {
          if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
            missingTables.push(table);
          } else {
            existingTables.push(table);
          }
        } else {
          existingTables.push(table);
        }
      } catch (e) {
        missingTables.push(table);
      }
    }
    
    console.log('✅ EXISTING TABLES (' + existingTables.length + '/19):');
    existingTables.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
    
    if (missingTables.length > 0) {
      console.log('\n❌ MISSING TABLES (' + missingTables.length + '/19):');
      missingTables.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
      
      console.log('\n📝 NEXT STEPS:');
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('   URL: https://hoenjcisdmwncfowhleu.supabase.co');
      console.log('2. Create a new query');
      console.log('3. Copy the SQL from: DailyQz-Backend/supabase_schema.sql');
      console.log('4. Run the query to create missing tables');
      console.log('\nOR you can run specific CREATE TABLE statements for missing tables only.');
    } else {
      console.log('\n🎉 All 19 tables exist in your Supabase database!');
    }
    
    console.log('\n' + '='.repeat(60));
    
  } catch (err) {
    console.error('Error checking tables:', err.message);
  }
}

listTables();
