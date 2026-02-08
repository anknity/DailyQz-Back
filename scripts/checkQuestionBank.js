require('dotenv').config();
const { supabaseAdmin } = require('./src/config/supabase');

async function checkQuestionBank() {
  console.log('Checking question bank...\n');
  
  const { data, error } = await supabaseAdmin
    .from('question_bank')
    .select('category, subject, difficulty, is_approved')
    .eq('is_approved', true);
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  const categories = [...new Set(data?.map(q => q.category).filter(Boolean) || [])];
  const subjects = [...new Set(data?.map(q => q.subject).filter(Boolean) || [])];
  
  console.log('📊 Question Bank Statistics:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total approved questions: ${data?.length || 0}`);
  console.log(`\nCategories (${categories.length}):`);
  categories.forEach(c => console.log(`  - ${c}`));
  console.log(`\nSubjects (${subjects.length}):`);
  subjects.forEach(s => console.log(`  - ${s}`));
  
  // Count by category
  console.log('\n📈 By Category:');
  const byCat = {};
  data?.forEach(q => {
    byCat[q.category] = (byCat[q.category] || 0) + 1;
  });
  Object.entries(byCat).sort((a,b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} questions`);
  });
  
  // Check if school categories exist
  console.log('\n🏫 School/College categories check:');
  const schoolCats = ['class-9-10', 'class-11-12', 'school', 'college'];
  schoolCats.forEach(cat => {
    const count = data?.filter(q => q.category === cat).length || 0;
    console.log(`  ${cat}: ${count} questions`);
  });
  
  process.exit(0);
}

checkQuestionBank();
