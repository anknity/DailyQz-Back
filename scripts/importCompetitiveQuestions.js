/**
 * Competitive Exam Questions Import Script
 * Run this script to process PDF files and add questions to Supabase
 * 
 * Usage: node scripts/importCompetitiveQuestions.js [pdfPath] [category] [subject]
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { 
  processPDFAndExtractQuestions, 
  generateCompetitiveExamQuestions,
  CATEGORY_PROMPTS 
} = require('../src/services/groqService');
const supabaseQuestionService = require('../src/services/supabaseQuestionService');

// Sample competitive exam question data (for immediate import without PDFs)
const sampleCompetitiveQuestions = {
  'tcs': {
    'aptitude': [
      {
        text: "A train 150 meters long passes a pole in 15 seconds. What is the speed of the train in km/hr?",
        options: ["36 km/hr", "40 km/hr", "45 km/hr", "30 km/hr"],
        correctAnswer: 0,
        difficulty: "medium",
        explanation: "Speed = Distance/Time = 150/15 = 10 m/s = 36 km/hr"
      },
      {
        text: "If the ratio of ages of A and B is 4:3 and the sum of their ages is 28, what is the age of A?",
        options: ["16 years", "12 years", "14 years", "18 years"],
        correctAnswer: 0,
        difficulty: "easy",
        explanation: "Let ages be 4x and 3x. 4x + 3x = 28, x = 4. Age of A = 16"
      },
      {
        text: "A person covers a distance in 40 minutes if he runs at a speed of 45 km/hr. What distance will he cover in the same time if he runs at 60 km/hr?",
        options: ["30 km", "35 km", "40 km", "45 km"],
        correctAnswer: 2,
        difficulty: "medium",
        explanation: "Distance at 45 km/hr in 40 min = 45 * (40/60) = 30 km. At 60 km/hr = 60 * (40/60) = 40 km"
      }
    ],
    'reasoning': [
      {
        text: "In a certain code, COMPUTER is written as RFUVQNPC. How is MEDICINE written in that code?",
        options: ["MFEJDJOF", "EIKICINF", "FDICIOEN", "NFEJEJOD"],
        correctAnswer: 1,
        difficulty: "hard",
        explanation: "Each letter is replaced by the letter at +2, -2 alternating positions"
      },
      {
        text: "If A + B means A is the mother of B, A × B means A is the father of B, A - B means A is the sister of B. Which of the following means C is the daughter of D?",
        options: ["D × C - E", "D + C - E", "D × C + E", "D - C + E"],
        correctAnswer: 0,
        difficulty: "medium",
        explanation: "D × C means D is father of C, C - E means C is sister of E. So C is daughter of D"
      }
    ]
  },
  'infosys': {
    'aptitude': [
      {
        text: "A shopkeeper sold an article for Rs. 2400 and made a profit of 25%. Find the cost price of the article.",
        options: ["Rs. 1920", "Rs. 2000", "Rs. 1800", "Rs. 2100"],
        correctAnswer: 0,
        difficulty: "easy",
        explanation: "CP = SP / (1 + Profit%) = 2400 / 1.25 = Rs. 1920"
      },
      {
        text: "The average of 5 consecutive odd numbers is 31. Find the largest number.",
        options: ["35", "33", "37", "39"],
        correctAnswer: 0,
        difficulty: "medium",
        explanation: "Consecutive odd numbers: n, n+2, n+4, n+6, n+8. Average = n+4 = 31. Largest = 35"
      }
    ],
    'puzzle': [
      {
        text: "Five persons P, Q, R, S, T are sitting in a row facing north. S is between P and T. R is to the immediate right of T. Q is to the immediate left of P. Who is in the middle?",
        options: ["P", "S", "T", "R"],
        correctAnswer: 1,
        difficulty: "medium",
        explanation: "Arrangement: Q-P-S-T-R. S is in the middle"
      }
    ]
  },
  'wipro': {
    'aptitude': [
      {
        text: "Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both pipes are opened together, how long will it take to fill the tank?",
        options: ["12 minutes", "10 minutes", "15 minutes", "18 minutes"],
        correctAnswer: 0,
        difficulty: "medium",
        explanation: "Combined rate = 1/20 + 1/30 = 5/60 = 1/12. Time = 12 minutes"
      },
      {
        text: "Find the compound interest on Rs. 10,000 at 10% per annum for 2 years.",
        options: ["Rs. 2,100", "Rs. 2,000", "Rs. 1,900", "Rs. 2,200"],
        correctAnswer: 0,
        difficulty: "medium",
        explanation: "CI = P(1+r/100)^n - P = 10000(1.1)^2 - 10000 = 12100 - 10000 = Rs. 2100"
      }
    ],
    'verbal': [
      {
        text: "Choose the word most similar in meaning to 'ENDEAVOR':",
        options: ["Attempt", "Failure", "Success", "Ignore"],
        correctAnswer: 0,
        difficulty: "easy",
        explanation: "Endeavor means to try hard to do or achieve something - similar to 'Attempt'"
      }
    ]
  },
  'tech-mahindra': {
    'aptitude': [
      {
        text: "If 6 men can complete a work in 18 days, how many men are required to complete the same work in 9 days?",
        options: ["12 men", "9 men", "15 men", "18 men"],
        correctAnswer: 0,
        difficulty: "easy",
        explanation: "Men × Days = Constant. 6 × 18 = M × 9. M = 12 men"
      }
    ],
    'technical': [
      {
        text: "Which data structure uses LIFO principle?",
        options: ["Stack", "Queue", "Array", "Linked List"],
        correctAnswer: 0,
        difficulty: "easy",
        explanation: "Stack follows Last In First Out (LIFO) principle"
      },
      {
        text: "What is the time complexity of binary search?",
        options: ["O(log n)", "O(n)", "O(n²)", "O(1)"],
        correctAnswer: 0,
        difficulty: "easy",
        explanation: "Binary search divides the search space in half each time, giving O(log n)"
      }
    ]
  },
  'bihar-police': {
    'gk': [
      {
        text: "बिहार का राजकीय पक्षी कौन सा है?",
        options: ["गौरैया", "कोयल", "मोर", "कबूतर"],
        correctAnswer: 0,
        difficulty: "easy",
        explanation: "बिहार का राजकीय पक्षी गौरैया है"
      },
      {
        text: "बिहार की राजधानी कहाँ है?",
        options: ["पटना", "गया", "मुजफ्फरपुर", "भागलपुर"],
        correctAnswer: 0,
        difficulty: "easy",
        explanation: "बिहार की राजधानी पटना है"
      },
      {
        text: "चंद्रगुप्त मौर्य के गुरु कौन थे?",
        options: ["चाणक्य", "वात्स्यायन", "पतंजलि", "कौटिल्य"],
        correctAnswer: 0,
        difficulty: "medium",
        explanation: "चंद्रगुप्त मौर्य के गुरु चाणक्य थे (कौटिल्य भी उनका नाम है)"
      }
    ],
    'reasoning': [
      {
        text: "यदि DELHI को 73541 लिखा जाता है, तो INDIA को कैसे लिखा जाएगा?",
        options: ["46754", "46745", "47654", "45674"],
        correctAnswer: 0,
        difficulty: "medium",
        explanation: "D=7, E=3, L=5, H=4, I=1. I=4, N=6, D=7, I=4, A=5. INDIA = 46754"
      }
    ],
    'hindi': [
      {
        text: "'अनुराग' का विलोम शब्द क्या है?",
        options: ["विराग", "प्रेम", "स्नेह", "मोह"],
        correctAnswer: 0,
        difficulty: "easy",
        explanation: "अनुराग का विलोम विराग है"
      }
    ]
  },
  'ssc': {
    'gk': [
      {
        text: "भारत का सबसे बड़ा राज्य (क्षेत्रफल में) कौन सा है?",
        options: ["राजस्थान", "मध्य प्रदेश", "महाराष्ट्र", "उत्तर प्रदेश"],
        correctAnswer: 0,
        difficulty: "easy",
        explanation: "राजस्थान भारत का सबसे बड़ा राज्य है (क्षेत्रफल: 3,42,239 वर्ग किमी)"
      },
      {
        text: "भारतीय संविधान में कितने मौलिक अधिकार हैं?",
        options: ["6", "7", "8", "9"],
        correctAnswer: 0,
        difficulty: "medium",
        explanation: "संविधान में 6 मौलिक अधिकार हैं (मूल रूप से 7 थे, संपत्ति का अधिकार 1978 में हटाया गया)"
      }
    ],
    'quantitative': [
      {
        text: "यदि x + 1/x = 5 है, तो x² + 1/x² का मान क्या होगा?",
        options: ["23", "25", "21", "27"],
        correctAnswer: 0,
        difficulty: "medium",
        explanation: "(x + 1/x)² = x² + 1/x² + 2. So x² + 1/x² = 25 - 2 = 23"
      }
    ],
    'english': [
      {
        text: "Choose the correctly spelled word:",
        options: ["Accommodate", "Accomodate", "Acommodate", "Acomodate"],
        correctAnswer: 0,
        difficulty: "medium",
        explanation: "The correct spelling is 'Accommodate' with double 'c' and double 'm'"
      }
    ]
  },
  'banking': {
    'gk': [
      {
        text: "भारतीय रिजर्व बैंक की स्थापना किस वर्ष हुई थी?",
        options: ["1935", "1947", "1950", "1969"],
        correctAnswer: 0,
        difficulty: "easy",
        explanation: "RBI की स्थापना 1 अप्रैल 1935 को हुई थी"
      },
      {
        text: "NEFT का पूर्ण रूप क्या है?",
        options: ["National Electronic Fund Transfer", "New Electronic Fund Transfer", "National Electronic Finance Transfer", "National E-Fund Transfer"],
        correctAnswer: 0,
        difficulty: "easy",
        explanation: "NEFT = National Electronic Fund Transfer"
      }
    ],
    'reasoning': [
      {
        text: "एक पंक्ति में, A, B के दाएं 5वें स्थान पर है और B, C के बाएं 3वें स्थान पर है। यदि C, D के दाएं 2वें स्थान पर है, तो A, D से कितनी दूर है?",
        options: ["10 स्थान दाएं", "8 स्थान दाएं", "10 स्थान बाएं", "8 स्थान बाएं"],
        correctAnswer: 0,
        difficulty: "hard",
        explanation: "D...C(+2)...B(+3)...A(+5). Total: A is 10 places to the right of D"
      }
    ]
  }
};

/**
 * Import sample questions to Supabase
 */
