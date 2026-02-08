# DailyQ - MCQ Test Platform (Backend)

Express.js REST API backend for the DailyQ MCQ Test Platform.

## 🚀 Features

- **Firebase Admin SDK**: Secure server-side Firebase operations
- **JWT Authentication**: Verify Firebase auth tokens
- **RESTful API**: Clean, organized endpoints
- **Error Handling**: Comprehensive error middleware
- **Security**: Helmet, CORS, and input validation

## 🛠️ Tech Stack

- **Express.js** - Web Framework
- **Firebase Admin** - Authentication & Firestore
- **Helmet** - Security Headers
- **Morgan** - Request Logging
- **CORS** - Cross-Origin Resource Sharing

## 📦 Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your Firebase Admin SDK credentials
```

4. Start the server:
```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

5. Server runs on http://localhost:5000

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Firebase Admin SDK (from Service Account JSON)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your_project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
```

### Getting Firebase Admin Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Copy values from the downloaded JSON to your `.env`

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/         # Firebase configuration
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   └── index.js        # Entry point
├── data/
│   └── questions.js    # Questions database
├── .env.example
├── .gitignore
└── package.json
```

## 📡 API Endpoints

### Authentication Required
All protected routes require `Authorization: Bearer <token>` header.

### Users
```
GET  /api/users/profile  - Get user profile (auth)
PUT  /api/users/profile  - Update user profile (auth)
GET  /api/users/stats    - Get user statistics (auth)
GET  /api/users/history  - Get test history (auth)
```

### Questions
```
GET  /api/questions              - Get random questions
POST /api/questions/verify       - Submit answers and get score (auth)
GET  /api/questions/categories   - Get available categories
```

### Leaderboard
```
GET  /api/leaderboard      - Get leaderboard (query: period=daily|weekly|all-time)
GET  /api/leaderboard/rank - Get user's rank (auth)
```

### Health Check
```
GET  /health - Server health status
```

## 📝 Request/Response Examples

### Get Questions
```bash
GET /api/questions?category=web-development&difficulty=ai-mix&count=20
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "question": "What does HTML stand for?",
      "options": ["...", "...", "...", "..."],
      "category": "web-development",
      "difficulty": "easy"
    }
  ],
  "meta": { "total": 20, "category": "web-development", "difficulty": "ai-mix" }
}
```

### Submit Answers
```bash
POST /api/questions/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    { "questionId": 1, "selectedOption": 0 },
    { "questionId": 2, "selectedOption": 2 }
  ],
  "category": "web-development",
  "difficulty": "ai-mix",
  "timeSpent": 800
}
```

Response:
```json
{
  "success": true,
  "data": {
    "testId": "abc123",
    "score": 85,
    "correct": 17,
    "incorrect": 3,
    "totalQuestions": 20,
    "results": [...]
  }
}
```

## 🔒 Security

- **Helmet**: Sets various HTTP headers for security
- **CORS**: Configured for frontend origin only
- **Token Verification**: Firebase ID token verification
- **Input Validation**: Request body validation
- **Error Sanitization**: No sensitive info in error responses

## 📝 Scripts

```bash
npm start    # Start production server
npm run dev  # Start development server with nodemon
npm test     # Run tests (Jest)
```

## 🚀 Deployment

### Railway / Render / Heroku

1. Set environment variables in your platform
2. Deploy from Git repository
3. The start command is `npm start`

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📄 License

MIT License
