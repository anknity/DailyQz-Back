const { GoogleGenerativeAI } = require('@google/generative-ai')
const { safeParseJSON } = require('../utils/jsonSanitizer')
require('dotenv').config()

/**
 * Gemini AI Service for MCQ Generation
 * Uses Google's Gemini API to generate new questions
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Category configurations for question generation
const CATEGORY_PROMPTS = {
  'web-development': {
    base: 'Web Development',
    subcategories: {
      'react': 'React.js framework including hooks, state management, components, and best practices',
      'tailwind': 'Tailwind CSS utility-first framework, classes, responsive design',
      'html-css': 'HTML5 and CSS3 including semantic HTML, flexbox, grid, animations',
      'javascript': 'JavaScript ES6+ including async/await, closures, DOM manipulation, events',
      'nodejs': 'Node.js and Express.js backend development',
      'general': 'General web development concepts including HTTP, REST APIs, authentication'
    }
  },
  'dsa': {
    base: 'Data Structures and Algorithms',
    subcategories: {
      'arrays': 'Arrays and Strings - manipulation, searching, sorting, two pointers',
      'linked-lists': 'Linked Lists - single, double, circular, operations',
      'trees': 'Trees - Binary trees, BST, AVL, traversals, operations',
      'graphs': 'Graphs - BFS, DFS, shortest path, topological sort',
      'dynamic-programming': 'Dynamic Programming - memoization, tabulation, common patterns',
      'stacks-queues': 'Stacks and Queues - implementation, applications',
      'sorting': 'Sorting Algorithms - Quick sort, Merge sort, Heap sort, complexity',
      'searching': 'Searching Algorithms - Binary search, variations',
      'recursion': 'Recursion and Backtracking'
    }
  },
  'aptitude': {
    base: 'Aptitude',
    subcategories: {
      'quantitative': 'Quantitative Aptitude - percentages, profit/loss, time/work, ratios',
      'logical': 'Logical Reasoning - patterns, puzzles, deductions',
      'verbal': 'Verbal Ability - comprehension, vocabulary, grammar',
      'data-interpretation': 'Data Interpretation - charts, graphs, tables analysis'
    }
  },
  'neet': {
    base: 'NEET Examination',
    subcategories: {
      'physics': 'Physics - mechanics, thermodynamics, electromagnetism, optics, modern physics',
      'chemistry-organic': 'Organic Chemistry - reactions, mechanisms, nomenclature',
      'chemistry-inorganic': 'Inorganic Chemistry - periodic table, bonding, coordination compounds',
      'chemistry-physical': 'Physical Chemistry - thermodynamics, equilibrium, kinetics',
      'biology-botany': 'Botany - plant physiology, morphology, ecology',
      'biology-zoology': 'Zoology - human physiology, genetics, evolution'
    }
  },
  'artificial-intelligence': {
    base: 'Artificial Intelligence and Machine Learning',
    subcategories: {
      'ml-basics': 'Machine Learning basics, types, algorithms',
      'deep-learning': 'Deep Learning, Neural Networks, CNN, RNN',
      'nlp': 'Natural Language Processing',
      'computer-vision': 'Computer Vision'
    }
  },
  'data-science': {
    base: 'Data Science',
    subcategories: {
      'python': 'Python for Data Science - pandas, numpy, matplotlib',
      'statistics': 'Statistics and Probability',
      'visualization': 'Data Visualization'
    }
  },
  'networking': {
    base: 'Computer Networking',
    subcategories: {
      'protocols': 'Network Protocols - TCP/IP, HTTP, DNS',
      'security': 'Network Security - encryption, firewalls, VPN',
      'architecture': 'Network Architecture - OSI model, topologies'
    }
  }
}

/**
 * Generate MCQ questions using Gemini AI
 * @param {string} category - Main category
 * @param {string} subcategory - Subcategory (optional)
 * @param {string} difficulty - easy, medium, hard
 * @param {number} count - Number of questions to generate
 * @returns {Promise<Array>} Generated questions
 */
