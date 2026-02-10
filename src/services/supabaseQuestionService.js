const { supabaseAdmin } = require('../config/supabase');

/**
 * Supabase Question Service
 * Handles question bank and question management
 */

class SupabaseQuestionService {
  
  /**
   * Add question to question bank
   * @param {Object} questionData - Question details
   * @returns {Promise<Object>} Created question
   */
  async addToQuestionBank(questionData) {
    const {
      questionText,
      options,
      correctAnswer,
      subject,
      category,
      difficulty,
      source,
      sourceFile,
      isApproved,
      approvedBy
    } = questionData;

    const { data, error } = await supabaseAdmin
      .from('question_bank')
      .insert({
        question_text: questionText,
        options: JSON.stringify(options),
        correct_answer: correctAnswer,
        subject,
        category,
        difficulty: difficulty || 'medium',
        source: source || 'manual',
        source_file: sourceFile,
        is_approved: isApproved || false,
        approved_by: approvedBy
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Bulk add questions to question bank
   * @param {Array} questions - Array of question objects
   * @param {Object} metadata - Common metadata for all questions
   * @returns {Promise<Array>} Created questions
   */
  async bulkAddToQuestionBank(questions, metadata = {}) {
    const formattedQuestions = questions.map(q => ({
      question_text: q.questionText || q.question || q.text,
      options: JSON.stringify(q.options),
      correct_answer: q.correctAnswer,
      subject: q.subject || metadata.subject,
      category: q.category || metadata.category,
      difficulty: q.difficulty || metadata.difficulty || 'medium',
      source: metadata.source || 'bulk_upload',
      source_file: metadata.sourceFile,
      is_approved: metadata.isApproved || false,
      approved_by: metadata.approvedBy
    }));

    const { data, error } = await supabaseAdmin
      .from('question_bank')
      .insert(formattedQuestions)
      .select();

    if (error) throw error;
    return data;
  }

  /**
   * Get questions from question bank with filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Filtered questions
   */
  async getQuestionsFromBank(filters = {}) {
    let query = supabaseAdmin.from('question_bank').select('*');

    if (filters.subject) {
      query = query.eq('subject', filters.subject);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters.isApproved !== undefined) {
      query = query.eq('is_approved', filters.isApproved);
    }
    if (filters.source) {
      query = query.eq('source', filters.source);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    // Parse options JSON
    return data.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));
  }

  /**
   * Approve a question
   * @param {string} questionId - Question ID
   * @param {string} approvedBy - User ID who approved (Firebase UID)
   * @returns {Promise<Object>} Updated question
   */
  async approveQuestion(questionId, approvedBy) {
    const { data, error } = await supabaseAdmin
      .from('question_bank')
      .update({
        is_approved: true,
        // Store Firebase UID as text in a separate field or skip if column is UUID
        approved_at: new Date().toISOString()
      })
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Bulk approve pending questions
   * @param {string} approvedBy - User ID who approved (Firebase UID)
   * @param {Object} filters - Filter criteria for which questions to approve
   * @returns {Promise<Object>} Result with count of approved questions
   */
  async bulkApproveQuestions(approvedBy, filters = {}) {
    let query = supabaseAdmin
      .from('question_bank')
      .update({
        is_approved: true,
        // Skip approved_by as Supabase expects UUID but Firebase uses different format
        approved_at: new Date().toISOString()
      })
      .eq('is_approved', false); // Only approve pending questions

    // Apply filters if provided
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.subject) {
      query = query.eq('subject', filters.subject);
    }
    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters.source) {
      query = query.eq('source', filters.source);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query.select();

    if (error) throw error;
    
    return {
      count: data?.length || 0,
      questions: data
    };
  }

  /**
   * Update a question
   * @param {string} questionId - Question ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated question
   */
  async updateQuestion(questionId, updates) {
    const updateData = { ...updates };
    
    // Convert options to JSON string if it's an array
    if (updates.options && Array.isArray(updates.options)) {
      updateData.options = JSON.stringify(updates.options);
    }

    const { data, error } = await supabaseAdmin
      .from('question_bank')
      .update(updateData)
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a question
   * @param {string} questionId - Question ID
   * @returns {Promise<void>}
   */
  async deleteQuestion(questionId) {
    const { error } = await supabaseAdmin
      .from('question_bank')
      .delete()
      .eq('id', questionId);

    if (error) throw error;
  }

  /**
   * Get random questions from bank for exam creation
   * Smart matching: handles compound categories (e.g., 'nimcet-math') and
   * flexible subject matching (e.g., 'mathematics' matches 'nimcet-math-calculus')
   * @param {Object} criteria - Selection criteria
   * @returns {Promise<Array>} Random questions
   */
  async getRandomQuestions(criteria) {
    const {
      count = 10,
      subject,
      category,
      difficulty,
      onlyApproved = false
    } = criteria;

    let query = supabaseAdmin
      .from('question_bank')
      .select('*');

    if (onlyApproved) {
      query = query.eq('is_approved', true);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    // Smart category matching
    // Frontend sends category like 'nimcet-math' but DB stores category as 'nimcet'
    // So for compound categories, try both exact match AND base category
    if (category) {
      const parts = category.split('-');
      if (parts.length > 1) {
        // Compound category: 'nimcet-math' → try exact 'nimcet-math' OR base 'nimcet'
        query = query.or(`category.eq.${category},category.eq.${parts[0]}`);
      } else {
        query = query.eq('category', category);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    if (!data || data.length === 0) {
      console.log(`[QuestionService] No questions found for category='${category}'`);
      return [];
    }

    // Smart subject filtering in JavaScript for flexible matching
    // This handles mismatches like:
    //   subject='calculus' matching DB 'nimcet-math-calculus'
    //   subject='mathematics' matching DB 'nimcet-math-*' (word-prefix match)
    //   category='nimcet-math' matching DB subjects starting with 'nimcet-math'
    let filtered = data;

    if (subject || (category && category.includes('-'))) {
      const normalizedSubject = subject ? subject.toLowerCase().trim() : '';
      const categoryPrefix = category ? category.toLowerCase().trim() : '';

      filtered = data.filter(q => {
        const dbSubject = (q.subject || '').toLowerCase();

        // Strategy 1: DB subject contains the search subject literally
        // e.g., 'nimcet-math-calculus' contains 'calculus'
        if (normalizedSubject && dbSubject.includes(normalizedSubject)) return true;

        // Strategy 2: For compound categories (e.g., 'nimcet-math'),
        // match subjects that start with the category prefix
        // e.g., 'nimcet-math-calculus' starts with 'nimcet-math'
        if (categoryPrefix.includes('-') && dbSubject.startsWith(categoryPrefix)) return true;

        // Strategy 3: Word-prefix matching for abbreviation handling
        // e.g., subject='mathematics' → word 'mathematics' prefix-matches 'math'
        //        in DB subject 'nimcet-math-calculus'
        // e.g., subject='analytical reasoning' → word 'reasoning' prefix-matches
        //        'reasoning' in DB subject 'nimcet-reasoning-puzzles'
        if (normalizedSubject) {
          const searchWords = normalizedSubject.split(/[\s&,]+/).filter(w => w.length >= 3);
          const dbWords = dbSubject.split(/[-\s]+/).filter(w => w.length >= 3);

          for (const sw of searchWords) {
            for (const dw of dbWords) {
              const minLen = Math.min(4, Math.min(sw.length, dw.length));
              if (sw.substring(0, minLen) === dw.substring(0, minLen)) {
                return true;
              }
            }
          }
        }

        return false;
      });

      // Fallback: if no subject match found, return from broader category
      // so users still get questions even with naming mismatches
      if (filtered.length === 0) {
        console.log(`[QuestionService] No subject match for '${subject}' in category '${category}', using all ${data.length} category questions as fallback`);
        filtered = data;
      } else {
        console.log(`[QuestionService] Matched ${filtered.length} questions for category='${category}' subject='${subject}'`);
      }
    }

    // Shuffle and pick random questions
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    // Parse options
    return selected.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));
  }

  /**
   * Get question statistics by category/subject
   * @returns {Promise<Object>} Statistics
   */
  async getQuestionStats() {
    const { data, error } = await supabaseAdmin
      .from('question_bank')
      .select('category, subject, difficulty, is_approved');

    if (error) throw error;

    const stats = {
      total: data.length,
      approved: data.filter(q => q.is_approved).length,
      pending: data.filter(q => !q.is_approved).length,
      byCategory: {},
      bySubject: {},
      byDifficulty: {
        easy: data.filter(q => q.difficulty === 'easy').length,
        medium: data.filter(q => q.difficulty === 'medium').length,
        hard: data.filter(q => q.difficulty === 'hard').length
      }
    };

    // Count by category
    data.forEach(q => {
      if (q.category) {
        stats.byCategory[q.category] = (stats.byCategory[q.category] || 0) + 1;
      }
      if (q.subject) {
        stats.bySubject[q.subject] = (stats.bySubject[q.subject] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Search questions by text
   * @param {string} searchText - Text to search for
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Matching questions
   */
  async searchQuestions(searchText, filters = {}) {
    let query = supabaseAdmin
      .from('question_bank')
      .select('*')
      .ilike('question_text', `%${searchText}%`);

    if (filters.subject) {
      query = query.eq('subject', filters.subject);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));
  }
}

module.exports = new SupabaseQuestionService();
