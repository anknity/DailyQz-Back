const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { safeParseJSON } = require('../utils/jsonSanitizer');

/**
 * OpenRouter AI Service for Question Generation
 * Uses DeepSeek R1 model for intelligent question processing
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Log API key status at startup
if (!OPENROUTER_API_KEY) {
  console.warn('⚠️ OpenRouter API key not found in environment variables');
} else {
  console.log('✅ OpenRouter API key loaded successfully');
}

// Comprehensive Category configurations for question generation
const CATEGORY_PROMPTS = {
  // ===================
  // APTITUDE & REASONING
  // ===================
  'quantitative-aptitude': {
    base: 'Quantitative Aptitude',
    subcategories: {
      'percentage': 'Percentage calculations, increase/decrease, profit/loss percentages',
      'number-system': 'Number systems, divisibility, HCF, LCM, prime numbers',
      'time-and-work': 'Time and work problems, efficiency, pipe and cistern',
      'time-speed-distance': 'Speed, distance, relative motion, trains, boats and streams',
      'ratio-and-proportion': 'Ratios, proportions, partnerships',
      'profit-and-loss': 'Cost price, selling price, profit, loss, discounts',
      'simple-interest': 'Simple interest calculations',
      'compound-interest': 'Compound interest, depreciation',
      'averages': 'Average, weighted average, age problems',
      'algebra': 'Linear equations, quadratic equations, inequalities',
      'geometry': 'Triangles, circles, quadrilaterals, mensuration',
      'permutations-combinations': 'Permutations, combinations, probability',
      'data-interpretation': 'Charts, graphs, tables analysis',
      'trigonometry': 'Trigonometric ratios, identities, heights and distances',
      'statistics': 'Mean, median, mode, standard deviation',
      'mixtures-allegations': 'Mixture problems, alligation method',
      'boats-streams': 'Upstream, downstream, still water speed',
      'trains': 'Train problems, relative speed, platform crossing',
      'pipes-cisterns': 'Filling and emptying tanks, combined work'
    }
  },
  'logical-reasoning': {
    base: 'Logical Reasoning',
    subcategories: {
      'coding-decoding': 'Letter coding, number coding, substitution',
      'blood-relations': 'Family relationships, family tree',
      'direction-sense': 'Direction and distance problems',
      'seating-arrangement': 'Linear and circular arrangements',
      'syllogism': 'Logical deductions from statements',
      'puzzles': 'Logic puzzles, constraint based problems',
      'series': 'Number series, letter series, pattern recognition',
      'analogy': 'Word analogies, number analogies',
      'classification': 'Odd one out, grouping',
      'ranking': 'Ranking and ordering problems',
      'calendar': 'Days, dates, calendar calculations',
      'clocks': 'Clock angle problems, time calculations',
      'input-output': 'Machine input-output, step by step operations',
      'data-sufficiency': 'Sufficient data to answer questions',
      'statement-conclusions': 'Drawing conclusions from statements',
      'critical-reasoning': 'Arguments, assumptions, inferences'
    }
  },
  'verbal-ability': {
    base: 'Verbal Ability',
    subcategories: {
      'reading-comprehension': 'Passage based questions',
      'vocabulary': 'Synonyms, antonyms, word meanings',
      'grammar': 'Sentence correction, error spotting',
      'para-jumbles': 'Sentence arrangement, paragraph ordering',
      'fill-in-blanks': 'Cloze test, sentence completion',
      'idioms-phrases': 'Idioms and phrases meanings',
      'one-word-substitution': 'Single word replacements',
      'sentence-improvement': 'Improving sentence structure',
      'active-passive': 'Voice transformation',
      'direct-indirect': 'Speech transformation',
      'spelling-errors': 'Correct spellings',
      'word-usage': 'Contextual word usage'
    }
  },
  'general-knowledge': {
    base: 'General Knowledge',
    subcategories: {
      'current-affairs': 'Recent events, news, appointments',
      'history': 'Indian and world history',
      'geography': 'Physical and political geography',
      'polity': 'Indian constitution, governance',
      'economics': 'Basic economics, Indian economy',
      'science': 'Physics, chemistry, biology basics',
      'computer': 'Computer fundamentals, IT terms',
      'sports': 'Sports events, records, personalities',
      'awards': 'National and international awards',
      'books-authors': 'Famous books and their authors',
      'art-culture': 'Indian art, culture, heritage',
      'environment': 'Environment, ecology, climate'
    }
  },

  // ===================
  // SCHOOL SUBJECTS (Class 1-10)
  // ===================
  'mathematics': {
    base: 'Mathematics',
    subcategories: {
      'arithmetic': 'Basic operations, BODMAS, fractions, decimals',
      'algebra-basic': 'Variables, expressions, simple equations',
      'geometry-basic': 'Shapes, angles, area, perimeter, volume',
      'mensuration': 'Area and volume of 2D and 3D shapes',
      'statistics-basic': 'Data handling, graphs, mean, median, mode',
      'number-theory': 'Factors, multiples, prime numbers, divisibility',
      'ratio-proportion': 'Ratios, direct and inverse proportion',
      'linear-equations': 'Linear equations in one and two variables',
      'quadratic-equations': 'Quadratic equations, roots, factorization',
      'polynomials': 'Polynomial expressions, factorization',
      'coordinate-geometry': 'Points, distance formula, section formula',
      'trigonometry-basic': 'Trigonometric ratios, identities',
      'probability-basic': 'Basic probability concepts',
      'real-numbers': 'Rational and irrational numbers'
    }
  },
  'science': {
    base: 'Science',
    subcategories: {
      'physics-basic': 'Motion, force, work, energy, light, sound',
      'chemistry-basic': 'Matter, elements, compounds, reactions',
      'biology-basic': 'Living organisms, plants, animals, human body',
      'environment-science': 'Ecosystem, pollution, conservation',
      'electricity': 'Current, circuits, magnets',
      'light-optics': 'Reflection, refraction, mirrors, lenses',
      'motion-laws': 'Newton\'s laws, gravitation',
      'acids-bases': 'Acids, bases, salts, pH',
      'metals-nonmetals': 'Properties of metals and non-metals',
      'carbon-compounds': 'Organic chemistry basics',
      'life-processes': 'Nutrition, respiration, transportation',
      'reproduction': 'Plant and animal reproduction',
      'heredity': 'Genetics, inheritance',
      'natural-resources': 'Sources of energy, conservation'
    }
  },
  'english': {
    base: 'English',
    subcategories: {
      'grammar': 'Tenses, articles, prepositions, conjunctions',
      'vocabulary': 'Word meanings, synonyms, antonyms',
      'reading-comprehension': 'Passage understanding',
      'writing-skills': 'Essays, letters, paragraphs',
      'poetry': 'Poetry analysis and appreciation',
      'prose': 'Short stories, novel excerpts',
      'parts-of-speech': 'Nouns, verbs, adjectives, adverbs',
      'sentence-structure': 'Simple, compound, complex sentences',
      'punctuation': 'Correct use of punctuation marks',
      'direct-indirect-speech': 'Reported speech transformation',
      'active-passive-voice': 'Voice changes'
    }
  },
  'hindi': {
    base: 'Hindi',
    subcategories: {
      'vyakaran': 'Hindi grammar, sandhi, samas',
      'sahitya': 'Hindi literature, prose, poetry',
      'lekhan': 'Essay writing, letter writing',
      'apathit-gadyansh': 'Unseen passage comprehension',
      'muhavare': 'Idioms and proverbs',
      'paryayvachi': 'Synonyms',
      'vilom': 'Antonyms',
      'anekarthi': 'Words with multiple meanings',
      'vaky-rachna': 'Sentence formation',
      'rachna': 'Creative writing'
    }
  },
  'social-science': {
    base: 'Social Science',
    subcategories: {
      'history-india': 'Indian history - ancient, medieval, modern',
      'history-world': 'World history, revolutions, wars',
      'geography-india': 'Physical and political geography of India',
      'geography-world': 'World geography, continents, oceans',
      'civics': 'Constitution, democracy, governance',
      'economics-basic': 'Basic economic concepts, sectors',
      'resources': 'Natural and human resources',
      'maps': 'Map reading, map skills',
      'disaster-management': 'Natural disasters, prevention',
      'nationalism': 'National movements, freedom struggle'
    }
  },

  // ===================
  // HIGHER SECONDARY (Class 11-12)
  // ===================
  'physics': {
    base: 'Physics',
    subcategories: {
      'mechanics': 'Motion, laws of motion, work, energy, power',
      'thermodynamics': 'Heat, temperature, laws of thermodynamics',
      'waves': 'Wave motion, sound waves, light waves',
      'optics': 'Ray optics, wave optics, optical instruments',
      'electrostatics': 'Electric charges, fields, potential',
      'current-electricity': 'Current, resistance, circuits',
      'magnetism': 'Magnetic fields, electromagnetic induction',
      'modern-physics': 'Atomic structure, nuclear physics, relativity',
      'semiconductors': 'PN junction, diodes, transistors',
      'communication': 'Communication systems, modulation',
      'rotational-motion': 'Torque, angular momentum, moment of inertia',
      'gravitation': 'Universal gravitation, satellites, escape velocity',
      'fluid-mechanics': 'Pressure, buoyancy, viscosity',
      'kinetic-theory': 'Kinetic theory of gases'
    }
  },
  'chemistry': {
    base: 'Chemistry',
    subcategories: {
      'atomic-structure': 'Atoms, electrons, quantum numbers',
      'chemical-bonding': 'Ionic, covalent, metallic bonds',
      'states-of-matter': 'Solid, liquid, gas properties',
      'thermodynamics-chem': 'Enthalpy, entropy, Gibbs energy',
      'equilibrium': 'Chemical equilibrium, ionic equilibrium',
      'redox-reactions': 'Oxidation, reduction, electrochemistry',
      'organic-chemistry': 'Hydrocarbons, functional groups, reactions',
      'inorganic-chemistry': 'Periodic table, coordination compounds',
      'solutions': 'Concentration, colligative properties',
      'kinetics': 'Rate of reaction, order, molecularity',
      'surface-chemistry': 'Adsorption, catalysis, colloids',
      'polymers': 'Types, properties, applications',
      'biomolecules': 'Carbohydrates, proteins, nucleic acids',
      'd-f-block': 'd and f block elements, transition metals'
    }
  },
  'biology': {
    base: 'Biology',
    subcategories: {
      'cell-biology': 'Cell structure, cell cycle, division',
      'genetics': 'Heredity, DNA, RNA, genetic disorders',
      'evolution': 'Origin of life, natural selection',
      'ecology': 'Ecosystems, food chains, biodiversity',
      'plant-physiology': 'Photosynthesis, respiration, transport',
      'animal-physiology': 'Digestion, circulation, excretion, nervous system',
      'reproduction': 'Plant and human reproduction',
      'biotechnology': 'Genetic engineering, applications',
      'human-health': 'Diseases, immunity, drugs',
      'microorganisms': 'Bacteria, viruses, fungi',
      'plant-anatomy': 'Tissues, organs, morphology',
      'animal-anatomy': 'Tissues, organ systems',
      'molecular-biology': 'DNA replication, transcription, translation'
    }
  },
  'accountancy': {
    base: 'Accountancy',
    subcategories: {
      'accounting-basics': 'Accounting principles, concepts',
      'journal-ledger': 'Journal entries, ledger posting',
      'trial-balance': 'Trial balance preparation',
      'financial-statements': 'Trading, P&L, Balance Sheet',
      'partnership': 'Partnership accounts, admission, retirement',
      'company-accounts': 'Share capital, debentures',
      'cash-flow': 'Cash flow statement preparation',
      'ratio-analysis': 'Financial ratios, analysis',
      'depreciation': 'Methods of depreciation',
      'bank-reconciliation': 'BRS preparation',
      'computerized-accounting': 'Tally, accounting software'
    }
  },
  'business-studies': {
    base: 'Business Studies',
    subcategories: {
      'business-environment': 'Types of business, environment',
      'management': 'Management principles, functions',
      'planning': 'Business planning, decision making',
      'organizing': 'Organization structure, delegation',
      'staffing': 'Recruitment, selection, training',
      'directing': 'Leadership, motivation, communication',
      'controlling': 'Control process, techniques',
      'marketing': 'Marketing mix, advertising, branding',
      'finance': 'Sources of finance, financial markets',
      'consumer-protection': 'Consumer rights, redressal',
      'entrepreneurship': 'Starting a business, startups'
    }
  },
  'economics': {
    base: 'Economics',
    subcategories: {
      'microeconomics': 'Demand, supply, consumer behavior',
      'macroeconomics': 'National income, GDP, inflation',
      'money-banking': 'Money supply, banking system, RBI',
      'international-trade': 'Balance of payments, exchange rates',
      'statistics-economics': 'Statistical tools, index numbers',
      'indian-economy': 'Agriculture, industry, services sector',
      'economic-development': 'Development, planning, policies',
      'market-structures': 'Competition, monopoly, oligopoly',
      'production': 'Production function, costs, revenue',
      'government-budget': 'Types of budget, fiscal policy'
    }
  },
  'computer-science': {
    base: 'Computer Science',
    subcategories: {
      'programming-basics': 'Variables, data types, operators',
      'python': 'Python programming, libraries',
      'java': 'Java programming, OOPs',
      'cpp': 'C++ programming',
      'data-structures': 'Arrays, linked lists, stacks, queues',
      'algorithms': 'Sorting, searching, complexity',
      'databases': 'SQL, DBMS concepts',
      'networking': 'Computer networks, protocols, internet',
      'web-development': 'HTML, CSS, JavaScript basics',
      'cyber-security': 'Security threats, protection',
      'boolean-algebra': 'Logic gates, circuits'
    }
  },

  // ===================
  // COMPETITIVE EXAMS
  // ===================
  'banking': {
    base: 'Banking Awareness',
    subcategories: {
      'banking-terms': 'Banking terminology, concepts',
      'rbi': 'RBI functions, monetary policy',
      'banking-history': 'History of banking in India',
      'financial-institutions': 'NABARD, SIDBI, NHB',
      'banking-reforms': 'Reforms, digitalization',
      'insurance': 'Insurance basics, IRDAI',
      'investment': 'Mutual funds, stocks, bonds',
      'fintech': 'Digital payments, UPI, wallets'
    }
  },
  'ssc': {
    base: 'SSC Specific',
    subcategories: {
      'english-ssc': 'English for SSC exams',
      'maths-ssc': 'Mathematics for SSC',
      'reasoning-ssc': 'Reasoning for SSC',
      'gk-ssc': 'General Knowledge for SSC'
    }
  },
  'gate': {
    base: 'GATE',
    subcategories: {
      'engineering-mathematics': 'Linear algebra, calculus, probability',
      'digital-logic': 'Boolean algebra, combinational circuits',
      'computer-organization': 'CPU, memory, I/O',
      'operating-systems': 'Processes, memory management',
      'dbms': 'Database concepts, SQL, normalization',
      'compiler-design': 'Lexical analysis, parsing, code generation',
      'theory-of-computation': 'Automata, grammars, Turing machines',
      'computer-networks': 'OSI model, TCP/IP, routing'
    }
  },
  'upsc': {
    base: 'UPSC',
    subcategories: {
      'indian-history': 'Ancient, Medieval, Modern India',
      'indian-geography': 'Physical, economic, human geography',
      'indian-polity': 'Constitution, governance, judiciary',
      'indian-economy': 'Economic survey, budget, policies',
      'environment-ecology': 'Biodiversity, climate change',
      'science-technology': 'Space, defense, IT developments',
      'current-affairs': 'National and international events',
      'ethics': 'Ethics, integrity, aptitude'
    }
  },
  'jee': {
    base: 'JEE',
    subcategories: {
      'jee-physics': 'Physics for JEE Main/Advanced',
      'jee-chemistry': 'Chemistry for JEE',
      'jee-mathematics': 'Mathematics for JEE'
    }
  },
  'neet': {
    base: 'NEET',
    subcategories: {
      'neet-physics': 'Physics for NEET',
      'neet-chemistry': 'Chemistry for NEET',
      'neet-biology': 'Biology for NEET'
    }
  },
  'cat': {
    base: 'CAT',
    subcategories: {
      'quant-cat': 'Quantitative Aptitude for CAT',
      'verbal-cat': 'Verbal Ability for CAT',
      'lrdi-cat': 'Logical Reasoning & Data Interpretation'
    }
  }
};

/**
 * Send a chat message to OpenRouter API
 * @param {Array} messages - Array of message objects
 * @param {string} model - Model to use (default: deepseek-r1)
 * @returns {Promise<string>} AI response
 */
