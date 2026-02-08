/**
 * Update Demo exam with questions from question_bank
 * This fetches real questions from the question_bank table
 */

const { supabaseAdmin } = require('./src/config/supabase');

async function updateDemoExamFromBank() {
  console.log('🔄 Updating Demo exam with questions from question_bank...\n');

  try {
    // Fetch approved questions from question_bank
    const { data: bankQuestions, error: fetchError } = await supabaseAdmin
      .from('question_bank')
      .select('id, question_text, options, correct_answer, difficulty, category, subject')
      .eq('is_approved', true)
      .limit(50);

    if (fetchError) {
      console.error('❌ Error fetching questions:', fetchError);
      return;
    }

    if (!bankQuestions || bankQuestions.length === 0) {
      console.error('❌ No approved questions found in question_bank');
      return;
    }

    console.log(`📚 Found ${bankQuestions.length} questions in question_bank`);

    // Shuffle and select 20 questions
    const shuffled = bankQuestions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(20, shuffled.length));

    // Format questions for storage
    const formattedQuestions = selected.map((q, index) => {
      let options = q.options;
      if (typeof options === 'string') {
        try {
          options = JSON.parse(options);
        } catch (e) {
          options = ['Option A', 'Option B', 'Option C', 'Option D'];
        }
      }

      return {
        id: index + 1,
        bankId: q.id,
        text: q.question_text,
        options: options,
        correctAnswer: q.correct_answer,
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'medium',
        category: q.category,
        subject: q.subject
      };
    });

    // Find Demo exam
    const { data: demoExam, error: findError } = await supabaseAdmin
      .from('scheduled_exams')
      .select('id')
      .eq('title', 'Demo')
      .single();

    if (findError || !demoExam) {
      console.log('📝 Demo exam not found, creating new one...');
      
      const startTime = new Date();
      startTime.setMinutes(startTime.getMinutes() - 5);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 3);

      const { data: newExam, error: createError } = await supabaseAdmin
        .from('scheduled_exams')
        .insert({
          title: 'Demo',
          description: 'Demo exam with questions from question bank',
          category: 'mixed',
          subject: 'Mixed',
          difficulty: 'mixed',
          question_count: formattedQuestions.length,
          duration_minutes: 30,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          is_active: true,
          is_proctored: false,
          passing_score: 60,
          questions: formattedQuestions
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating exam:', createError);
        return;
      }

      console.log('✅ Created new Demo exam');
      console.log(`   ID: ${newExam.id}`);
      console.log(`   Questions: ${formattedQuestions.length}`);
    } else {
      // Update existing exam
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('scheduled_exams')
        .update({
          questions: formattedQuestions,
          question_count: formattedQuestions.length,
          start_time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', demoExam.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating exam:', updateError);
        return;
      }

      console.log('✅ Updated Demo exam');
      console.log(`   ID: ${updated.id}`);
      console.log(`   Questions: ${formattedQuestions.length}`);
    }

    console.log('\n📋 Sample questions:');
    formattedQuestions.slice(0, 3).forEach((q, i) => {
      console.log(`   ${i + 1}. ${q.text.substring(0, 60)}...`);
    });

    console.log('\n🎉 Done! Demo exam now has real questions from the database.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateDemoExamFromBank().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