async function importSampleQuestions() {
  console.log('📥 Starting sample questions import...\n');
  
  let totalImported = 0;
  const results = [];

  for (const [category, subjects] of Object.entries(sampleCompetitiveQuestions)) {
    console.log(`\n📁 Processing category: ${category.toUpperCase()}`);
    
    for (const [subject, questions] of Object.entries(subjects)) {
      try {
        const formattedQuestions = questions.map(q => ({
          questionText: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          subject: subject,
          category: category,
          difficulty: q.difficulty,
          source: 'sample_import',
          isApproved: true // Pre-approved sample questions
        }));

        const stored = await supabaseQuestionService.bulkAddToQuestionBank(formattedQuestions);
        
        console.log(`   ✅ ${subject}: ${stored.length} questions imported`);
        totalImported += stored.length;
        
        results.push({
          category,
          subject,
          count: stored.length,
          success: true
        });
      } catch (error) {
        console.error(`   ❌ ${subject}: Failed - ${error.message}`);
        results.push({
          category,
          subject,
          count: 0,
          success: false,
          error: error.message
        });
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 Import Summary`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Total Questions Imported: ${totalImported}`);
  console.log(`Categories Processed: ${Object.keys(sampleCompetitiveQuestions).length}`);
  
  return results;
}

/**
 * Process a PDF file and import questions
 */
async function importFromPDF(pdfPath, category, subject = 'general') {
  console.log(`\n📄 Processing PDF: ${pdfPath}`);
  console.log(`   Category: ${category}`);
  console.log(`   Subject: ${subject}\n`);

  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ PDF file not found: ${pdfPath}`);
    return null;
  }

  try {
    const questions = await processPDFAndExtractQuestions(pdfPath, category, subject);
    
    if (questions.length === 0) {
      console.log('⚠️  No questions extracted from PDF');
      return null;
    }

    const formattedQuestions = questions.map(q => ({
      questionText: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      subject: q.subject,
      category: q.category,
      difficulty: q.difficulty,
      source: 'pdf_import',
      sourceFile: path.basename(pdfPath),
      isApproved: false
    }));

    const stored = await supabaseQuestionService.bulkAddToQuestionBank(formattedQuestions);
    
    console.log(`\n✅ Successfully imported ${stored.length} questions from PDF`);
    return stored;
  } catch (error) {
    console.error(`❌ PDF import failed: ${error.message}`);
    return null;
  }
}

/**
 * Generate and import AI questions
 */
async function generateAndImport(category, subject, difficulty = 'medium', count = 10) {
  console.log(`\n🤖 Generating questions...`);
  console.log(`   Category: ${category}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Difficulty: ${difficulty}`);
  console.log(`   Count: ${count}\n`);

  try {
    const questions = await generateCompetitiveExamQuestions(category, subject, difficulty, count);
    
    const formattedQuestions = questions.map(q => ({
      questionText: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      subject: q.subject,
      category: q.category,
      difficulty: q.difficulty,
      source: 'ai_generated',
      isApproved: false
    }));

    const stored = await supabaseQuestionService.bulkAddToQuestionBank(formattedQuestions);
    
    console.log(`✅ Generated and imported ${stored.length} questions`);
    return stored;
  } catch (error) {
    console.error(`❌ Generation failed: ${error.message}`);
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  console.log('\n' + '='.repeat(60));
  console.log('🎓 Competitive Exam Questions Import Tool');
  console.log('='.repeat(60) + '\n');

  if (args.length === 0) {
    // Default: Import sample questions
    console.log('📝 Mode: Sample Questions Import\n');
    await importSampleQuestions();
  } else if (args[0] === '--generate') {
    // Generate AI questions
    const category = args[1] || 'tcs';
    const subject = args[2] || 'aptitude';
    const difficulty = args[3] || 'medium';
    const count = parseInt(args[4]) || 10;
    
    await generateAndImport(category, subject, difficulty, count);
  } else if (args[0].endsWith('.pdf')) {
    // Process PDF file
    const pdfPath = args[0];
    const category = args[1] || 'general';
    const subject = args[2] || 'general';
    
    await importFromPDF(pdfPath, category, subject);
  } else {
    console.log('Usage:');
    console.log('  node importCompetitiveQuestions.js                          # Import sample questions');
    console.log('  node importCompetitiveQuestions.js path/to/file.pdf category subject');
    console.log('  node importCompetitiveQuestions.js --generate category subject difficulty count');
    console.log('\nAvailable categories:', Object.keys(CATEGORY_PROMPTS).join(', '));
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Process complete!');
  console.log('='.repeat(60) + '\n');

  process.exit(0);
}

main().catch(console.error);