async function chat(messages, model = 'deepseek/deepseek-r1-0528:free') {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env');
  }

  try {
    console.log(`🤖 Calling OpenRouter with model: ${model}`);
    
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://dailyqz.vercel.app',
        'X-Title': 'DailyQ Question Generator'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4096
      })
    });

    const responseText = await response.text();
    console.log(`📥 OpenRouter response status: ${response.status}`);

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }
      throw new Error(`OpenRouter API error (${response.status}): ${errorMessage}`);
    }

    const data = JSON.parse(responseText);
    const content = data.choices[0]?.message?.content || '';
    console.log(`✅ OpenRouter response received (${content.length} chars)`);
    return content;
  } catch (error) {
    console.error('❌ OpenRouter chat error:', error.message);
    throw error;
  }
}

/**
 * Parse raw question text into structured format
 * @param {string} rawText - Raw question text
 * @returns {Promise<Object>} Parsed question object
 */
async function parseQuestion(rawText) {
  const prompt = `You are a question parser. Parse the following raw question text into a structured JSON format.

Raw Question:
${rawText}

Return ONLY a valid JSON object with this structure:
{
  "question": "The complete question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0, // Index of correct option (0-3)
  "explanation": "Explanation of the answer",
  "suggestedCategory": "category-slug",
  "suggestedSubcategory": "subcategory-slug",
  "difficulty": "easy|medium|hard"
}

Categories available: quantitative-aptitude, logical-reasoning, verbal-ability, general-knowledge
Analyze the question content to suggest the most appropriate category and subcategory.
If options are labeled A, B, C, D - convert correctAnswer letter to index (A=0, B=1, C=2, D=3).

Return ONLY the JSON object, no additional text.`;

  try {
    const response = await chat([
      { role: 'user', content: prompt }
    ]);

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Parse question error:', error);
    throw error;
  }
}