const generateQuestions = async (category, subcategory = 'general', difficulty = 'medium', count = 5) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    
    const categoryConfig = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS['web-development']
    const topicDescription = categoryConfig.subcategories[subcategory] || categoryConfig.base
    
    const difficultyGuidelines = {
      easy: 'Basic conceptual questions that test fundamental understanding. Questions should be straightforward with clear answers.',
      medium: 'Intermediate questions that require understanding of concepts and their applications. Include some practical scenarios.',
      hard: 'Advanced questions that test deep understanding, edge cases, and complex scenarios. Include tricky options that require careful analysis.'
    }

    const prompt = `Generate ${count} multiple choice questions (MCQs) STRICTLY about ${topicDescription}.

Difficulty level: ${difficulty.toUpperCase()}
Guidelines: ${difficultyGuidelines[difficulty] || difficultyGuidelines.medium}

IMPORTANT: Return ONLY a valid JSON array, no markdown formatting, no code blocks, no explanation.

Each question object must have this exact structure:
{
  "question": "The question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "difficulty": "${difficulty}",
  "explanation": "Brief explanation of why the answer is correct"
}

STRICT RULES:
1. Each question must have exactly 4 options
2. correctAnswer is the index (0-3) of the correct option
3. Every question MUST be strictly about "${topicDescription}" — do NOT generate questions about other subjects or topics
4. Each question must be completely unique and different from every other question in this set
5. Do NOT repeat similar question patterns or rephrase the same concept
6. Cover diverse aspects and subtopics within "${topicDescription}"
7. Make options plausible and educational
8. Ensure technical accuracy

Generate ${count} unique questions about ${topicDescription} ONLY. Return the JSON array now:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()
    
    // Clean up the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    // Parse JSON
    const questions = safeParseJSON(text)
    if (!questions) {
      throw new Error('Failed to parse AI response as JSON')
    }
    
    // Validate and add metadata
    const validatedQuestions = questions.map((q, index) => ({
      id: `ai-${category}-${subcategory}-${Date.now()}-${index}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty || difficulty,
      category: category,
      subcategory: subcategory,
      explanation: q.explanation || '',
      isAIGenerated: true,
      generatedAt: new Date().toISOString()
    }))
    
    return validatedQuestions
  } catch (error) {
    console.error('Error generating questions with Gemini:', error)
    throw new Error(`Failed to generate questions: ${error.message}`)
  }
}

/**
 * Validate and parse questions from uploaded file
 * @param {string} content - File content (JSON or text)
 * @param {string} format - File format (json, csv, txt)
 * @returns {Array} Parsed questions
 */
const parseUploadedQuestions = (content, format = 'json') => {
  try {
    if (format === 'json') {
      const data = JSON.parse(content)
      const questions = Array.isArray(data) ? data : data.questions || []
      
      return questions.map((q, index) => {
        // Validate required fields
        if (!q.question || !q.options || q.options.length !== 4) {
          throw new Error(`Invalid question format at index ${index}`)
        }
        
        return {
          id: q.id || `uploaded-${Date.now()}-${index}`,
          question: q.question,
          options: q.options,
          correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
          difficulty: q.difficulty || 'medium',
          category: q.category || 'general',
          subcategory: q.subcategory || 'general',
          explanation: q.explanation || '',
          isUploaded: true,
          uploadedAt: new Date().toISOString()
        }
      })
    }
    
    throw new Error('Unsupported file format')
  } catch (error) {
    console.error('Error parsing uploaded questions:', error)
    throw error
  }
}

/**
 * Get available categories and subcategories
 */
const getAvailableCategories = () => {
  return Object.entries(CATEGORY_PROMPTS).map(([key, value]) => ({
    id: key,
    name: value.base,
    subcategories: Object.entries(value.subcategories).map(([subKey, subDesc]) => ({
      id: subKey,
      name: subKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: subDesc
    }))
  }))
}

module.exports = {
  generateQuestions,
  parseUploadedQuestions,
  getAvailableCategories,
  CATEGORY_PROMPTS
}
