const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { db } = require('../config/firebase');

/**
 * Typing Test Routes
 * Provides passage generation, result submission, and leaderboard for typing tests
 */

// Sample passages organized by difficulty and type
const TYPING_PASSAGES = {
  easy: [
    {
      id: 'easy-1',
      text: 'The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet. Practice typing it to improve your speed and accuracy.',
      wordCount: 26,
      category: 'general'
    },
    {
      id: 'easy-2',
      text: 'Learning to type fast is an important skill in today\'s digital world. Start slowly and focus on accuracy first. Speed will come naturally with consistent practice.',
      wordCount: 27,
      category: 'general'
    },
    {
      id: 'easy-3',
      text: 'The sun rises in the east and sets in the west. Every morning brings new opportunities. Make the most of each day and always keep learning new things.',
      wordCount: 29,
      category: 'general'
    }
  ],
  medium: [
    {
      id: 'med-1',
      text: 'Programming is the art of telling a computer what to do through a sequence of instructions. Modern software development requires understanding of algorithms, data structures, and design patterns. Writing clean, maintainable code is just as important as making it work correctly.',
      wordCount: 42,
      category: 'programming'
    },
    {
      id: 'med-2',
      text: 'Artificial intelligence and machine learning are transforming every industry. From healthcare to finance, these technologies enable computers to learn from data and make intelligent decisions. Understanding the basics of AI is becoming essential for professionals in all fields.',
      wordCount: 39,
      category: 'technology'
    },
    {
      id: 'med-3',
      text: 'The Internet has revolutionized how we communicate, work, and access information. Cloud computing enables businesses to scale globally without massive infrastructure investments. Cybersecurity has become critical as more of our lives move online and digital threats continue to evolve.',
      wordCount: 40,
      category: 'technology'
    }
  ],
  hard: [
    {
      id: 'hard-1',
      text: 'Quantum computing leverages the principles of quantum mechanics, including superposition and entanglement, to process information in fundamentally different ways than classical computers. While traditional bits exist as either 0 or 1, quantum bits (qubits) can exist in multiple states simultaneously, enabling exponentially faster processing for certain computational problems like cryptography, drug discovery, and optimization.',
      wordCount: 53,
      category: 'science'
    },
    {
      id: 'hard-2',
      text: 'Microservices architecture decomposes applications into loosely coupled, independently deployable services that communicate through well-defined APIs. Each service encapsulates specific business functionality and can be developed, deployed, and scaled independently. Container orchestration platforms like Kubernetes manage service discovery, load balancing, and automatic failover, enabling resilient distributed systems that handle millions of concurrent requests.',
      wordCount: 50,
      category: 'programming'
    }
  ]
};

// Code snippets for coding typing mode
const CODE_SNIPPETS = {
  javascript: [
    {
      id: 'js-1',
      text: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  let a = 0, b = 1;\n  for (let i = 2; i <= n; i++) {\n    [a, b] = [b, a + b];\n  }\n  return b;\n}',
      language: 'javascript',
      difficulty: 'easy'
    },
    {
      id: 'js-2',
      text: 'const debounce = (fn, delay) => {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n};',
      language: 'javascript',
      difficulty: 'medium'
    },
    {
      id: 'js-3',
      text: 'async function fetchWithRetry(url, options = {}, retries = 3) {\n  for (let i = 0; i < retries; i++) {\n    try {\n      const response = await fetch(url, options);\n      if (!response.ok) throw new Error(response.statusText);\n      return await response.json();\n    } catch (err) {\n      if (i === retries - 1) throw err;\n      await new Promise(r => setTimeout(r, 1000 * (i + 1)));\n    }\n  }\n}',
      language: 'javascript',
      difficulty: 'hard'
    }
  ],
  python: [
    {
      id: 'py-1',
      text: 'def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1',
      language: 'python',
      difficulty: 'easy'
    },
    {
      id: 'py-2',
      text: 'class LRUCache:\n    def __init__(self, capacity):\n        self.capacity = capacity\n        self.cache = {}\n        self.order = []\n\n    def get(self, key):\n        if key in self.cache:\n            self.order.remove(key)\n            self.order.append(key)\n            return self.cache[key]\n        return -1\n\n    def put(self, key, value):\n        if key in self.cache:\n            self.order.remove(key)\n        elif len(self.cache) >= self.capacity:\n            oldest = self.order.pop(0)\n            del self.cache[oldest]\n        self.cache[key] = value\n        self.order.append(key)',
      language: 'python',
      difficulty: 'hard'
    }
  ],
  java: [
    {
      id: 'java-1',
      text: 'public static int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int complement = target - nums[i];\n        if (map.containsKey(complement)) {\n            return new int[] { map.get(complement), i };\n        }\n        map.put(nums[i], i);\n    }\n    return new int[] {};\n}',
      language: 'java',
      difficulty: 'medium'
    }
  ],
  cpp: [
    {
      id: 'cpp-1',
      text: 'vector<int> mergeSortedArrays(vector<int>& a, vector<int>& b) {\n    vector<int> result;\n    int i = 0, j = 0;\n    while (i < a.size() && j < b.size()) {\n        if (a[i] <= b[j]) result.push_back(a[i++]);\n        else result.push_back(b[j++]);\n    }\n    while (i < a.size()) result.push_back(a[i++]);\n    while (j < b.size()) result.push_back(b[j++]);\n    return result;\n}',
      language: 'cpp',
      difficulty: 'medium'
    }
  ]
};