/**
 * Validate and improve a question using AI
 * @param {Object} question - Question object to validate
 * @returns {Promise<Object>} Validated and improved question
 */
async function validateQuestion(question) {
  const prompt = `You are a question quality checker. Review this MCQ question and improve it if needed.

Question: ${question.question}
Options: ${JSON.stringify(question.options)}
Correct Answer Index: ${question.correctAnswer}
Explanation: ${question.explanation || 'None provided'}

Tasks:
1. Check if the question is clear and grammatically correct
2. Verify all 4 options are distinct and plausible
3. Confirm the correct answer index is valid (0-3)
4. Improve explanation if missing or unclear
5. Suggest appropriate difficulty level

Return ONLY a valid JSON object:
{
  "question": "Improved question text",
  "options": ["Improved A", "Improved B", "Improved C", "Improved D"],
  "correctAnswer": 0,
  "explanation": "Clear explanation",
  "difficulty": "easy|medium|hard",
  "isValid": true,
  "improvements": ["List of improvements made"]
}`;

  try {
    const response = await chat([
      { role: 'user', content: prompt }
    ]);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { ...question, isValid: true, improvements: [] };
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Validate question error:', error);
    return { ...question, isValid: true, improvements: [] };
  }
}

/**
 * Generate questions for a specific category using AI
 * @param {Object} config - Generation configuration
 * @returns {Promise<Array>} Generated questions
 */
