const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { generateDSAProblem } = require('../services/groqService');
const supabaseDSAService = require('../services/supabaseDSAService');

// In-memory storage for DSA problems (replace with database in production)
let dsaProblems = [
  {
    id: 'two-sum',
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    topic: 'Arrays',
    category: 'arrays',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' }
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Only one valid answer exists.'],
    hints: ['Use a hash map to store numbers you have seen', 'For each number, check if target - number exists in the map'],
    starterCode: {
      javascript: 'function twoSum(nums, target) {\n  // Your code here\n}',
      python: 'def twoSum(nums, target):\n    # Your code here\n    pass',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n    }\n}',
      cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your code here\n    }\n};'
    },
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false },
      { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: true }
    ],
    acceptance: 49.2,
    submissions: 15420,
    solved: 7592
  },
  {
    id: 'reverse-linked-list',
    slug: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    topic: 'Linked Lists',
    category: 'linked-lists',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: 'The list is reversed.' },
      { input: 'head = [1,2]', output: '[2,1]', explanation: '' }
    ],
    constraints: ['The number of nodes in the list is the range [0, 5000]', '-5000 <= Node.val <= 5000'],
    hints: ['Use three pointers: prev, current, and next', 'Iterate through the list and reverse pointers'],
    starterCode: {
      javascript: 'function reverseList(head) {\n  // Your code here\n}',
      python: 'def reverseList(head):\n    # Your code here\n    pass',
      java: 'class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Your code here\n    }\n}',
      cpp: 'class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Your code here\n    }\n};'
    },
    testCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', isHidden: false },
      { input: '[1,2]', expectedOutput: '[2,1]', isHidden: false },
      { input: '[]', expectedOutput: '[]', isHidden: true }
    ],
    acceptance: 72.5,
    submissions: 8930,
    solved: 6474
  },
  {
    id: 'valid-parentheses',
    slug: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topic: 'Stacks',
    category: 'stacks-queues',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    examples: [
      { input: 's = "()"', output: 'true', explanation: '' },
      { input: 's = "()[]{}"', output: 'true', explanation: '' },
      { input: 's = "(]"', output: 'false', explanation: '' }
    ],
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only \'()[]{}\''],
    hints: ['Use a stack to keep track of opening brackets', 'When you see a closing bracket, check if it matches the top of the stack'],
    starterCode: {
      javascript: 'function isValid(s) {\n  // Your code here\n}',
      python: 'def isValid(s):\n    # Your code here\n    pass',
      java: 'class Solution {\n    public boolean isValid(String s) {\n        // Your code here\n    }\n}',
      cpp: 'class Solution {\npublic:\n    bool isValid(string s) {\n        // Your code here\n    }\n};'
    },
    testCases: [
      { input: '"()"', expectedOutput: 'true', isHidden: false },
      { input: '"()[]{}"', expectedOutput: 'true', isHidden: false },
      { input: '"(]"', expectedOutput: 'false', isHidden: true }
    ],
    acceptance: 40.1,
    submissions: 12340,
    solved: 4948
  }
];

// In-memory storage for submissions
let dsaSubmissions = [];

/**
 * @route   GET /api/v2/dsa/problems
 * @desc    Get all DSA problems with optional filters
 * @access  Private
 */
router.get('/problems', verifyToken, async (req, res) => {
  try {
    const { topic, difficulty, category, search, page = 1, limit = 20 } = req.query;

    let filtered = [...dsaProblems];

    // Apply filters
    if (topic) {
      filtered = filtered.filter(p => p.topic.toLowerCase() === topic.toLowerCase());
    }
    if (difficulty) {
      filtered = filtered.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
    }
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginated = filtered.slice(startIndex, endIndex);

    // Add user's solved status
    const userId = req.user.uid;
    const userSubmissions = dsaSubmissions.filter(s => s.userId === userId && s.status === 'Accepted');
    const solvedIds = new Set(userSubmissions.map(s => s.problemId));

    const problemsWithStatus = paginated.map(p => ({
      ...p,
      solved: solvedIds.has(p.id)
    }));

    res.json({
      success: true,
      data: problemsWithStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filtered.length,
        pages: Math.ceil(filtered.length / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching DSA problems:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problems'
    });
  }
});

/**
 * @route   GET /api/v2/dsa/problems/:slug
 * @desc    Get a single DSA problem by slug
 * @access  Private
 */
router.get('/problems/:slug', verifyToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const problem = dsaProblems.find(p => p.slug === slug);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Check if user has solved this problem
    const userId = req.user.uid;
    const userSubmission = dsaSubmissions.find(
      s => s.userId === userId && s.problemId === problem.id && s.status === 'Accepted'
    );

    res.json({
      success: true,
      data: {
        ...problem,
        solved: !!userSubmission
      }
    });

  } catch (error) {
    console.error('Error fetching DSA problem:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problem'
    });
  }
});

