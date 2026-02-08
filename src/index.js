const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()

const { userRoutes, questionRoutes, leaderboardRoutes, adminRoutes, examRoutes, generateRoutes, dsaRoutes, competitiveRoutes } = require('./routes')
const supabaseExamRoutes = require('./routes/supabaseExamRoutes')
const supabaseQuestionRoutes = require('./routes/supabaseQuestionRoutes')
const directFeedRoutes = require('./routes/directFeedRoutes')
const dailyChallengeRoutes = require('./routes/dailyChallengeRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const achievementRoutes = require('./routes/achievementRoutes')
const scheduledExamRoutes = require('./routes/scheduledExamRoutes')
const schoolExamRoutes = require('./routes/schoolExamRoutes')
const typingTestRoutes = require('./routes/typingTestRoutes')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')

const app = express()
const PORT = parseInt(process.env.PORT, 10) || 5000

// Middleware
app.use(helmet()) // Security headers
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://dailyqz.vercel.app',
    'https://daily-qz.vercel.app',
    'https://dailyqz-back.onrender.com',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(morgan('dev')) // Logging
app.use(express.json({ limit: '10mb' })) // Parse JSON bodies with increased limit for file uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'DailyQ API Server',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Auto-prefix /api for requests missing it (handles flexible frontend API_URL config)
app.use((req, res, next) => {
  if (!req.path.startsWith('/api') && req.path !== '/' && req.path !== '/health') {
    req.url = '/api' + req.url
  }
  next()
})

// API Routes (v1 - Firebase)
app.use('/api/users', userRoutes)
app.use('/api/questions', questionRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/exam', examRoutes)
app.use('/api/exams', examRoutes) // Also mount on /exams for compatibility

// Supabase API Routes (v2)
app.use('/api/v2/exams', supabaseExamRoutes)
app.use('/api/v2/questions', supabaseQuestionRoutes)
app.use('/api/v2/generate', generateRoutes)
app.use('/api/v2/dsa', dsaRoutes)
app.use('/api/v2/competitive', competitiveRoutes)
app.use('/api/v2/direct-feed', directFeedRoutes)
app.use('/api/v2/daily-challenges', dailyChallengeRoutes)
app.use('/api/v2/notifications', notificationRoutes)
app.use('/api/v2/achievements', achievementRoutes)
app.use('/api/v2/scheduled-exams', scheduledExamRoutes)
app.use('/api/v2/school-exams', schoolExamRoutes)
app.use('/api/v2/typing', typingTestRoutes)

// Error Handling
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║    🚀 DailyQ API Server Running!          ║
║                                            ║
║    Port: ${PORT}                            ║
║    Environment: ${process.env.NODE_ENV || 'development'}            ║
║                                            ║
╚════════════════════════════════════════════╝
  `)
})

module.exports = app