async function generateQuestions(config) {
  const { category, subcategory, difficulty = 'medium', count = 5 } = config;

  const categoryConfig = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS['quantitative-aptitude'];
  const topicDescription = categoryConfig.subcategories[subcategory] || categoryConfig.base;

  const difficultyGuidelines = {
    easy: 'Basic concepts, straightforward calculations, single-step problems',
    medium: 'Multi-step problems, moderate complexity, requires good understanding',
    hard: 'Complex problems, multiple concepts combined, requires deep thinking'
  };

  const prompt = `Generate ${count} high-quality MCQ questions for competitive exams.

Topic: ${categoryConfig.base} - ${topicDescription}
Difficulty: ${difficulty} - ${difficultyGuidelines[difficulty]}

STRICT RULES:
1. Each question must have exactly 4 options
2. Every question MUST be strictly about "${topicDescription}" — do NOT generate questions about other subjects or topics
3. Each question must be completely unique and different from every other question in this set
4. Do NOT repeat similar question patterns or rephrase the same concept
5. Include clear explanation for each answer
6. Questions should test real understanding, not just memorization
7. Ensure mathematical accuracy for quantitative questions
8. Cover diverse aspects and subtopics within "${topicDescription}"

Return ONLY a valid JSON array:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation"
  }
]

Generate exactly ${count} unique questions about ${topicDescription} ONLY. Return ONLY the JSON array.`;

  try {
    const response = await chat([
      { role: 'user', content: prompt }
    ]);

    // Extract and safely parse JSON array from response
    const questions = safeParseJSON(response);
    if (!Array.isArray(questions)) {
      throw new Error('AI response did not contain a valid JSON array');
    }
    
    return questions.map(q => ({
      ...q,
      category,
      subcategory,
      difficulty,
      source: 'openrouter-deepseek'
    }));
  } catch (error) {
    console.error('Generate questions error:', error);
    throw error;
  }
}

