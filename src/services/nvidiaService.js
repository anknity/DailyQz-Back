const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { safeParseJSON } = require('../utils/jsonSanitizer');

/**
 * NVIDIA NIM AI Service for Question Generation
 * Uses NVIDIA's NIM API for intelligent question processing
 */

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

// Log API key status at startup
if (!NVIDIA_API_KEY) {
  console.warn('⚠️ NVIDIA API key not found in environment variables');
} else {
  console.log('✅ NVIDIA API key loaded successfully');
}

/**
 * Send a chat message to NVIDIA NIM API
 * @param {Array} messages - Array of message objects
 * @param {string} model - Model to use (default: meta/llama-3.1-70b-instruct)
 * @returns {Promise<string>} AI response
 */
async function chat(messages, model = 'meta/llama-3.1-70b-instruct') {
  if (!NVIDIA_API_KEY) {
    throw new Error('NVIDIA API key not configured. Please set NVIDIA_API_KEY in .env');
  }

  try {
    console.log(`🤖 Calling NVIDIA NIM with model: ${model}`);

    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.9
      })
    });

    const responseText = await response.text();
    console.log(`📥 NVIDIA NIM response status: ${response.status}`);

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error?.message || errorData.detail || errorMessage;
      } catch (e) {}
      throw new Error(`NVIDIA NIM API error (${response.status}): ${errorMessage}`);
    }

    const data = JSON.parse(responseText);
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in NVIDIA NIM response');
    }

    // Strip any thinking tags if present
    const cleanedContent = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    return cleanedContent;
  } catch (error) {
    console.error('❌ NVIDIA NIM API error:', error.message);
    throw error;
  }
}

/**
 * Parse a raw question text into structured format using AI
 * @param {string} rawText - Raw question text
 * @returns {Promise<Object>} Parsed question object
 */
async function parseQuestion(rawText) {
  const prompt = `Parse this raw question text into a structured MCQ format.

Raw text:
${rawText}

Return ONLY a valid JSON object:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Explanation for the correct answer",
  "category": "suggested-category",
  "difficulty": "easy|medium|hard"
}`;

  try {
    const response = await chat([
      { role: 'user', content: prompt }
    ]);

    return safeParseJSON(response);
  } catch (error) {
    console.error('Parse question error:', error);
    throw error;
  }
}

/**
 * Validate and improve a question using AI
 * @param {Object} question - Question object to validate
 * @returns {Promise<Object>} Validated question with improvements
 */
async function validateQuestion(question) {
  const prompt = `Validate this MCQ question and suggest improvements.

Question: ${JSON.stringify(question)}

Check for:
1. Clarity and grammar
2. Correct answer accuracy
3. Option quality (no obviously wrong/right answers)
4. Appropriate difficulty level

Return ONLY a valid JSON object:
{
  "isValid": true/false,
  "improvements": ["improvement1", "improvement2"],
  "improvedQuestion": { ...improved question object },
  "score": 0-100
}`;

  try {
    const response = await chat([
      { role: 'user', content: prompt }
    ]);

    return safeParseJSON(response);
  } catch (error) {
    console.error('Validate question error:', error);
    return { ...question, isValid: true, improvements: [], score: 70 };
  }
}

/**
 * Generate questions for a specific category using NVIDIA AI
 * @param {Object} config - Generation configuration
 * @returns {Promise<Array>} Generated questions
 */
async function generateQuestions(config) {
  const { category, subcategory, difficulty = 'medium', count = 5 } = config;

  const difficultyGuidelines = {
    easy: 'Basic concepts, straightforward calculations, single-step problems',
    medium: 'Multi-step problems, moderate complexity, requires good understanding',
    hard: 'Complex problems, multiple concepts combined, requires deep thinking'
  };

  const prompt = `Generate ${count} high-quality MCQ questions for competitive exams.

Topic: ${category} - ${subcategory || 'General'}
Difficulty: ${difficulty} - ${difficultyGuidelines[difficulty]}

Requirements:
1. Each question must have exactly 4 options
2. Questions should be unique and exam-worthy
3. Include clear explanation for each answer
4. Questions should test real understanding, not just memorization
5. Ensure mathematical accuracy for quantitative questions

Return ONLY a valid JSON array:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation"
  }
]

Generate exactly ${count} questions. Return ONLY the JSON array.`;

  try {
    const response = await chat([
      { role: 'user', content: prompt }
    ]);

    const questions = safeParseJSON(response);
    if (!Array.isArray(questions)) {
      throw new Error('AI response did not contain a valid JSON array');
    }

    return questions.map(q => ({
      ...q,
      category,
      subcategory,
      difficulty,
      source: 'nvidia-nim'
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
  const prompt = `Analyze this question and suggest the most appropriate category and subcategory for an educational quiz platform.

Question: ${questionText}

Common categories include: quantitative-aptitude, logical-reasoning, web-development, dsa, neet, general-knowledge, english, data-science, networking, sports

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

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { category: 'quantitative-aptitude', subcategory: 'general', confidence: 0.5 };
    }

    return safeParseJSON(jsonMatch[0]);
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
  batchProcessQuestions
};
