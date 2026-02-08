const { supabaseAdmin } = require('./src/config/supabase');

/**
 * Test Supabase Connection
 * Run this to verify your Supabase setup is working
 */

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  try {
    // Test 1: Check if Supabase is configured
    console.log('📌 Test 1: Configuration Check');
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('Supabase credentials not found in environment variables');
    }
    console.log('✅ Environment variables configured\n');

    // Test 2: Test database connection
    console.log('📌 Test 2: Database Connection');
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    console.log('✅ Connected to Supabase successfully\n');

    // Test 3: Check if tables exist
    console.log('📌 Test 3: Verifying Tables');
    const tables = [
      'users',
      'user_stats',
      'exams',
      'exam_questions',
      'exam_results',
      'question_bank',
      'dsa_problems',
      'dsa_submissions',
      'proctoring_logs',
      'leaderboard_entries'
    ];

    for (const table of tables) {
      const { error } = await supabaseAdmin
        .from(table)
        .select('count')
        .limit(1);
      
      if (error && error.code !== 'PGRST116') {
        console.log(`❌ Table '${table}' not found or not accessible`);
        throw error;
      }
      console.log(`✅ Table '${table}' exists`);
    }
    console.log('\n');

    // Test 4: Test write operation
    console.log('📌 Test 4: Write Operation');
    const testQuestion = {
      question_text: 'Test question - can be deleted',
      options: JSON.stringify(['A', 'B', 'C', 'D']),
      correct_answer: 0,
      subject: 'Test',
      category: 'test',
      difficulty: 'easy',
      source: 'connection_test',
      is_approved: false
    };

    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from('question_bank')
      .insert(testQuestion)
      .select()
      .single();

    if (insertError) throw insertError;
    console.log('✅ Write operation successful');
    console.log(`   Inserted test question with ID: ${insertedData.id}\n`);

    // Test 5: Test read operation
    console.log('📌 Test 5: Read Operation');
    const { data: readData, error: readError } = await supabaseAdmin
      .from('question_bank')
      .select('*')
      .eq('id', insertedData.id)
      .single();

    if (readError) throw readError;
    console.log('✅ Read operation successful');
    console.log(`   Retrieved question: "${readData.question_text}"\n`);

    // Test 6: Test update operation
    console.log('📌 Test 6: Update Operation');
    const { error: updateError } = await supabaseAdmin
      .from('question_bank')
      .update({ question_text: 'Updated test question' })
      .eq('id', insertedData.id);

    if (updateError) throw updateError;
    console.log('✅ Update operation successful\n');

    // Test 7: Test delete operation
    console.log('📌 Test 7: Delete Operation');
    const { error: deleteError } = await supabaseAdmin
      .from('question_bank')
      .delete()
      .eq('id', insertedData.id);

    if (deleteError) throw deleteError;
    console.log('✅ Delete operation successful');
    console.log('   Test question cleaned up\n');

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('🎉 All Tests Passed!');
    console.log('═══════════════════════════════════════');
    console.log('\nYour Supabase integration is working perfectly!');
    console.log('\nNext steps:');
    console.log('1. Run sample data seeder: node seedSupabase.js');
    console.log('2. Start your server: npm start');
    console.log('3. Test API endpoints using the guides\n');

    return true;
  } catch (error) {
    console.error('\n❌ Test Failed!');
    console.error('═══════════════════════════════════════');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your .env file has correct Supabase credentials');
    console.error('2. Verify you ran the supabase_schema.sql in Supabase SQL Editor');
    console.error('3. Check your internet connection');
    console.error('4. Verify your Supabase project is active\n');
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  testConnection()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { testConnection };