/**
 * Categorize a question based on its content
 * @param {string} questionText - The question to categorize
 * @returns {Promise<Object>} Category suggestion
 */
async function categorizeQuestion(questionText) {
  const categoriesInfo = Object.entries(CATEGORY_PROMPTS).map(([key, value]) => {
    return `${key}: ${value.base} - Topics: ${Object.keys(value.subcategories).join(', ')}`;
  }).join('\n');

  const prompt = `Analyze this question and suggest the most appropriate category and subcategory.

Question: ${questionText}

Available Categories:
${categoriesInfo}

Return ONLY a valid JSON object:
{
  "category": "category-slug",
  "subcategory": "subcategory-slug",
  "confidence": 0.95,
  "reasoning": "Brief explanation"
}`;

  try {
    const response = await chat([
      { role: 'user', content: prompt }
    ]);

    return safeParseJSON(response);
  } catch (error) {
    console.error('Categorize question error:', error);
    return { category: 'quantitative-aptitude', subcategory: 'general', confidence: 0.5 };
  }
}

/**
 * Batch process multiple questions
 * @param {Array} questions - Array of raw question texts
 * @returns {Promise<Array>} Processed questions
 */
async function batchProcessQuestions(questions) {
  const results = [];
  
  for (const rawText of questions) {
    try {
      const parsed = await parseQuestion(rawText);
      const validated = await validateQuestion(parsed);
      results.push({
        ...validated,
        status: 'success'
      });
    } catch (error) {
      results.push({
        rawText,
        status: 'error',
        error: error.message
      });
    }
  }

  return results;
}

module.exports = {
  chat,
  parseQuestion,
  validateQuestion,
  generateQuestions,
  categorizeQuestion,
  batchProcessQuestions,
  CATEGORY_PROMPTS
};
