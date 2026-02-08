# DailyQ Backend Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- Firebase Project with Admin SDK
- Gemini API Key

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-backend-repo-url>
   cd dailyq-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Then fill in your actual values in `.env`:

   ### Firebase Admin SDK Setup
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Copy the values to your `.env` file:
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_PRIVATE_KEY_ID`
     - `FIREBASE_PRIVATE_KEY` (keep the quotes and \n characters)
     - `FIREBASE_CLIENT_EMAIL`
     - `FIREBASE_CLIENT_ID`
     - `FIREBASE_CERT_URL`

   ### Gemini API Key Setup
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add it to `GEMINI_API_KEY` in `.env`

   ### Admin Configuration
   - Set `ADMIN_EMAIL` to your admin email address

4. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

## Important Security Notes

⚠️ **NEVER commit the following files:**
- `.env` (contains sensitive credentials)
- `serviceAccountKey.json` (Firebase credentials)
- Any files with API keys or passwords

✅ **Safe to commit:**
- `.env.example` (template without real values)
- Source code files
- Configuration files without secrets

## API Endpoints

Server runs on `http://localhost:5000` by default.

### Public Endpoints
- `GET /health` - Health check
- `GET /api/leaderboard` - Get leaderboard

### Protected Endpoints (Require Authentication)
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `GET /api/questions` - Get questions
- `POST /api/questions/submit` - Submit test
- And more...

### Admin Only Endpoints
- `GET /api/admin/dashboard` - Admin dashboard stats
- `POST /api/admin/generate-questions` - AI question generation
- `POST /api/admin/upload-questions` - Upload questions
- And more...

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase Admin initialization
│   ├── controllers/             # Route handlers
│   ├── middleware/              # Auth & error handling
│   ├── routes/                  # API routes
│   ├── services/                # Business logic
│   └── index.js                 # App entry point
├── .env                         # Environment variables (NEVER COMMIT)
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
└── package.json                 # Dependencies
```

## Deployment

Before deploying:
1. Update `FRONTEND_URL` in `.env` to your production frontend URL
2. Ensure all environment variables are set in your hosting platform
3. Never expose `.env` file in production

## Troubleshooting

### "EADDRINUSE" error
Port 5000 is already in use. Either:
- Kill the process using port 5000
- Change `PORT` in `.env`

### Firebase Authentication errors
- Verify your Firebase credentials in `.env`
- Check Firebase Console for any restrictions

### Gemini API errors
- Verify your API key is valid
- Check quota limits in Google AI Studio
