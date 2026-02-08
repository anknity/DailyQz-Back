const { supabaseAdmin } = require('../config/supabase');

/**
 * Supabase DSA Service
 * Handles DSA problems and submissions
 */

class SupabaseDSAService {
  
  /**
   * Create a new DSA problem
   * @param {Object} problemData - Problem details
   * @returns {Promise<Object>} Created problem
   */
  async createProblem(problemData) {
    const {
      title,
      slug,
      description,
      difficulty,
      topics,
      examples,
      constraints,
      starterCode,
      testCases,
      hiddenTestCases,
      companies
    } = problemData;

    const { data, error } = await supabaseAdmin
      .from('dsa_problems')
      .insert({
        title,
        slug,
        description,
        difficulty,
        topics: JSON.stringify(topics || []),
        examples: JSON.stringify(examples),
        constraints,
        starter_code: JSON.stringify(starterCode || {}),
        test_cases: JSON.stringify(testCases),
        hidden_test_cases: JSON.stringify(hiddenTestCases || []),
        companies: JSON.stringify(companies || [])
      })
      .select()
      .single();

    if (error) throw error;
    return this.parseProblem(data);
  }

  /**
   * Get all DSA problems with filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} List of problems
   */
  async getProblems(filters = {}) {
    let query = supabaseAdmin.from('dsa_problems').select('*');

    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters.topic) {
      query = query.contains('topics', [filters.topic]);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return data.map(p => this.parseProblem(p));
  }

  /**
   * Get problem by ID or slug
   * @param {string} identifier - Problem ID or slug
   * @returns {Promise<Object>} Problem details
   */
  async getProblem(identifier) {
    // Try by ID first
    let query = supabaseAdmin
      .from('dsa_problems')
      .select('*');

    // Check if it's a UUID
    if (identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      query = query.eq('id', identifier);
    } else {
      query = query.eq('slug', identifier);
    }

    const { data, error } = await query.single();
    if (error) throw error;

    return this.parseProblem(data);
  }

  /**
   * Submit a solution
   * @param {Object} submissionData - Submission details
   * @returns {Promise<Object>} Created submission
   */
  async submitSolution(submissionData) {
    const {
      userId,
      problemId,
      code,
      language,
      status,
      runtimeMs,
      memoryKb,
      testCasesPassed,
      totalTestCases,
      errorMessage
    } = submissionData;

    const { data, error } = await supabaseAdmin
      .from('dsa_submissions')
      .insert({
        user_id: userId,
        problem_id: problemId,
        code,
        language,
        status,
        runtime_ms: runtimeMs,
        memory_kb: memoryKb,
        test_cases_passed: testCasesPassed,
        total_test_cases: totalTestCases,
        error_message: errorMessage
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get user submissions for a problem
   * @param {string} userId - User ID
   * @param {string} problemId - Problem ID
   * @returns {Promise<Array>} User's submissions
   */
  async getUserSubmissions(userId, problemId = null) {
    let query = supabaseAdmin
      .from('dsa_submissions')
      .select(`
        *,
        dsa_problems (
          title,
          slug,
          difficulty
        )
      `)
      .eq('user_id', userId);

    if (problemId) {
      query = query.eq('problem_id', problemId);
    }

    query = query.order('submitted_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Get user's solved problems
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Solved problems
   */
  async getUserSolvedProblems(userId) {
    const { data, error } = await supabaseAdmin
      .from('user_solved_problems')
      .select(`
        *,
        dsa_problems (
          id,
          title,
          slug,
          difficulty,
          topics
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(item => ({
      ...item,
      dsa_problems: this.parseProblem(item.dsa_problems)
    }));
  }

  /**
   * Get problem statistics
   * @param {string} problemId - Problem ID
   * @returns {Promise<Object>} Problem stats
   */
  async getProblemStats(problemId) {
    const { data: problem } = await supabaseAdmin
      .from('dsa_problems')
      .select('total_submissions, total_accepted, acceptance_rate')
      .eq('id', problemId)
      .single();

    const { data: submissions } = await supabaseAdmin
      .from('dsa_submissions')
      .select('status, runtime_ms')
      .eq('problem_id', problemId);

    const statusDistribution = {};
    submissions?.forEach(s => {
      statusDistribution[s.status] = (statusDistribution[s.status] || 0) + 1;
    });

    return {
      ...problem,
      statusDistribution,
      totalSubmissions: submissions?.length || 0
    };
  }

  /**
   * Update problem
   * @param {string} problemId - Problem ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated problem
   */
  async updateProblem(problemId, updates) {
    const updateData = { ...updates };

    // Convert arrays to JSON strings
    ['topics', 'examples', 'starter_code', 'test_cases', 'hidden_test_cases', 'companies'].forEach(field => {
      if (updates[field]) {
        updateData[field] = JSON.stringify(updates[field]);
      }
    });

    const { data, error } = await supabaseAdmin
      .from('dsa_problems')
      .update(updateData)
      .eq('id', problemId)
      .select()
      .single();

    if (error) throw error;
    return this.parseProblem(data);
  }

  /**
   * Delete problem
   * @param {string} problemId - Problem ID
   * @returns {Promise<void>}
   */
  async deleteProblem(problemId) {
    const { error } = await supabaseAdmin
      .from('dsa_problems')
      .delete()
      .eq('id', problemId);

    if (error) throw error;
  }

  /**
   * Get DSA leaderboard
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Top performers
   */
  async getDSALeaderboard(filters = {}) {
    let query = supabaseAdmin
      .from('user_stats')
      .select(`
        *,
        users (
          id,
          display_name,
          email,
          avatar_url
        )
      `)
      .gt('total_dsa_solved', 0);

    if (filters.limit) {
      query = query.limit(filters.limit);
    } else {
      query = query.limit(100);
    }

    query = query.order('total_dsa_solved', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  /**
   * Helper: Parse problem JSON fields
   */
  parseProblem(problem) {
    if (!problem) return null;

    return {
      ...problem,
      topics: typeof problem.topics === 'string' ? JSON.parse(problem.topics) : problem.topics,
      examples: typeof problem.examples === 'string' ? JSON.parse(problem.examples) : problem.examples,
      starter_code: typeof problem.starter_code === 'string' ? JSON.parse(problem.starter_code) : problem.starter_code,
      test_cases: typeof problem.test_cases === 'string' ? JSON.parse(problem.test_cases) : problem.test_cases,
      hidden_test_cases: typeof problem.hidden_test_cases === 'string' ? JSON.parse(problem.hidden_test_cases) : problem.hidden_test_cases,
      companies: typeof problem.companies === 'string' ? JSON.parse(problem.companies) : problem.companies
    };
  }
}

module.exports = new SupabaseDSAService();
