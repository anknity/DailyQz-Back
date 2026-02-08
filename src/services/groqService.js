const Groq = require('groq-sdk');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const { safeParseJSON } = require('../utils/jsonSanitizer');
require('dotenv').config();

/**
 * Groq AI Service for Question Generation and PDF Analysis
 * Uses Groq's fast inference for generating exam questions
 */

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Comprehensive category configurations including company and government exams
const CATEGORY_PROMPTS = {
  // Educational Categories
  'class-9-10': {
    base: 'Class 9-10 curriculum',
    type: 'education',
    subjects: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi']
  },
  'class-11-12': {
    base: 'Class 11-12 curriculum',
    type: 'education',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science']
  },
  'neet': {
    base: 'NEET Medical Entrance Examination',
    type: 'competitive',
    subjects: ['Physics', 'Chemistry', 'Biology - Botany', 'Biology - Zoology']
  },
  
  // DSA Categories
  'dsa': {
    base: 'Data Structures and Algorithms',
    type: 'technical',
    subjects: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Searching', 'Stacks', 'Queues', 'Recursion', 'Hashing', 'Heap']
  },
  'dsa-arrays': {
    base: 'DSA - Arrays and Strings',
    type: 'technical',
    subjects: ['Array Manipulation', 'Two Pointers', 'Sliding Window', 'String Operations', 'Prefix Sum']
  },
  'dsa-trees': {
    base: 'DSA - Trees and Binary Search Trees',
    type: 'technical',
    subjects: ['Binary Trees', 'BST', 'AVL Trees', 'Tree Traversals', 'Segment Trees', 'Tries']
  },
  'dsa-graphs': {
    base: 'DSA - Graphs',
    type: 'technical',
    subjects: ['BFS', 'DFS', 'Shortest Path', 'MST', 'Topological Sort', 'Graph Coloring']
  },
  'dsa-dp': {
    base: 'DSA - Dynamic Programming',
    type: 'technical',
    subjects: ['1D DP', '2D DP', 'Knapsack', 'LCS', 'LIS', 'Matrix Chain', 'DP on Trees']
  },
  
  // Company Categories
  'tcs': {
    base: 'TCS (Tata Consultancy Services) Recruitment Test',
    type: 'company',
    subjects: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Programming', 'Coding']
  },
  'infosys': {
    base: 'Infosys Recruitment Test',
    type: 'company',
    subjects: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Puzzle Solving', 'Programming']
  },
  'wipro': {
    base: 'Wipro NLTH Recruitment Test',
    type: 'company',
    subjects: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Essay Writing', 'Technical']
  },
  'tech-mahindra': {
    base: 'Tech Mahindra Recruitment Test',
    type: 'company',
    subjects: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Technical MCQ', 'Coding']
  },
  'cognizant': {
    base: 'Cognizant GenC Recruitment Test',
    type: 'company',
    subjects: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Automata Coding']
  },
  'accenture': {
    base: 'Accenture Recruitment Test',
    type: 'company',
    subjects: ['Cognitive Assessment', 'Technical Assessment', 'Coding', 'Communication']
  },
  'capgemini': {
    base: 'Capgemini Recruitment Test',
    type: 'company',
    subjects: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Pseudo Code', 'Essay']
  },
  'amazon': {
    base: 'Amazon SDE Hiring',
    type: 'company',
    subjects: ['Data Structures', 'Algorithms', 'System Design', 'OOPs', 'Problem Solving']
  },
  'google': {
    base: 'Google Hiring',
    type: 'company',
    subjects: ['Data Structures', 'Algorithms', 'System Design', 'Coding', 'Problem Solving']
  },
  'microsoft': {
    base: 'Microsoft Hiring',
    type: 'company',
    subjects: ['Data Structures', 'Algorithms', 'System Design', 'OOPs', 'Problem Solving']
  },
  
  // Government Exam Categories
  'ssc': {
    base: 'SSC (Staff Selection Commission) Examination',
    type: 'government',
    subjects: ['Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness']
  },
  'banking': {
    base: 'Banking Examination (IBPS/SBI)',
    type: 'government',
    subjects: ['Quantitative Aptitude', 'Reasoning', 'English', 'Banking Awareness', 'Computer Knowledge']
  },
  'railway': {
    base: 'Railway Recruitment Board Examination',
    type: 'government',
    subjects: ['General Awareness', 'Mathematics', 'General Science', 'Reasoning']
  },
  'upsc': {
    base: 'UPSC Civil Services Examination',
    type: 'government',
    subjects: ['History', 'Geography', 'Polity', 'Economy', 'Current Affairs', 'Science & Tech']
  },
  'bihar-police': {
    base: 'Bihar Police (Constable/SI/Daroga) Recruitment',
    type: 'government',
    subjects: ['Hindi', 'English', 'General Knowledge', 'Current Affairs', 'Mathematics', 'Reasoning']
  },
  'state-psc': {
    base: 'State Public Service Commission Examination',
    type: 'government',
    subjects: ['General Studies', 'Current Affairs', 'Reasoning', 'State Specific GK']
  },
  
  // Web Development
  'web-development': {
    base: 'Web Development',
    type: 'technical',
    subjects: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'TypeScript', 'REST APIs', 'Frontend', 'Backend']
  },
  'react': {
    base: 'React.js Development',
    type: 'technical',
    subjects: ['React Basics', 'Hooks', 'State Management', 'Redux', 'Next.js', 'React Router']
  },
  'javascript': {
    base: 'JavaScript Programming',
    type: 'technical',
    subjects: ['ES6+', 'DOM', 'Async/Await', 'Closures', 'Promises', 'OOPs']
  },
  
  // Programming Languages
  'python': {
    base: 'Python Programming',
    type: 'technical',
    subjects: ['Basics', 'OOPs', 'Data Structures', 'Libraries', 'Web Frameworks', 'Automation']
  },
  'java': {
    base: 'Java Programming',
    type: 'technical',
    subjects: ['Core Java', 'OOPs', 'Collections', 'Multithreading', 'Spring', 'JDBC']
  },
  'cpp': {
    base: 'C++ Programming',
    type: 'technical',
    subjects: ['Basics', 'OOPs', 'STL', 'Pointers', 'Memory Management', 'Templates']
  },
  
  // General Categories
  'computer-science-gk': {
    base: 'Computer Science General Knowledge',
    type: 'general',
    subjects: ['Programming', 'Data Structures', 'Networking', 'Operating Systems', 'Database']
  },
  'current-affairs': {
    base: 'Current Affairs and General Knowledge',
    type: 'general',
    subjects: ['National', 'International', 'Sports', 'Science & Tech', 'Economy']
  },
  'aptitude': {
    base: 'General Aptitude',
    type: 'general',
    subjects: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Data Interpretation']
  },
  
  // Data Science
  'data-science': {
    base: 'Data Science',
    type: 'technical',
    subjects: ['Python', 'Statistics', 'Machine Learning', 'Data Visualization', 'Pandas', 'NumPy']
  },
  
  // Database
  'database': {
    base: 'Database Management',
    type: 'technical',
    subjects: ['SQL', 'NoSQL', 'Database Design', 'Indexing', 'Transactions', 'Normalization']
  },
  
  // AI/ML
  'artificial-intelligence': {
    base: 'Artificial Intelligence and Machine Learning',
    type: 'technical',
    subjects: ['ML Basics', 'Deep Learning', 'NLP', 'Computer Vision', 'Neural Networks']
  },
  
  // System Design
  'system-design': {
    base: 'System Design',
    type: 'technical',
    subjects: ['Scalability', 'Load Balancing', 'Caching', 'Database Sharding', 'Microservices', 'APIs']
  },
  
  // Operating Systems
  'operating-systems': {
    base: 'Operating Systems',
    type: 'technical',
    subjects: ['Process Management', 'Memory Management', 'File Systems', 'Scheduling', 'Deadlocks']
  },
  
  // Computer Networks
  'networking': {
    base: 'Computer Networking',
    type: 'technical',
    subjects: ['OSI Model', 'TCP/IP', 'HTTP/HTTPS', 'DNS', 'Firewalls', 'Network Security']
  }
};