/**
 * @route   POST /api/v2/dsa/run
 * @desc    Run code against test cases (without submission)
 * @access  Private
 */
router.post('/run', verifyToken, async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    if (!problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Problem ID, code, and language are required'
      });
    }

    const problem = dsaProblems.find(p => p.id === problemId || p.slug === problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Get visible test cases only
    const visibleTestCases = problem.testCases.filter(tc => !tc.isHidden);

    // Simulate code execution (in production, use a code execution service like Judge0)
    // For now, we'll return mock results
    const results = visibleTestCases.map((tc, index) => ({
      testCase: index + 1,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: tc.expectedOutput, // Mock: always correct for demo
      passed: true, // Mock: always pass for demo
      runtime: Math.floor(Math.random() * 100) + 10,
      memory: Math.floor(Math.random() * 10) + 5
    }));

    res.json({
      success: true,
      data: {
        results,
        passed: results.filter(r => r.passed).length,
        total: results.length,
        runtime: `${Math.floor(Math.random() * 100) + 50} ms`,
        memory: `${(Math.random() * 10 + 40).toFixed(1)} MB`
      }
    });

  } catch (error) {
    console.error('Error running code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run code'
    });
  }
});

/**
 * @route   POST /api/v2/dsa/submit
 * @desc    Submit code solution
 * @access  Private
 */
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user.uid;

    if (!problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Problem ID, code, and language are required'
      });
    }

    const problem = dsaProblems.find(p => p.id === problemId || p.slug === problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // Run against all test cases (including hidden)
    const allTestCases = problem.testCases;
    
    // Simulate code execution
    const results = allTestCases.map((tc, index) => ({
      testCase: index + 1,
      passed: Math.random() > 0.2, // 80% pass rate for demo
      isHidden: tc.isHidden
    }));

    const passedCount = results.filter(r => r.passed).length;
    const allPassed = passedCount === results.length;
    const status = allPassed ? 'Accepted' : 'Wrong Answer';
    const runtime = `${Math.floor(Math.random() * 100) + 50} ms`;
    const memory = `${(Math.random() * 10 + 40).toFixed(1)} MB`;

    // Create submission record
    const submission = {
      id: `sub-${Date.now()}`,
      userId,
      problemId: problem.id,
      code,
      language,
      status,
      runtime,
      memory,
      passedTestCases: passedCount,
      totalTestCases: results.length,
      submittedAt: new Date().toISOString()
    };

    dsaSubmissions.push(submission);

    // Update problem stats
    problem.submissions = (problem.submissions || 0) + 1;
    if (allPassed) {
      problem.solved = (problem.solved || 0) + 1;
    }

    res.json({
      success: true,
      data: {
        submissionId: submission.id,
        status,
        runtime,
        memory,
        passedTestCases: passedCount,
        totalTestCases: results.length,
        results: results.map(r => ({
          testCase: r.testCase,
          passed: r.passed,
          isHidden: r.isHidden
        }))
      }
    });

  } catch (error) {
    console.error('Error submitting code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit code'
    });
  }
});

/**
 * @route   GET /api/v2/dsa/submissions
 * @desc    Get user's submission history
 * @access  Private
 */
router.get('/submissions', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { problemId, page = 1, limit = 20 } = req.query;

    let userSubmissions = dsaSubmissions.filter(s => s.userId === userId);
    
    if (problemId) {
      userSubmissions = userSubmissions.filter(s => s.problemId === problemId);
    }

    // Sort by submission time (newest first)
    userSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginated = userSubmissions.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: userSubmissions.length,
        pages: Math.ceil(userSubmissions.length / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    });
  }
});

/**
 * @route   GET /api/v2/dsa/leaderboard
 * @desc    Get DSA leaderboard with user details from both in-memory and Supabase
 * @access  Private
 */
