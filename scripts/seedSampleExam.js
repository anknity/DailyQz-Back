/**
 * Seed Sample Scheduled Exam with Real Questions
 * Run this to create a test exam with actual questions
 */

const { supabaseAdmin } = require('./src/config/supabase');

const sampleQuestions = [
  {
    id: 1,
    text: "What is the time complexity of binary search in a sorted array?",
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correctAnswer: 1,
    explanation: "Binary search divides the search space in half each iteration, resulting in O(log n) complexity.",
    difficulty: "medium"
  },
  {
    id: 2,
    text: "Which data structure uses LIFO (Last In First Out) principle?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctAnswer: 1,
    explanation: "A Stack follows LIFO - the last element pushed is the first one to be popped.",
    difficulty: "easy"
  },
  {
    id: 3,
    text: "What is the space complexity of merge sort?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correctAnswer: 2,
    explanation: "Merge sort requires O(n) additional space for the temporary arrays used during merging.",
    difficulty: "medium"
  },
  {
    id: 4,
    text: "Which sorting algorithm has the best average-case time complexity?",
    options: ["Bubble Sort - O(n²)", "Quick Sort - O(n log n)", "Selection Sort - O(n²)", "Insertion Sort - O(n²)"],
    correctAnswer: 1,
    explanation: "Quick Sort has an average-case time complexity of O(n log n), which is optimal for comparison-based sorts.",
    difficulty: "medium"
  },
  {
    id: 5,
    text: "In a binary tree, what is the maximum number of nodes at level L?",
    options: ["L", "2L", "2^L", "L²"],
    correctAnswer: 2,
    explanation: "At level L (starting from 0 at root), the maximum number of nodes is 2^L.",
    difficulty: "medium"
  },
  {
    id: 6,
    text: "What is the output of: console.log(typeof null)?",
    options: ["null", "undefined", "object", "number"],
    correctAnswer: 2,
    explanation: "This is a famous JavaScript quirk. typeof null returns 'object' due to a legacy bug.",
    difficulty: "easy"
  },
  {
    id: 7,
    text: "Which keyword is used to declare a constant in JavaScript ES6?",
    options: ["var", "let", "const", "constant"],
    correctAnswer: 2,
    explanation: "const is used to declare constants that cannot be reassigned.",
    difficulty: "easy"
  },
  {
    id: 8,
    text: "What does REST stand for in REST API?",
    options: [
      "Representational State Transfer",
      "Remote Server Technology",
      "Reliable State Transfer",
      "Remote Execution Standard"
    ],
    correctAnswer: 0,
    explanation: "REST stands for Representational State Transfer, an architectural style for APIs.",
    difficulty: "easy"
  },
  {
    id: 9,
    text: "Which HTTP method is typically used to update a resource?",
    options: ["GET", "POST", "PUT", "DELETE"],
    correctAnswer: 2,
    explanation: "PUT is the standard HTTP method for updating an existing resource.",
    difficulty: "easy"
  },
  {
    id: 10,
    text: "What is the time complexity of accessing an element by index in an array?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
    correctAnswer: 0,
    explanation: "Array index access is O(1) constant time because arrays provide direct memory addressing.",
    difficulty: "easy"
  },
  {
    id: 11,
    text: "Which of the following is NOT a JavaScript data type?",
    options: ["undefined", "number", "float", "symbol"],
    correctAnswer: 2,
    explanation: "JavaScript doesn't have a separate float type. All numbers are 64-bit floating point (number type).",
    difficulty: "medium"
  },
  {
    id: 12,
    text: "What is the purpose of the 'use strict' directive in JavaScript?",
    options: [
      "Makes code run faster",
      "Enables strict mode with additional error checking",
      "Compresses the code",
      "Enables ES6 features"
    ],
    correctAnswer: 1,
    explanation: "'use strict' enables strict mode which catches common coding errors and prevents unsafe actions.",
    difficulty: "medium"
  },
  {
    id: 13,
    text: "What is a closure in JavaScript?",
    options: [
      "A way to close a function",
      "A function that has access to variables from its outer scope",
      "A method to end a loop",
      "A type of error handling"
    ],
    correctAnswer: 1,
    explanation: "A closure is a function that remembers and can access variables from its outer (enclosing) scope.",
    difficulty: "hard"
  },
  {
    id: 14,
    text: "Which method is used to convert a JSON string to a JavaScript object?",
    options: ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.toObject()"],
    correctAnswer: 1,
    explanation: "JSON.parse() converts a JSON string to a JavaScript object. JSON.stringify() does the opposite.",
    difficulty: "easy"
  },
  {
    id: 15,
    text: "What is the difference between == and === in JavaScript?",
    options: [
      "No difference",
      "== checks type only, === checks value",
      "== checks value with type coercion, === checks value and type strictly",
      "=== is deprecated"
    ],
    correctAnswer: 2,
    explanation: "== performs type coercion before comparison, while === compares both value and type without coercion.",
    difficulty: "easy"
  },
  {
    id: 16,
    text: "What is the result of: [1, 2, 3].map(x => x * 2)?",
    options: ["[1, 2, 3]", "[2, 4, 6]", "[1, 4, 9]", "6"],
    correctAnswer: 1,
    explanation: "The map() method creates a new array by applying the function to each element. 1*2=2, 2*2=4, 3*2=6.",
    difficulty: "easy"
  },
  {
    id: 17,
    text: "Which hook is used for side effects in React?",
    options: ["useState", "useEffect", "useContext", "useReducer"],
    correctAnswer: 1,
    explanation: "useEffect is used for side effects like data fetching, subscriptions, or DOM manipulation.",
    difficulty: "medium"
  },
  {
    id: 18,
    text: "What is the purpose of the virtual DOM in React?",
    options: [
      "To make code more secure",
      "To improve performance by minimizing direct DOM manipulation",
      "To store user data",
      "To enable server-side rendering"
    ],
    correctAnswer: 1,
    explanation: "The virtual DOM allows React to batch updates and minimize expensive DOM operations for better performance.",
    difficulty: "medium"
  },
  {
    id: 19,
    text: "What does SQL stand for?",
    options: [
      "Simple Query Language",
      "Structured Query Language",
      "Standard Query Logic",
      "System Query Language"
    ],
    correctAnswer: 1,
    explanation: "SQL stands for Structured Query Language, used for managing relational databases.",
    difficulty: "easy"
  }
];

