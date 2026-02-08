const admin = require('firebase-admin')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

/**
 * Initialize Firebase Admin SDK
 * Uses service account credentials from environment variables
 */

let db = null
let auth = null
let isFirebaseInitialized = false

// Check if we have valid Firebase credentials
const hasValidCredentials = 
  process.env.FIREBASE_PROJECT_ID && 
  process.env.FIREBASE_PROJECT_ID !== 'your_project_id' &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_PRIVATE_KEY !== '"-----BEGIN PRIVATE KEY-----\\nYour Private Key Here\\n-----END PRIVATE KEY-----\\n"'

if (hasValidCredentials) {
  const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CERT_URL
  }

  // Initialize only if not already initialized
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
      db = admin.firestore()
      auth = admin.auth()
      isFirebaseInitialized = true
      console.log('✅ Firebase Admin SDK initialized successfully')
    } catch (error) {
      console.warn('⚠️ Firebase initialization failed:', error.message)
      console.warn('⚠️ Running in demo mode without Firebase')
    }
  }
} else {
  console.warn('⚠️ Firebase credentials not configured')
  console.warn('⚠️ Please update .env file with your Firebase Admin SDK credentials')
  console.warn('⚠️ Running in demo mode without Firebase')
}

module.exports = { admin, db, auth, isFirebaseInitialized }