router.get('/leaderboard', verifyToken, async (req, res) => {
  try {
    const { period = 'all-time', limit = 20 } = req.query;
    const { db } = require('../config/firebase');
    const { supabaseAdmin } = require('../config/supabase');

    // Aggregate in-memory submissions by user
    const userStats = {};
    
    dsaSubmissions.forEach(sub => {
      if (sub.status === 'Accepted') {
        if (!userStats[sub.userId]) {
          userStats[sub.userId] = {
            solvedProblems: new Set(),
            totalSubmissions: 0,
            easy: 0,
            medium: 0,
            hard: 0
          };
        }
        userStats[sub.userId].solvedProblems.add(sub.problemId);
        userStats[sub.userId].totalSubmissions++;
        
        const problem = dsaProblems.find(p => p.id === sub.problemId);
        if (problem) {
          const diff = problem.difficulty.toLowerCase();
          if (diff === 'easy') userStats[sub.userId].easy++;
          else if (diff === 'medium') userStats[sub.userId].medium++;
          else if (diff === 'hard') userStats[sub.userId].hard++;
        }
      }
    });

    // Also try to get Supabase DSA submissions
    try {
      const { data: dbSubmissions } = await supabaseAdmin
        .from('dsa_submissions')
        .select('user_id, problem_id, status, created_at')
        .eq('status', 'Accepted');

      if (dbSubmissions && dbSubmissions.length > 0) {
        // Get problem details for difficulty mapping
        const { data: dbProblems } = await supabaseAdmin
          .from('dsa_problems')
          .select('id, difficulty');
        
        const problemDiffMap = {};
        (dbProblems || []).forEach(p => { problemDiffMap[p.id] = p.difficulty; });

        dbSubmissions.forEach(sub => {
          // Use a prefixed key to differentiate from Firebase UIDs
          const key = `supa_${sub.user_id}`;
          if (!userStats[key]) {
            userStats[key] = {
              supabaseUserId: sub.user_id,
              solvedProblems: new Set(),
              totalSubmissions: 0,
              easy: 0,
              medium: 0,
              hard: 0
            };
          }
          userStats[key].solvedProblems.add(sub.problem_id);
          userStats[key].totalSubmissions++;
          const diff = (problemDiffMap[sub.problem_id] || 'medium').toLowerCase();
          if (diff === 'easy') userStats[key].easy++;
          else if (diff === 'medium') userStats[key].medium++;
          else if (diff === 'hard') userStats[key].hard++;
        });
      }
    } catch (e) {
      // Supabase DSA tables may not exist, continue with in-memory
    }

    // Convert to leaderboard format
    let leaderboard = Object.entries(userStats)
      .map(([userId, stats]) => ({
        userId: userId.startsWith('supa_') ? userId.slice(5) : userId,
        isSupabaseUser: userId.startsWith('supa_'),
        supabaseUserId: stats.supabaseUserId || null,
        problemsSolved: stats.solvedProblems.size,
        totalSubmissions: stats.totalSubmissions,
        easy: stats.easy,
        medium: stats.medium,
        hard: stats.hard,
        score: stats.solvedProblems.size * 10 + stats.easy + stats.medium * 2 + stats.hard * 3
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit));

    // Enrich with user details
    const enrichedLeaderboard = await Promise.all(
      leaderboard.map(async (entry, index) => {
        let name = 'Anonymous';
        let photoURL = null;

        // Try Firebase first for Firebase UIDs
        if (!entry.isSupabaseUser) {
          try {
            const userDoc = await db.collection('users').doc(entry.userId).get();
            if (userDoc.exists) {
              const data = userDoc.data();
              name = data.name || data.displayName || 'Anonymous';
              photoURL = data.photoURL || null;
            }
          } catch (e) { /* ignore */ }
        }

        // Try Supabase for Supabase users
        if (entry.isSupabaseUser || name === 'Anonymous') {
          try {
            const lookupId = entry.supabaseUserId || entry.userId;
            const { data: user } = await supabaseAdmin
              .from('users')
              .select('display_name, avatar_url, email, firebase_uid')
              .eq('id', lookupId)
              .single();
            if (user) {
              name = user.display_name || user.email?.split('@')[0] || name;
              photoURL = user.avatar_url || photoURL;
              entry.userId = user.firebase_uid || entry.userId;
            }
          } catch (e) { /* ignore */ }
        }

        return {
          rank: index + 1,
          id: entry.userId,
          uid: entry.userId,
          name,
          displayName: name,
          photoURL,
          problemsSolved: entry.problemsSolved,
          totalSubmissions: entry.totalSubmissions,
          easy: entry.easy,
          medium: entry.medium,
          hard: entry.hard,
          score: entry.score,
          bestScore: entry.score,
          avgScore: entry.problemsSolved > 0 ? Math.round(entry.score / entry.problemsSolved * 10) : 0,
          testsCompleted: entry.totalSubmissions
        };
      })
    );

    res.json({
      success: true,
      data: enrichedLeaderboard
    });

  } catch (error) {
    console.error('Error fetching DSA leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
});

/**
 * @route   GET /api/v2/dsa/stats
 * @desc    Get user's DSA statistics
 * @access  Private
 */
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const userSubmissions = dsaSubmissions.filter(s => s.userId === userId);
    const acceptedSubmissions = userSubmissions.filter(s => s.status === 'Accepted');
    
    // Get unique solved problems
    const solvedProblems = new Set(acceptedSubmissions.map(s => s.problemId));
    
    // Count by difficulty
    let easy = 0, medium = 0, hard = 0;
    solvedProblems.forEach(problemId => {
      const problem = dsaProblems.find(p => p.id === problemId);
      if (problem) {
        const diff = problem.difficulty.toLowerCase();
        if (diff === 'easy') easy++;
        else if (diff === 'medium') medium++;
        else if (diff === 'hard') hard++;
      }
    });

    res.json({
      success: true,
      data: {
        totalProblems: dsaProblems.length,
        solvedProblems: solvedProblems.size,
        totalSubmissions: userSubmissions.length,
        acceptedSubmissions: acceptedSubmissions.length,
        acceptanceRate: userSubmissions.length > 0 
          ? ((acceptedSubmissions.length / userSubmissions.length) * 100).toFixed(1)
          : 0,
        byDifficulty: { easy, medium, hard }
      }
    });

  } catch (error) {
    console.error('Error fetching DSA stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

/**
 * @route   POST /api/v2/dsa/generate
 * @desc    Generate a new DSA problem using AI and save to Supabase
 * @access  Admin only
 */
router.post('/generate', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { topic, difficulty = 'medium', count = 1, saveToDB = true } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required'
      });
    }

    const generatedProblems = [];
    const errors = [];

    for (let i = 0; i < count; i++) {
      try {
        // Generate problem using AI
        const problem = await generateDSAProblem({ topic, difficulty });
        
        if (saveToDB) {
          // Save to Supabase
          const savedProblem = await supabaseDSAService.createProblem({
            title: problem.title,
            slug: problem.slug,
            description: problem.description,
            difficulty: problem.difficulty,
            topics: [topic],
            examples: problem.examples,
            constraints: problem.constraints,
            starterCode: problem.starterCode,
            testCases: problem.testCases?.filter(tc => !tc.isHidden) || [],
            hiddenTestCases: problem.testCases?.filter(tc => tc.isHidden) || [],
            companies: []
          });
          generatedProblems.push(savedProblem);
        } else {
          generatedProblems.push(problem);
        }
      } catch (genError) {
        console.error(`Error generating problem ${i + 1}:`, genError);
        errors.push(`Problem ${i + 1}: ${genError.message}`);
      }
    }

    res.json({
      success: true,
      data: {
        generated: generatedProblems.length,
        saved: saveToDB,
        problems: generatedProblems,
        errors: errors.length > 0 ? errors : undefined
      }
    });

  } catch (error) {
    console.error('Error generating DSA problems:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate problems'
    });
  }
});

