const {
  supabaseQuestionService,
  supabaseExamService
} = require('./src/services/supabaseServices');

/**
 * Sample Data Seeder for Supabase
 * Use this to populate your database with test data
 */

const sampleQuestions = {
  mathematics: [
    {
      questionText: "What is the value of π (pi) approximately?",
      options: ["3.14", "2.71", "1.41", "1.73"],
      correctAnswer: 0,
      difficulty: "easy"
    },
    {
      questionText: "If x² + 5x + 6 = 0, what are the roots?",
      options: ["-2, -3", "2, 3", "-2, 3", "2, -3"],
      correctAnswer: 0,
      difficulty: "medium"
    },
    {
      questionText: "What is the derivative of x³?",
      options: ["3x²", "x²", "3x", "x³"],
      correctAnswer: 0,
      difficulty: "medium"
    },
    {
      questionText: "What is the integral of 2x dx?",
      options: ["x² + C", "2x + C", "x²", "2x²"],
      correctAnswer: 0,
      difficulty: "medium"
    },
    {
      questionText: "Which of these is a prime number?",
      options: ["15", "17", "21", "25"],
      correctAnswer: 1,
      difficulty: "easy"
    }
  ],
  physics: [
    {
      questionText: "What is the SI unit of force?",
      options: ["Joule", "Newton", "Watt", "Pascal"],
      correctAnswer: 1,
      difficulty: "easy"
    },
    {
      questionText: "What is the speed of light in vacuum?",
      options: ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10⁹ m/s", "3 × 10⁷ m/s"],
      correctAnswer: 0,
      difficulty: "easy"
    },
    {
      questionText: "According to Newton's second law, F = ?",
      options: ["ma", "mv", "m/a", "a/m"],
      correctAnswer: 0,
      difficulty: "medium"
    },
    {
      questionText: "What is the unit of electric current?",
      options: ["Volt", "Ampere", "Ohm", "Coulomb"],
      correctAnswer: 1,
      difficulty: "easy"
    },
    {
      questionText: "Energy can neither be created nor destroyed. This is the law of?",
      options: ["Conservation of Energy", "Conservation of Mass", "Conservation of Momentum", "Thermodynamics"],
      correctAnswer: 0,
      difficulty: "easy"
    }
  ],
  chemistry: [
    {
      questionText: "What is the atomic number of Carbon?",
      options: ["6", "8", "12", "14"],
      correctAnswer: 0,
      difficulty: "easy"
    },
    {
      questionText: "What is the chemical formula of water?",
      options: ["H2O", "CO2", "O2", "H2O2"],
      correctAnswer: 0,
      difficulty: "easy"
    },
    {
      questionText: "Which gas is most abundant in Earth's atmosphere?",
      options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
      correctAnswer: 2,
      difficulty: "easy"
    },
    {
      questionText: "What is the pH of pure water?",
      options: ["7", "0", "14", "5"],
      correctAnswer: 0,
      difficulty: "easy"
    },
    {
      questionText: "Which element has the symbol 'Au'?",
      options: ["Silver", "Gold", "Aluminum", "Argon"],
      correctAnswer: 1,
      difficulty: "easy"
    }
  ],
  generalKnowledge: [
    {
      questionText: "Who is the current Prime Minister of India?",
      options: ["Narendra Modi", "Rahul Gandhi", "Amit Shah", "Manmohan Singh"],
      correctAnswer: 0,
      difficulty: "easy"
    },
    {
      questionText: "What is the capital of India?",
      options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
      correctAnswer: 1,
      difficulty: "easy"
    },
    {
      questionText: "Which river is known as the 'Ganga of the South'?",
      options: ["Godavari", "Krishna", "Kaveri", "Narmada"],
      correctAnswer: 0,
      difficulty: "medium"
    },
    {
      questionText: "Who wrote the Indian National Anthem?",
      options: ["Rabindranath Tagore", "Bankim Chandra Chatterjee", "Mahatma Gandhi", "Jawaharlal Nehru"],
      correctAnswer: 0,
      difficulty: "easy"
    },
    {
      questionText: "Which is the largest state in India by area?",
      options: ["Maharashtra", "Rajasthan", "Madhya Pradesh", "Uttar Pradesh"],
      correctAnswer: 1,
      difficulty: "easy"
    }
  ],
  computerScience: [
    {
      questionText: "What does CPU stand for?",
      options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Computer Processing Unit"],
      correctAnswer: 0,
      difficulty: "easy"
    },
    {
      questionText: "Which data structure uses LIFO?",
      options: ["Queue", "Stack", "Array", "Tree"],
      correctAnswer: 1,
      difficulty: "easy"
    },
    {
      questionText: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correctAnswer: 1,
      difficulty: "medium"
    },
    {
      questionText: "Which programming language is known as the 'mother of all languages'?",
      options: ["C", "Java", "Python", "Assembly"],
      correctAnswer: 0,
      difficulty: "easy"
    },
    {
      questionText: "What does HTML stand for?",
      options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"],
      correctAnswer: 0,
      difficulty: "easy"
    }
  ]
};

