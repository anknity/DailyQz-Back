const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

const { createClient } = require('@supabase/supabase-js')

// Supabase configuration from .env
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file')
  console.log('Current values:')
  console.log('  SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing')
  console.log('  SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Found' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// School questions for Class 9-10
const schoolQuestions = [
  // Mathematics - Class 9-10
  {
    question: 'What is the value of √144?',
    options: ['10', '11', '12', '14'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'Mathematics',
    difficulty: 'easy',
    explanation: '√144 = 12 because 12 × 12 = 144'
  },
  {
    question: 'If x + 5 = 12, what is the value of x?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'Mathematics',
    difficulty: 'easy',
    explanation: 'x + 5 = 12, so x = 12 - 5 = 7'
  },
  {
    question: 'What is the area of a rectangle with length 8 cm and width 5 cm?',
    options: ['13 cm²', '26 cm²', '40 cm²', '45 cm²'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'Mathematics',
    difficulty: 'easy',
    explanation: 'Area of rectangle = length × width = 8 × 5 = 40 cm²'
  },
  {
    question: 'What is 15% of 200?',
    options: ['20', '25', '30', '35'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'Mathematics',
    difficulty: 'easy',
    explanation: '15% of 200 = (15/100) × 200 = 30'
  },
  {
    question: 'The sum of angles in a triangle is:',
    options: ['90°', '180°', '270°', '360°'],
    correctAnswer: 1,
    category: 'class-9-10',
    subject: 'Mathematics',
    difficulty: 'easy',
    explanation: 'The sum of all interior angles of a triangle is always 180°'
  },
  {
    question: 'If 3x - 7 = 14, then x equals:',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'Mathematics',
    difficulty: 'medium',
    explanation: '3x - 7 = 14 → 3x = 21 → x = 7'
  },
  {
    question: 'What is the value of 2³ + 3²?',
    options: ['13', '15', '17', '19'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'Mathematics',
    difficulty: 'medium',
    explanation: '2³ = 8 and 3² = 9, so 8 + 9 = 17'
  },
  {
    question: 'The HCF of 24 and 36 is:',
    options: ['6', '8', '12', '18'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'Mathematics',
    difficulty: 'medium',
    explanation: 'Factors of 24: 1,2,3,4,6,8,12,24. Factors of 36: 1,2,3,4,6,9,12,18,36. HCF = 12'
  },
  {
    question: 'What is the circumference of a circle with radius 7 cm? (Take π = 22/7)',
    options: ['22 cm', '44 cm', '154 cm', '38.5 cm'],
    correctAnswer: 1,
    category: 'class-9-10',
    subject: 'Mathematics',
    difficulty: 'medium',
    explanation: 'Circumference = 2πr = 2 × (22/7) × 7 = 44 cm'
  },
  {
    question: 'Simplify: (a + b)² - (a - b)²',
    options: ['2ab', '4ab', '2a² + 2b²', '4a² + 4b²'],
    correctAnswer: 1,
    category: 'class-9-10',
    subject: 'Mathematics',
    difficulty: 'hard',
    explanation: '(a+b)² = a²+2ab+b², (a-b)² = a²-2ab+b². Difference = 4ab'
  },
  
  // Science - Class 9-10
  {
    question: 'What is the chemical formula of water?',
    options: ['H2O', 'CO2', 'NaCl', 'H2SO4'],
    correctAnswer: 0,
    category: 'class-9-10',
    subject: 'Science',
    difficulty: 'easy',
    explanation: 'Water is composed of 2 hydrogen atoms and 1 oxygen atom, hence H2O'
  },
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Jupiter', 'Mars', 'Saturn'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'Science',
    difficulty: 'easy',
    explanation: 'Mars appears reddish due to iron oxide (rust) on its surface'
  },
  {
    question: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'Science',
    difficulty: 'easy',
    explanation: 'Mitochondria produce ATP through cellular respiration, providing energy to the cell'
  },
  {
    question: 'Which gas do plants absorb during photosynthesis?',
    options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'Science',
    difficulty: 'easy',
    explanation: 'Plants absorb CO2 and release O2 during photosynthesis'
  },
  {
    question: 'What is the SI unit of force?',
    options: ['Joule', 'Newton', 'Watt', 'Pascal'],
    correctAnswer: 1,
    category: 'class-9-10',
    subject: 'Science',
    difficulty: 'easy',
    explanation: 'Force is measured in Newtons (N) in the SI system'
  },
  {
    question: 'The atomic number of an element is equal to:',
    options: ['Number of neutrons', 'Number of protons', 'Mass number', 'Number of electrons in outer shell'],
    correctAnswer: 1,
    category: 'class-9-10',
    subject: 'Science',
    difficulty: 'medium',
    explanation: 'Atomic number equals the number of protons in the nucleus'
  },
  {
    question: 'What is the speed of light in vacuum?',
    options: ['3 × 10⁸ m/s', '3 × 10⁶ m/s', '3 × 10⁴ m/s', '3 × 10¹⁰ m/s'],
    correctAnswer: 0,
    category: 'class-9-10',
    subject: 'Science',
    difficulty: 'medium',
    explanation: 'The speed of light in vacuum is approximately 3 × 10⁸ meters per second'
  },
  {
    question: 'Which of the following is an example of a chemical change?',
    options: ['Melting of ice', 'Boiling of water', 'Rusting of iron', 'Dissolving salt in water'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'Science',
    difficulty: 'medium',
    explanation: 'Rusting involves a chemical reaction (oxidation) forming new substance (iron oxide)'
  },
  {
    question: 'What is the function of white blood cells?',
    options: ['Carry oxygen', 'Fight infections', 'Blood clotting', 'Transport nutrients'],
    correctAnswer: 1,
    category: 'class-9-10',
    subject: 'Science',
    difficulty: 'medium',
    explanation: 'WBCs are part of the immune system and help fight infections and diseases'
  },
  {
    question: 'The process by which water changes from liquid to gas is called:',
    options: ['Condensation', 'Evaporation', 'Precipitation', 'Sublimation'],
    correctAnswer: 1,
    category: 'class-9-10',
    subject: 'Science',
    difficulty: 'easy',
    explanation: 'Evaporation is the process of liquid water turning into water vapor'
  },
  
  // English - Class 9-10
  {
    question: 'What is the plural of "child"?',
    options: ['Childs', 'Childrens', 'Children', 'Childes'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'English',
    difficulty: 'easy',
    explanation: 'Child has an irregular plural form: children'
  },
  {
    question: 'Choose the correct form: She ___ to school every day.',
    options: ['go', 'goes', 'going', 'gone'],
    correctAnswer: 1,
    category: 'class-9-10',
    subject: 'English',
    difficulty: 'easy',
    explanation: 'With third person singular (she), we use "goes" in simple present tense'
  },
  {
    question: 'What is the past tense of "write"?',
    options: ['Writed', 'Written', 'Wrote', 'Writing'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'English',
    difficulty: 'easy',
    explanation: 'Write is an irregular verb. Past tense: wrote, Past participle: written'
  },
  {
    question: 'Identify the adjective in: "The beautiful garden has many flowers."',
    options: ['garden', 'beautiful', 'many', 'flowers'],
    correctAnswer: 1,
    category: 'class-9-10',
    subject: 'English',
    difficulty: 'easy',
    explanation: '"Beautiful" describes the noun "garden", making it an adjective'
  },
  {
    question: 'What is the antonym of "ancient"?',
    options: ['Old', 'Historic', 'Modern', 'Classic'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'English',
    difficulty: 'easy',
    explanation: 'Ancient means very old, so the opposite (antonym) is modern'
  },
  {
    question: 'Choose the correct sentence:',
    options: ['Me and him went to the store.', 'Him and I went to the store.', 'He and I went to the store.', 'I and he went to the store.'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'English',
    difficulty: 'medium',
    explanation: 'Use subject pronouns (he, I) as subjects. "He and I" is the correct form'
  },
  {
    question: 'What is a synonym for "happy"?',
    options: ['Sad', 'Angry', 'Joyful', 'Tired'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'English',
    difficulty: 'easy',
    explanation: 'Joyful and happy have similar meanings, making them synonyms'
  },
  {
    question: 'Identify the type of sentence: "What a beautiful day!"',
    options: ['Declarative', 'Interrogative', 'Imperative', 'Exclamatory'],
    correctAnswer: 3,
    category: 'class-9-10',
    subject: 'English',
    difficulty: 'medium',
    explanation: 'Sentences ending with "!" that express strong emotions are exclamatory'
  },
  {
    question: 'What is the correct spelling?',
    options: ['Accomodate', 'Accommodate', 'Acommodate', 'Acomodate'],
    correctAnswer: 1,
    category: 'class-9-10',
    subject: 'English',
    difficulty: 'medium',
    explanation: 'Accommodate has double "c" and double "m"'
  },
  {
    question: 'Choose the correct preposition: "The cat jumped ___ the table."',
    options: ['in', 'at', 'onto', 'into'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'English',
    difficulty: 'medium',
    explanation: '"Onto" indicates movement to a surface (the top of the table)'
  },
  
  // Social Studies - Class 9-10
  {
    question: 'Who was the first President of India?',
    options: ['Jawaharlal Nehru', 'Dr. Rajendra Prasad', 'Sardar Patel', 'B.R. Ambedkar'],
    correctAnswer: 1,
    category: 'class-9-10',
    subject: 'Social Studies',
    difficulty: 'easy',
    explanation: 'Dr. Rajendra Prasad served as the first President of India from 1950 to 1962'
  },
  {
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Rome'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'Social Studies',
    difficulty: 'easy',
    explanation: 'Paris is the capital and largest city of France'
  },
  {
    question: 'The French Revolution began in which year?',
    options: ['1776', '1789', '1799', '1815'],
    correctAnswer: 1,
    category: 'class-9-10',
    subject: 'Social Studies',
    difficulty: 'medium',
    explanation: 'The French Revolution began in 1789 with the storming of the Bastille'
  },
  {
    question: 'Which is the longest river in the world?',
    options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
    correctAnswer: 1,
    category: 'class-9-10',
    subject: 'Social Studies',
    difficulty: 'easy',
    explanation: 'The Nile River is approximately 6,650 km long, making it the longest river'
  },
  {
    question: 'The Constitution of India came into effect on:',
    options: ['26 January 1947', '15 August 1947', '26 January 1950', '15 August 1950'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'Social Studies',
    difficulty: 'easy',
    explanation: 'The Indian Constitution came into effect on 26 January 1950 (Republic Day)'
  },
  
  // More Mathematics
  {
    question: 'What is the LCM of 12 and 18?',
    options: ['6', '36', '72', '108'],
    correctAnswer: 1,
    category: 'class-9-10',
    subject: 'Mathematics',
    difficulty: 'medium',
    explanation: '12 = 2² × 3, 18 = 2 × 3². LCM = 2² × 3² = 36'
  },
  {
    question: 'If sin θ = 3/5, what is cos θ?',
    options: ['3/5', '4/5', '5/4', '5/3'],
    correctAnswer: 1,
    category: 'class-9-10',
    subject: 'Mathematics',
    difficulty: 'hard',
    explanation: 'Using sin²θ + cos²θ = 1: (3/5)² + cos²θ = 1, cos²θ = 16/25, cosθ = 4/5'
  },
  {
    question: 'The volume of a cube with side 5 cm is:',
    options: ['25 cm³', '75 cm³', '100 cm³', '125 cm³'],
    correctAnswer: 3,
    category: 'class-9-10',
    subject: 'Mathematics',
    difficulty: 'medium',
    explanation: 'Volume of cube = side³ = 5³ = 125 cm³'
  },
  {
    question: 'What is the quadratic formula solution for x² - 5x + 6 = 0?',
    options: ['x = 2 or x = 3', 'x = -2 or x = -3', 'x = 1 or x = 6', 'x = -1 or x = -6'],
    correctAnswer: 0,
    category: 'class-9-10',
    subject: 'Mathematics',
    difficulty: 'hard',
    explanation: 'Factoring: (x-2)(x-3) = 0, so x = 2 or x = 3'
  },
  {
    question: 'What is the slope of the line passing through points (2, 3) and (4, 7)?',
    options: ['1', '2', '3', '4'],
    correctAnswer: 1,
    category: 'class-9-10',
    subject: 'Mathematics',
    difficulty: 'medium',
    explanation: 'Slope = (y2-y1)/(x2-x1) = (7-3)/(4-2) = 4/2 = 2'
  },
  
  // More Science
  {
    question: 'Which vitamin is produced by our skin in sunlight?',
    options: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'],
    correctAnswer: 3,
    category: 'class-9-10',
    subject: 'Science',
    difficulty: 'easy',
    explanation: 'UV rays from sunlight help our skin produce Vitamin D'
  },
  {
    question: 'What is the pH of pure water?',
    options: ['0', '7', '14', '1'],
    correctAnswer: 1,
    category: 'class-9-10',
    subject: 'Science',
    difficulty: 'medium',
    explanation: 'Pure water is neutral with a pH of 7'
  },
  {
    question: 'Which organ in the human body produces bile?',
    options: ['Stomach', 'Pancreas', 'Liver', 'Kidney'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'Science',
    difficulty: 'medium',
    explanation: 'The liver produces bile which helps in digestion of fats'
  },
  {
    question: 'What type of mirror is used in car headlights?',
    options: ['Plane mirror', 'Convex mirror', 'Concave mirror', 'Both A and B'],
    correctAnswer: 2,
    category: 'class-9-10',
    subject: 'Science',
    difficulty: 'medium',
    explanation: 'Concave mirrors are used in headlights to focus light into a parallel beam'
  },
  {
    question: 'The process of conversion of sugar into alcohol is called:',
    options: ['Oxidation', 'Fermentation', 'Distillation', 'Combustion'],
    correctAnswer: 1,
    category: 'class-9-10',
    subject: 'Science',
    difficulty: 'medium',
    explanation: 'Fermentation is the anaerobic process where yeast converts sugar to alcohol'
  }
]

async function addSchoolQuestions() {
  console.log('📚 Adding School Questions to Database...\n')
  
  // Format questions for database with correct column names
  const formattedQuestions = schoolQuestions.map(q => ({
    question_text: q.question,
    options: JSON.stringify(q.options),  // Options stored as JSON string
    correct_answer: q.correctAnswer,
    category: q.category,
    subject: q.subject,
    difficulty: q.difficulty,
    is_approved: true,
    source: 'direct_feed',
    created_at: new Date().toISOString()
  }))
  
  // Insert in batches
  const batchSize = 20
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < formattedQuestions.length; i += batchSize) {
    const batch = formattedQuestions.slice(i, i + batchSize)
    
    const { data, error } = await supabase
      .from('question_bank')
      .insert(batch)
      .select()
    
    if (error) {
      console.error(`❌ Error inserting batch ${i/batchSize + 1}:`, error.message)
      errorCount += batch.length
    } else {
      console.log(`✅ Inserted batch ${i/batchSize + 1}: ${data.length} questions`)
      successCount += data.length
    }
  }
  
  console.log('\n📊 Summary:')
  console.log(`✅ Successfully added: ${successCount} questions`)
  console.log(`❌ Errors: ${errorCount} questions`)
  
  // Verify the insertion
  const { data: countData, error: countError } = await supabase
    .from('question_bank')
    .select('category, subject', { count: 'exact' })
    .eq('category', 'class-9-10')
    .eq('is_approved', true)
  
  if (!countError) {
    console.log(`\n🏫 Total class-9-10 questions now: ${countData.length}`)
    
    // Group by subject
    const subjectCounts = {}
    countData.forEach(q => {
      subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1
    })
    
    console.log('\nBy Subject:')
    Object.entries(subjectCounts).forEach(([subject, count]) => {
      console.log(`  ${subject}: ${count}`)
    })
  }
}

addSchoolQuestions().catch(console.error)