async function seedSampleExam() {
  console.log('🌱 Seeding sample scheduled exam...\n');

  try {
    // Create a demo exam with the sample questions
    const startTime = new Date();
    startTime.setMinutes(startTime.getMinutes() - 5); // Started 5 minutes ago (LIVE)
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 2); // Ends in ~2 hours

    // First, check if demo exam already exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('scheduled_exams')
      .select('id')
      .eq('title', 'Demo')
      .single();

    if (existing) {
      // Update existing exam with proper questions
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('scheduled_exams')
        .update({
          questions: sampleQuestions,
          question_count: sampleQuestions.length,
          duration_minutes: 30,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating exam:', updateError);
        return;
      }

      console.log('✅ Updated existing Demo exam with real questions');
      console.log(`   ID: ${updated.id}`);
      console.log(`   Questions: ${sampleQuestions.length}`);
    } else {
      // Create new exam
      const { data: exam, error: examError } = await supabaseAdmin
        .from('scheduled_exams')
        .insert({
          title: 'Demo',
          description: 'Demo exam with programming and computer science questions',
          category: 'programming',
          subject: 'Computer Science',
          difficulty: 'mixed',
          question_count: sampleQuestions.length,
          duration_minutes: 30,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          is_active: true,
          is_proctored: false,
          passing_score: 60,
          questions: sampleQuestions
        })
        .select()
        .single();

      if (examError) {
        console.error('❌ Error creating exam:', examError);
        return;
      }

      console.log('✅ Created new Demo exam');
      console.log(`   ID: ${exam.id}`);
      console.log(`   Title: ${exam.title}`);
      console.log(`   Questions: ${sampleQuestions.length}`);
    }

    // Also add questions to question_bank for future use
    console.log('\n📚 Adding questions to question bank...');
    
    for (const q of sampleQuestions) {
      try {
        await supabaseAdmin
          .from('question_bank')
          .upsert({
            question_text: q.text,
            options: JSON.stringify(q.options),
            correct_answer: q.correctAnswer,
            subject: 'Computer Science',
            category: 'programming',
            difficulty: q.difficulty,
            explanation: q.explanation,
            source: 'seed_script',
            is_approved: true
          }, {
            onConflict: 'question_text'
          });
      } catch (e) {
        // Question might already exist, skip
      }
    }

    console.log('✅ Questions added to question bank');
    console.log('\n🎉 Seeding complete! You can now take the Demo exam.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run if called directly
seedSampleExam().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