/**
 * Generate MCQ questions using Groq AI
 * @param {Object} options - Generation options
 * @param {string} options.category - Main category
 * @param {string} options.subject - Subject/topic
 * @param {string} options.difficulty - easy, medium, hard, mixed
 * @param {number} options.count - Number of questions to generate
 * @param {string} options.prompt - Custom prompt from user
 * @returns {Promise<Array>} Generated questions
 */
const generateQuestions = async ({ category, subject, difficulty = 'medium', count = 10, prompt = '' }) => {
  try {
    const categoryConfig = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS['computer-science-gk'];
    
    const difficultyGuidelines = {
      easy: 'Basic conceptual questions that test fundamental understanding. Simple and straightforward.',
      medium: 'Moderate complexity requiring application of concepts. Some calculation or reasoning involved.',
      hard: 'Advanced questions requiring deep understanding, multi-step reasoning, or tricky concepts.',
      mixed: 'Mix of easy, medium, and hard questions distributed evenly.'
    };

    const systemPrompt = `You are an expert exam question generator. Generate high-quality multiple choice questions (MCQs) for educational assessments. Each question must have exactly 4 options with only one correct answer.`;

    const userPrompt = `Generate ${count} MCQ questions for ${categoryConfig.base}.
${subject ? `Subject/Topic: ${subject}` : ''}
${prompt ? `Additional context: ${prompt}` : ''}

Difficulty: ${difficultyGuidelines[difficulty] || difficultyGuidelines.medium}

IMPORTANT: Return ONLY a valid JSON array with no additional text or explanation. Each object must have this exact structure:
{
  "text": "Question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Brief explanation of why the answer is correct",
  "difficulty": "${difficulty}"
}

The correctAnswer is the 0-based index of the correct option (0, 1, 2, or 3).

Generate diverse questions covering different aspects of the topic. Ensure questions are clear, unambiguous, and educationally valuable.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 4096
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Parse JSON from response
    const questions = safeParseJSON(responseText);
    if (!questions) {
      throw new Error('Failed to parse generated questions');
    }

    // Validate and format questions
    return questions.map((q, index) => ({
      id: `generated-${Date.now()}-${index}`,
      question: q.question || q.text,
      options: q.options,
      correctAnswer: parseInt(q.correctAnswer),
      explanation: q.explanation || '',
      difficulty: q.difficulty || difficulty,
      category: category,
      subject: subject || categoryConfig.base,
      generatedBy: 'groq-ai',
      createdAt: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Error generating questions with Groq:', error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};

/**
 * Extract questions from PDF text using Groq AI
 * @param {string} pdfText - Extracted text from PDF
 * @param {string} category - Category for the questions
 * @returns {Promise<Array>} Extracted questions
 */
const extractQuestionsFromPdf = async (pdfText, category = 'general') => {
  try {
    const systemPrompt = `You are an expert at extracting MCQ questions from educational documents. Parse the given text and extract all multiple choice questions with their options and correct answers.`;

    const userPrompt = `Extract all MCQ questions from the following text. Convert them into a structured JSON format.

TEXT:
${pdfText.substring(0, 10000)}

IMPORTANT: Return ONLY a valid JSON array with no additional text. Each question object must have:
{
  "text": "Question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "confidence": 0.95
}

The correctAnswer is the 0-based index (0-3). The confidence field (0-1) indicates how confident you are about extracting this question correctly.

If the correct answer is marked in the text, use it. If not marked, set correctAnswer to 0 and confidence to 0.5.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 4096
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Parse JSON from response
    const questions = safeParseJSON(responseText);
    if (!questions) {
      throw new Error('Failed to parse extracted questions');
    }

    // Format extracted questions
    return questions.map((q, index) => ({
      id: `pdf-${Date.now()}-${index}`,
      question: q.question || q.text,
      options: q.options || ['', '', '', ''],
      correctAnswer: parseInt(q.correctAnswer) || 0,
      confidence: q.confidence || 0.5,
      category: category,
      extractedFrom: 'pdf',
      createdAt: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Error extracting questions from PDF:', error);
    throw new Error(`Failed to extract questions: ${error.message}`);
  }
};

/**
 * Generate DSA coding problem using Groq AI
 * @param {Object} options - Generation options
 * @param {string} options.topic - DSA topic (arrays, trees, etc.)
 * @param {string} options.difficulty - easy, medium, hard
 * @returns {Promise<Object>} Generated problem
 */
const generateDSAProblem = async ({ topic, difficulty = 'medium' }) => {
  try {
    const systemPrompt = `You are an expert competitive programming problem setter. Create unique, well-designed coding problems similar to LeetCode style.`;

    const userPrompt = `Generate a ${difficulty} difficulty coding problem related to ${topic}.

Return a JSON object with this structure:
{
  "title": "Problem Title",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "description": "Full problem description with context and requirements",
  "examples": [
    { "input": "Example input", "output": "Expected output", "explanation": "How we got this output" }
  ],
  "constraints": ["Constraint 1", "Constraint 2"],
  "hints": ["Hint 1", "Hint 2"],
  "starterCode": {
    "javascript": "function solution(input) {\\n  // Your code here\\n}",
    "python": "def solution(input):\\n    # Your code here\\n    pass",
    "java": "class Solution {\\n    public int solution(int[] input) {\\n        // Your code here\\n    }\\n}",
    "cpp": "class Solution {\\npublic:\\n    int solution(vector<int>& input) {\\n        // Your code here\\n    }\\n};"
  },
  "testCases": [
    { "input": "test input", "expectedOutput": "expected output", "isHidden": false },
    { "input": "hidden test", "expectedOutput": "hidden output", "isHidden": true }
  ],
  "solution": {
    "approach": "Explanation of the optimal approach",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "code": "// Solution code"
  }
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 4096
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Parse JSON from response
    const problem = safeParseJSON(responseText);
    if (!problem) {
      throw new Error('Failed to parse generated problem');
    }
    
    return {
      ...problem,
      id: `dsa-${Date.now()}`,
      slug: problem.title.toLowerCase().replace(/\s+/g, '-'),
      generatedBy: 'groq-ai',
      createdAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error generating DSA problem:', error);
    throw new Error(`Failed to generate problem: ${error.message}`);
  }
};

// Note: module.exports moved to end of file after all function definitions

/**
 * Extract text from PDF file buffer or path
 * @param {Buffer|string} input - PDF buffer or file path
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromPDF(input) {
  try {
    let dataBuffer;
    if (typeof input === 'string') {
      dataBuffer = fs.readFileSync(input);
    } else {
      dataBuffer = input;
    }
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Process PDF and extract questions with enhanced parsing
 * @param {Buffer|string} pdfInput - PDF buffer or file path
 * @param {string} category - Exam category
 * @param {string} subject - Subject/subcategory
 * @returns {Promise<Array>} Extracted questions
 */
async function processPDFAndExtractQuestions(pdfInput, category, subject = 'general') {
  try {
    console.log(`📄 Processing PDF for category: ${category}`);
    
    // Extract text from PDF
    const pdfText = await extractTextFromPDF(pdfInput);
    console.log(`📝 Extracted ${pdfText.length} characters from PDF`);
    
    const categoryConfig = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS['aptitude'];
    
    // Process in chunks if text is too long
    const MAX_CHUNK_SIZE = 12000;
    let allQuestions = [];
    
    if (pdfText.length > MAX_CHUNK_SIZE) {
      const chunks = [];
      for (let i = 0; i < pdfText.length; i += MAX_CHUNK_SIZE) {
        chunks.push(pdfText.substring(i, Math.min(i + MAX_CHUNK_SIZE, pdfText.length)));
      }
      
      console.log(`📊 Processing ${chunks.length} chunks...`);
      
      for (let i = 0; i < Math.min(chunks.length, 5); i++) { // Limit to 5 chunks
        console.log(`   Processing chunk ${i + 1}/${Math.min(chunks.length, 5)}...`);
        try {
          const questions = await extractQuestionsFromPdfEnhanced(chunks[i], category, subject);
          allQuestions = [...allQuestions, ...questions];
          // Add delay between chunks to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
          console.warn(`   Chunk ${i + 1} failed: ${err.message}`);
        }
      }
    } else {
      allQuestions = await extractQuestionsFromPdfEnhanced(pdfText, category, subject);
    }
    
    // Remove duplicates based on question text
    const uniqueQuestions = allQuestions.filter((q, index, self) =>
      index === self.findIndex(t => t.text.toLowerCase().trim() === q.text.toLowerCase().trim())
    );
    
    console.log(`✅ Extracted ${uniqueQuestions.length} unique questions`);
    return uniqueQuestions;
  } catch (error) {
    console.error('PDF processing error:', error);
    throw error;
  }
}

/**
 * Enhanced question extraction from PDF text
 * @param {string} pdfText - Text from PDF
 * @param {string} category - Category
 * @param {string} subject - Subject
 * @returns {Promise<Array>} Extracted questions
 */
async function extractQuestionsFromPdfEnhanced(pdfText, category, subject) {
  try {
    const categoryConfig = CATEGORY_PROMPTS[category] || { base: category, type: 'general' };
    
    const systemPrompt = `You are an expert at extracting MCQ questions from competitive exam papers. You must:
1. Extract ALL multiple choice questions from the text
2. Identify the correct answer if marked (usually A, B, C, D or 1, 2, 3, 4)
3. Clean up any OCR errors or formatting issues
4. Maintain the original meaning of questions`;

    const userPrompt = `Extract all MCQ questions from this ${categoryConfig.base} exam paper text.

Category: ${category}
Subject: ${subject}
Exam Type: ${categoryConfig.type || 'general'}

TEXT TO ANALYZE:
${pdfText}

IMPORTANT INSTRUCTIONS:
1. Return ONLY a valid JSON array - no markdown, no explanations
2. Each question object must have this EXACT structure:
{
  "text": "Clean question text without number prefix",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "correctAnswer": 0,
  "difficulty": "medium",
  "subject": "${subject}",
  "explanation": ""
}

RULES:
- correctAnswer is the 0-based INDEX (0=A, 1=B, 2=C, 3=D)
- If answer key shows "A" or "1", correctAnswer should be 0
- If answer key shows "B" or "2", correctAnswer should be 1
- If answer key shows "C" or "3", correctAnswer should be 2
- If answer key shows "D" or "4", correctAnswer should be 3
- Look for answer keys at the end of the document
- If no answer is marked, analyze the question and provide best answer
- Set difficulty based on question complexity
- Clean up garbled text or OCR errors
- Extract at least 10 questions if available`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 8000
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Clean up response
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.slice(7);
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.slice(3);
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();
    
    // Parse JSON
    const questions = safeParseJSON(cleanedResponse);
    if (!questions) {
      throw new Error('Failed to parse enhanced PDF questions');
    }
    
    // Format and validate questions
    return questions.map((q, index) => ({
      id: `${category}-${subject}-${Date.now()}-${index}`,
      question: (q.question || q.text || '').trim(),
      options: Array.isArray(q.options) ? q.options.map(o => o?.trim() || '') : ['', '', '', ''],
      correctAnswer: parseInt(q.correctAnswer) || 0,
      difficulty: q.difficulty || 'medium',
      explanation: q.explanation || '',
      category: category,
      subject: subject,
      examType: categoryConfig.type || 'general',
      source: 'pdf-extraction',
      createdAt: new Date().toISOString(),
      verified: false
    })).filter(q => q.question && q.options.filter(o => o).length >= 2);

  } catch (error) {
    console.error('Enhanced extraction error:', error);
    throw new Error(`Failed to extract questions: ${error.message}`);
  }
}

/**
 * Generate questions specifically for competitive exams
 * @param {string} category - Company or government exam category
 * @param {string} subject - Subject/topic
 * @param {string} difficulty - easy, medium, hard
 * @param {number} count - Number of questions
 * @returns {Promise<Array>} Generated questions
 */
async function generateCompetitiveExamQuestions(category, subject, difficulty = 'medium', count = 10) {
  try {
    const categoryConfig = CATEGORY_PROMPTS[category];
    if (!categoryConfig) {
      throw new Error(`Unknown category: ${category}`);
    }
    
    const difficultyGuidelines = {
      easy: 'Basic conceptual questions. Direct formulas and definitions. Simple calculations.',
      medium: 'Application-based questions. Moderate complexity. Requires reasoning.',
      hard: 'Advanced questions. Multiple concepts. Tricky options. Time-consuming calculations.'
    };

    const examTypeInstructions = {
      company: `These are for IT company placement exams. Questions should be similar to actual ${categoryConfig.base} pattern. Include practical scenarios.`,
      government: `These are for government competitive exams. Questions should follow official exam patterns. Include factual and current affairs questions.`,
      competitive: `These are for competitive entrance exams. Questions should be challenging and test deep understanding.`,
      general: `These are for general practice. Include a mix of theoretical and practical questions.`
    };

    const systemPrompt = `You are an expert competitive exam question setter. Generate authentic questions that match the actual exam pattern of ${categoryConfig.base}.`;

    const userPrompt = `Generate ${count} MCQ questions for ${categoryConfig.base}.

Category: ${category}
Subject: ${subject}
Difficulty: ${difficulty}
Type: ${categoryConfig.type}

${examTypeInstructions[categoryConfig.type] || ''}

Difficulty Guidelines: ${difficultyGuidelines[difficulty]}

Available subjects for this exam: ${categoryConfig.subjects.join(', ')}

IMPORTANT: Return ONLY a valid JSON array with this structure:
[
  {
    "text": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "difficulty": "${difficulty}",
    "subject": "${subject}",
    "explanation": "Brief explanation of the correct answer"
  }
]

Requirements:
- Questions must match actual ${category.toUpperCase()} exam patterns
- All 4 options must be plausible (no obvious wrong answers)
- correctAnswer is 0-based index (0-3)
- Include variety in question types
- Make questions unique and not easily searchable`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 8000
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Clean up response
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.slice(7);
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.slice(3);
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();
    
    const questions = safeParseJSON(cleanedResponse);
    if (!questions) {
      throw new Error('Failed to parse generated questions');
    }
    
    return questions.map((q, index) => ({
      id: `${category}-${subject}-gen-${Date.now()}-${index}`,
      question: q.question || q.text,
      options: q.options,
      correctAnswer: parseInt(q.correctAnswer) || 0,
      difficulty: q.difficulty || difficulty,
      explanation: q.explanation || '',
      category: category,
      subject: subject,
      examType: categoryConfig.type,
      source: 'ai-generated',
      createdAt: new Date().toISOString(),
      verified: false,
      aiGenerated: true
    }));

  } catch (error) {
    console.error('Competitive exam generation error:', error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
}

// Module exports - all functions defined above
module.exports = {
  generateQuestions,
  extractQuestionsFromPdf,
  generateDSAProblem,
  CATEGORY_PROMPTS,
  extractTextFromPDF,
  processPDFAndExtractQuestions,
  generateCompetitiveExamQuestions
};