/**
 * GET /api/v2/typing/passage
 * Get a random typing passage
 */
router.get('/passage', verifyToken, (req, res) => {
  try {
    const { difficulty = 'medium', type = 'general' } = req.query;

    if (type === 'code') {
      const language = req.query.language || 'javascript';
      const snippets = CODE_SNIPPETS[language] || CODE_SNIPPETS.javascript;
      const filtered = difficulty !== 'all'
        ? snippets.filter(s => s.difficulty === difficulty)
        : snippets;
      const snippet = filtered[Math.floor(Math.random() * filtered.length)] || snippets[0];

      return res.json({
        success: true,
        data: {
          id: snippet.id,
          text: snippet.text,
          type: 'code',
          language: snippet.language,
          difficulty: snippet.difficulty,
          charCount: snippet.text.length,
          wordCount: snippet.text.split(/\s+/).length
        }
      });
    }

    // Regular passage
    const passages = TYPING_PASSAGES[difficulty] || TYPING_PASSAGES.medium;
    const passage = passages[Math.floor(Math.random() * passages.length)];

    res.json({
      success: true,
      data: {
        id: passage.id,
        text: passage.text,
        type: 'general',
        category: passage.category,
        difficulty,
        charCount: passage.text.length,
        wordCount: passage.wordCount
      }
    });
  } catch (error) {
    console.error('Error getting passage:', error);
    res.status(500).json({ success: false, message: 'Failed to get passage' });
  }
});

/**
 * GET /api/v2/typing/passage/ai
 * Generate a typing passage using AI (Groq)
 */
router.get('/passage/ai', verifyToken, async (req, res) => {
  try {
    const { difficulty = 'medium', topic = 'technology', type = 'general' } = req.query;

    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    let prompt;
    if (type === 'code') {
      const language = req.query.language || 'javascript';
      prompt = `Generate a ${difficulty} difficulty ${language} code snippet (a complete function or class, 5-15 lines). Return ONLY the code, no explanation or markdown.`;
    } else {
      const wordCounts = { easy: '30-40', medium: '50-70', hard: '80-100' };
      prompt = `Write a ${wordCounts[difficulty] || '50-70'} word paragraph about ${topic}. Make it engaging and suitable for a typing test. Return ONLY the paragraph text, no quotes or extra formatting.`;
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You generate text content for typing practice. Return only the raw text.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 500
    });

    const text = completion.choices[0]?.message?.content?.trim() || '';

    res.json({
      success: true,
      data: {
        id: `ai-${Date.now()}`,
        text,
        type: type === 'code' ? 'code' : 'general',
        language: type === 'code' ? (req.query.language || 'javascript') : undefined,
        difficulty,
        charCount: text.length,
        wordCount: text.split(/\s+/).length,
        source: 'ai'
      }
    });
  } catch (error) {
    console.error('Error generating AI passage:', error);
    // Fallback to static passage
    const passages = TYPING_PASSAGES[req.query.difficulty] || TYPING_PASSAGES.medium;
    const passage = passages[Math.floor(Math.random() * passages.length)];
    res.json({
      success: true,
      data: { ...passage, type: 'general', difficulty: req.query.difficulty || 'medium', charCount: passage.text.length, source: 'static' }
    });
  }
});

