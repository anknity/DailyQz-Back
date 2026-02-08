const { auth, isFirebaseInitialized } = require('../config/firebase')
const { supabaseAdmin } = require('../config/supabase')

// Admin email - only this user has admin privileges
const ADMIN_EMAIL = 'nityanand666.nk@gmail.com'

/**
 * Get or create Supabase user ID from Firebase UID
 * @param {string} firebaseUid - Firebase UID
 * @param {object} userData - User data from Firebase (email, displayName, etc.)
 * @returns {Promise<string|null>} Supabase user ID
 */
async function getSupabaseUserId(firebaseUid, userData = {}) {
  if (!supabaseAdmin) return null;
  
  try {
    // First, try to find existing user
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('firebase_uid', firebaseUid)
      .single();
    
    if (data) {
      return data.id;
    }
    
    // If user doesn't exist, create them
    console.log('🔄 Creating new Supabase user for Firebase UID:', firebaseUid);
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        firebase_uid: firebaseUid,
        email: userData.email || null,
        display_name: userData.name || userData.displayName || userData.email?.split('@')[0] || 'User',
        role: userData.email === ADMIN_EMAIL ? 'admin' : 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (insertError) {
      console.error('Error creating Supabase user:', insertError);
      return null;
    }
    
    console.log('✅ Created Supabase user with ID:', newUser.id);
    
    // Also create user_stats record for the new user
    try {
      const { error: statsError } = await supabaseAdmin
        .from('user_stats')
        .insert({
          user_id: newUser.id,
          total_exams_taken: 0,
          total_questions_attempted: 0,
          total_correct_answers: 0,
          total_dsa_solved: 0,
          dsa_easy_solved: 0,
          dsa_medium_solved: 0,
          dsa_hard_solved: 0,
          current_streak: 0,
          max_streak: 0,
          ai_skill_score: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (statsError) {
        console.error('Error creating user_stats:', statsError);
      } else {
        console.log('✅ Created user_stats for user:', newUser.id);
      }
    } catch (statsErr) {
      console.error('Error in user_stats creation:', statsErr);
    }
    
    return newUser.id;
  } catch (err) {
    console.error('Error in getSupabaseUserId:', err);
    return null;
  }
}

/**
 * Verify Firebase ID Token Middleware
 * Authenticates requests using Firebase Auth tokens
 */
const verifyToken = async (req, res, next) => {
  // If Firebase is not initialized, allow requests in demo mode
  if (!isFirebaseInitialized) {
    req.user = { 
      uid: 'demo-user', 
      email: 'demo@example.com', 
      name: 'Demo User',
      supabaseUserId: null
    }
    console.warn('⚠️ Auth bypassed - Firebase not initialized (demo mode)')
    return next()
  }

  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized: No token provided' 
    })
  }

  const token = authHeader.split('Bearer ')[1]

  try {
    const decodedToken = await auth.verifyIdToken(token)
    
    // Get or create Supabase user ID (pass user data for auto-creation)
    const supabaseUserId = await getSupabaseUserId(decodedToken.uid, {
      email: decodedToken.email,
      name: decodedToken.name,
      displayName: decodedToken.displayName
    })
    
    req.user = {
      ...decodedToken,
      firebaseUid: decodedToken.uid,
      supabaseUserId
    }
    next()
  } catch (error) {
    console.error('Token verification error:', error)
    return res.status(401).json({ 
      success: false,
      error: 'Unauthorized: Invalid token' 
    })
  }
}

/**
 * Optional Auth Middleware
 * Tries to authenticate but allows unauthenticated requests
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null
    return next()
  }

  const token = authHeader.split('Bearer ')[1]

  try {
    if (isFirebaseInitialized) {
      const decodedToken = await auth.verifyIdToken(token)
      const supabaseUserId = await getSupabaseUserId(decodedToken.uid, {
        email: decodedToken.email,
        name: decodedToken.name,
        displayName: decodedToken.displayName
      })
      
      req.user = {
        ...decodedToken,
        firebaseUid: decodedToken.uid,
        supabaseUserId
      }
    } else {
      req.user = null
    }
  } catch (error) {
    req.user = null
  }
  
  next()
}

/**
 * Verify Admin Access Middleware
 * Checks if the authenticated user has admin privileges
 */
const verifyAdmin = async (req, res, next) => {
  try {
    const userEmail = req.user?.email

    if (!userEmail || userEmail !== ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required'
      })
    }

    next()
  } catch (error) {
    console.error('Admin verification error:', error)
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Admin verification failed'
    })
  }
}

module.exports = { verifyToken, verifyAdmin, optionalAuth }
