const { supabaseAdmin } = require('../src/config/supabase');

async function checkHistoricalQuestions() {
  console.log('🔍 Checking for historical NIMCET questions (2008-2022)...\n');

  try {
    // Check for questions with NIMCET year sources
    const { data, error } = await supabaseAdmin
      .from('question_bank')
      .select('source, question_text, subject')
      .eq('category', 'nimcet')
      .like('source', 'NIMCET%');

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log(`📊 Total historical NIMCET questions (2008-2022): ${data.length}\n`);

    if (data.length === 0) {
      console.log('❌ NO HISTORICAL QUESTIONS FOUND!');
      console.log('\n📝 To import the 155 historical questions:');
      console.log('   1. Open Supabase Dashboard → SQL Editor');
      console.log('   2. Copy the content from: sql/import_nimcet_computer_questions.sql');
      console.log('   3. Paste and click "Run"');
      console.log('   4. Expected result: 155 questions imported');
    } else {
      // Count by year
      const yearCounts = {};
      data.forEach(q => {
        const match = q.source.match(/NIMCET (\d{4})/);
        if (match) {
          const year = match[1];
          yearCounts[year] = (yearCounts[year] || 0) + 1;
        }
      });

      console.log('📈 Distribution by year:');
      console.log('─'.repeat(40));
      Object.entries(yearCounts)
        .sort()
        .forEach(([year, count]) => {
          console.log(`  ${year}: ${count} questions`);
        });
      console.log('─'.repeat(40));

      console.log('\n✅ Historical questions found!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkHistoricalQuestions();