/**
 * @route   GET /api/v2/dsa/db/problems
 * @desc    Get DSA problems from Supabase database
 * @access  Private
 */
router.get('/db/problems', verifyToken, async (req, res) => {
  try {
    const { topic, difficulty, limit = 50 } = req.query;

    const problems = await supabaseDSAService.getProblems({
      topic,
      difficulty,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: problems,
      count: problems.length
    });

  } catch (error) {
    console.error('Error fetching problems from DB:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problems'
    });
  }
});

/**
 * @route   GET /api/v2/dsa/db/problems/:slug
 * @desc    Get a single DSA problem from Supabase by slug
 * @access  Private
 */
router.get('/db/problems/:slug', verifyToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const problem = await supabaseDSAService.getProblem(slug);

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    res.json({
      success: true,
      data: problem
    });

  } catch (error) {
    console.error('Error fetching problem from DB:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch problem'
    });
  }
});

/**
 * @route   POST /api/v2/dsa/db/submit
 * @desc    Submit solution to Supabase
 * @access  Private
 */
router.post('/db/submit', verifyToken, async (req, res) => {
  try {
    const { problemId, code, language, testResults } = req.body;
    // Only use Supabase UUID - never Firebase UID for UUID columns
    const userId = req.user?.supabaseUserId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User not found in database. Please complete registration first.'
      });
    }

    if (!problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Problem ID, code, and language are required'
      });
    }

    const allPassed = testResults?.every(r => r.passed) || false;
    const status = allPassed ? 'Accepted' : 'Wrong Answer';

    const submission = await supabaseDSAService.submitSolution({
      userId,
      problemId,
      code,
      language,
      status,
      runtimeMs: testResults?.reduce((sum, r) => sum + (r.runtime || 0), 0) || 0,
      memoryKb: testResults?.reduce((max, r) => Math.max(max, r.memory || 0), 0) || 0,
      testCasesPassed: testResults?.filter(r => r.passed).length || 0,
      totalTestCases: testResults?.length || 0,
      errorMessage: allPassed ? null : 'Some test cases failed'
    });

    res.json({
      success: true,
      data: {
        submissionId: submission.id,
        status,
        testCasesPassed: testResults?.filter(r => r.passed).length || 0,
        totalTestCases: testResults?.length || 0
      }
    });

  } catch (error) {
    console.error('Error submitting to DB:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit solution'
    });
  }
});

module.exports = router;