/**
 * POST /api/v2/typing/submit
 * Submit typing test result
 */
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const {
      passageId,
      wpm,
      accuracy,
      rawWpm,
      duration,
      correctChars,
      incorrectChars,
      totalChars,
      difficulty,
      type,
      language
    } = req.body;

    if (!wpm || !accuracy || !duration) {
      return res.status(400).json({
        success: false,
        message: 'wpm, accuracy, and duration are required'
      });
    }

    const resultData = {
      userId: uid,
      passageId: passageId || 'unknown',
      wpm: Math.round(wpm),
      rawWpm: Math.round(rawWpm || wpm),
      accuracy: Math.round(accuracy * 100) / 100,
      duration: Math.round(duration),
      correctChars: correctChars || 0,
      incorrectChars: incorrectChars || 0,
      totalChars: totalChars || 0,
      difficulty: difficulty || 'medium',
      type: type || 'general',
      language: language || null,
      createdAt: new Date().toISOString()
    };

    // Save to Firestore
    const resultRef = await db.collection('typingResults').add(resultData);

    // Update user's typing stats
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      const typingStats = userData.typingStats || {
        testsTaken: 0,
        bestWpm: 0,
        avgWpm: 0,
        totalWpm: 0,
        bestAccuracy: 0,
        avgAccuracy: 0,
        totalAccuracy: 0
      };

      typingStats.testsTaken += 1;
      typingStats.totalWpm += Math.round(wpm);
      typingStats.avgWpm = Math.round(typingStats.totalWpm / typingStats.testsTaken);
      typingStats.bestWpm = Math.max(typingStats.bestWpm, Math.round(wpm));
      typingStats.totalAccuracy += accuracy;
      typingStats.avgAccuracy = Math.round((typingStats.totalAccuracy / typingStats.testsTaken) * 100) / 100;
      typingStats.bestAccuracy = Math.max(typingStats.bestAccuracy, accuracy);

      await userRef.update({ typingStats });
    }

    res.json({
      success: true,
      data: {
        resultId: resultRef.id,
        wpm: resultData.wpm,
        accuracy: resultData.accuracy,
        ...resultData
      }
    });
  } catch (error) {
    console.error('Error submitting typing result:', error);
    res.status(500).json({ success: false, message: 'Failed to submit result' });
  }
});

/**
 * GET /api/v2/typing/leaderboard
 * Get typing test leaderboard
 */
router.get('/leaderboard', verifyToken, async (req, res) => {
  try {
    const { difficulty, type, limit = 20, period = 'all-time' } = req.query;

    let resultsQuery = db.collection('typingResults')
      .orderBy('wpm', 'desc')
      .limit(parseInt(limit) * 3); // Get extra to deduplicate

    const snapshot = await resultsQuery.get();

    // Group by user, keep best WPM per user
    const userBest = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      // Apply filters
      if (difficulty && difficulty !== 'all' && data.difficulty !== difficulty) return;
      if (type && type !== 'all' && data.type !== type) return;

      const uid = data.userId;
      if (!userBest[uid] || data.wpm > userBest[uid].wpm) {
        userBest[uid] = { ...data, resultId: doc.id };
      }
    });

    // Get user details and build leaderboard
    const leaderboard = [];
    for (const [userId, result] of Object.entries(userBest)) {
      try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.exists ? userDoc.data() : {};
        leaderboard.push({
          id: userId,
          uid: userId,
          name: userData.name || userData.displayName || 'Anonymous',
          displayName: userData.name || userData.displayName || 'Anonymous',
          photoURL: userData.photoURL || null,
          wpm: result.wpm,
          rawWpm: result.rawWpm || result.wpm,
          accuracy: result.accuracy,
          bestWpm: result.wpm,
          testsCompleted: userData.typingStats?.testsTaken || 1,
          avgWpm: userData.typingStats?.avgWpm || result.wpm,
          difficulty: result.difficulty,
          type: result.type
        });
      } catch (e) {
        // Skip user
      }
    }

    // Sort and rank
    leaderboard.sort((a, b) => b.wpm - a.wpm);
    const ranked = leaderboard.slice(0, parseInt(limit)).map((entry, i) => ({
      ...entry,
      rank: i + 1
    }));

    res.json({
      success: true,
      data: ranked
    });
  } catch (error) {
    console.error('Error fetching typing leaderboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/v2/typing/history
 * Get user's typing test history
 */
router.get('/history', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const { limit = 20 } = req.query;

    const snapshot = await db.collection('typingResults')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();

    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching typing history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
});

/**
 * GET /api/v2/typing/stats
 * Get user's typing statistics
 */
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.json({
        success: true,
        data: { testsTaken: 0, bestWpm: 0, avgWpm: 0, bestAccuracy: 0, avgAccuracy: 0 }
      });
    }

    const typingStats = userDoc.data().typingStats || {
      testsTaken: 0,
      bestWpm: 0,
      avgWpm: 0,
      bestAccuracy: 0,
      avgAccuracy: 0
    };

    res.json({ success: true, data: typingStats });
  } catch (error) {
    console.error('Error fetching typing stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

module.exports = router;
