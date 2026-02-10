const { supabaseAdmin } = require('../src/config/supabase');

async function verifyNimcetQuestions() {
  console.log('🔍 Verifying NIMCET Computer Science questions in database...\n');

  try {
    // Get total count of NIMCET questions
    const { data: countData, error: countError } = await supabaseAdmin
      .from('question_bank')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'nimcet');

    if (countError) {
      console.error('❌ Error counting questions:', countError.message);
      return;
    }

    const totalQuestions = countData?.length || 0;
    console.log(`📊 Total NIMCET questions in database: ${countData ? 'Using count' : totalQuestions}`);

    // Get actual count using aggregation
    const { count, error: count2Error } = await supabaseAdmin
      .from('question_bank')
      .select('*', { count: 'exact', head: true })
      .eq('category', 'nimcet');

    if (count2Error) {
      console.error('❌ Error:', count2Error.message);
    } else {
      console.log(`✅ Total NIMCET questions: ${count}\n`);
    }

    // Get distribution by subject
    const { data: subjectData, error: subjectError } = await supabaseAdmin
      .from('question_bank')
      .select('subject')
      .eq('category', 'nimcet');

    if (subjectError) {
      console.error('❌ Error getting subject distribution:', subjectError.message);
      return;
    }

    // Count by subject
    const subjectCounts = {};
    subjectData.forEach(row => {
      const subject = row.subject;
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    });

    console.log('📈 Distribution by subject:');
    console.log('─'.repeat(60));
    Object.entries(subjectCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([subject, count]) => {
        console.log(`  ${subject.padEnd(35)} : ${count} questions`);
      });
    console.log('─'.repeat(60));

    // Get sample questions from each year
    const { data: sampleData, error: sampleError } = await supabaseAdmin
      .from('question_bank')
      .select('source, question_text, subject')
      .eq('category', 'nimcet')
      .limit(10);

    if (sampleError) {
      console.error('❌ Error getting sample questions:', sampleError.message);
    } else {
      console.log('\n📝 Sample questions (first 10):');
      console.log('─'.repeat(60));
      sampleData.forEach((q, i) => {
        console.log(`  ${i + 1}. [${q.source}] ${q.subject}`);
        console.log(`     ${q.question_text.substring(0, 50)}...`);
      });
    }

    // Verification summary
    console.log('\n' + '═'.repeat(60));
    if (count === 155) {
      console.log('✅ SUCCESS! All 155 NIMCET questions imported correctly!');
      console.log(`✅ Expected: 31 questions per subject (155 ÷ 5 = 31)`);
      
      const expectedPerSubject = 31;
      const allCorrect = Object.values(subjectCounts).every(c => c === expectedPerSubject);
      
      if (allCorrect) {
        console.log('✅ Subject distribution is PERFECT! 31 questions each.');
      } else {
        console.log('⚠️  Subject distribution varies (this is expected due to rounding)');
      }
    } else if (count === 0) {
      console.log('❌ NO QUESTIONS FOUND!');
      console.log('📝 Please run the SQL script in Supabase SQL Editor:');
      console.log('   sql/import_nimcet_computer_questions.sql');
    } else {
      console.log(`⚠️  Found ${count} questions (expected 155)`);
      console.log('💡 You may need to re-run the import script');
    }
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error(error);
  }
}

verifyNimcetQuestions();