async function seedQuestions() {
  try {
    console.log('🌱 Starting to seed questions...\n');

    // Seed Mathematics questions
    console.log('📚 Adding Mathematics questions...');
    const mathQuestions = await supabaseQuestionService.bulkAddToQuestionBank(
      sampleQuestions.mathematics,
      {
        subject: 'Mathematics',
        category: 'competitive',
        source: 'sample_data',
        isApproved: true
      }
    );
    console.log(`✅ Added ${mathQuestions.length} Mathematics questions\n`);

    // Seed Physics questions
    console.log('🔬 Adding Physics questions...');
    const physicsQuestions = await supabaseQuestionService.bulkAddToQuestionBank(
      sampleQuestions.physics,
      {
        subject: 'Physics',
        category: 'competitive',
        source: 'sample_data',
        isApproved: true
      }
    );
    console.log(`✅ Added ${physicsQuestions.length} Physics questions\n`);

    // Seed Chemistry questions
    console.log('⚗️  Adding Chemistry questions...');
    const chemQuestions = await supabaseQuestionService.bulkAddToQuestionBank(
      sampleQuestions.chemistry,
      {
        subject: 'Chemistry',
        category: 'competitive',
        source: 'sample_data',
        isApproved: true
      }
    );
    console.log(`✅ Added ${chemQuestions.length} Chemistry questions\n`);

    // Seed General Knowledge questions
    console.log('🌍 Adding General Knowledge questions...');
    const gkQuestions = await supabaseQuestionService.bulkAddToQuestionBank(
      sampleQuestions.generalKnowledge,
      {
        subject: 'General Knowledge',
        category: 'government',
        source: 'sample_data',
        isApproved: true
      }
    );
    console.log(`✅ Added ${gkQuestions.length} General Knowledge questions\n`);

    // Seed Computer Science questions
    console.log('💻 Adding Computer Science questions...');
    const csQuestions = await supabaseQuestionService.bulkAddToQuestionBank(
      sampleQuestions.computerScience,
      {
        subject: 'Computer Science',
        category: 'competitive',
        source: 'sample_data',
        isApproved: true
      }
    );
    console.log(`✅ Added ${csQuestions.length} Computer Science questions\n`);

    // Get statistics
    const stats = await supabaseQuestionService.getQuestionStats();
    console.log('📊 Question Bank Statistics:');
    console.log(`   Total Questions: ${stats.total}`);
    console.log(`   Approved: ${stats.approved}`);
    console.log(`   Pending: ${stats.pending}`);
    console.log('\n   By Subject:');
    Object.entries(stats.bySubject).forEach(([subject, count]) => {
      console.log(`   - ${subject}: ${count}`);
    });
    console.log('\n   By Difficulty:');
    console.log(`   - Easy: ${stats.byDifficulty.easy}`);
    console.log(`   - Medium: ${stats.byDifficulty.medium}`);
    console.log(`   - Hard: ${stats.byDifficulty.hard}`);

    console.log('\n✨ Sample data seeded successfully!\n');

    // Create a sample exam
    console.log('📝 Creating sample exam...');
    const exam = await supabaseExamService.createExam({
      title: 'Sample Mixed Test',
      description: 'A sample test with questions from multiple subjects',
      category: 'competitive',
      subject: 'Mixed',
      difficulty: 'medium',
      questionCount: 0,
      durationMinutes: 30,
      passingScore: 60,
      isActive: true
    });

    // Get 10 random questions and add to exam
    const examQuestions = await supabaseQuestionService.getRandomQuestions({
      count: 10,
      onlyApproved: true
    });

    await supabaseExamService.addQuestionsToExam(exam.id, examQuestions);
    console.log(`✅ Created sample exam with ID: ${exam.id}`);
    console.log(`   Title: ${exam.title}`);
    console.log(`   Questions: ${examQuestions.length}\n`);

    console.log('🎉 All done! Your database is ready to use.\n');
    console.log('Next steps:');
    console.log('1. Start your backend server: npm start');
    console.log('2. Test endpoints: GET http://localhost:5000/api/v2/questions');
    console.log('3. View exams: GET http://localhost:5000/api/v2/exams\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    console.error(error);
  }
}

// Run if called directly
if (require.main === module) {
  seedQuestions()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { seedQuestions, sampleQuestions };
