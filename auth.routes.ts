import { Router } from 'express';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;
    
    // Validate input
    if (!email || !password || !displayName) {
      throw new AppError('Email, password, and display name are required', 400, 'auth/invalid-input');
    }
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName
    });
    
    // Create user document in Firestore
    const userData = {
      displayName,
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subscription: {
        tier: 'free',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      },
      skills: [],
      preferences: {}
    };
    
    await db.collection('users').doc(userRecord.uid).set(userData);
    
    // Create custom token for the user
    const token = await auth.createCustomToken(userRecord.uid);
    
    res.status(201).json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName
      },
      token
    });
  } catch (error: any) {
    // Handle Firebase Auth specific errors
    if (error.code === 'auth/email-already-exists') {
      next(new AppError('Email already exists', 409, 'auth/email-already-exists'));
    } else if (error.code === 'auth/invalid-email') {
      next(new AppError('Invalid email format', 400, 'auth/invalid-email'));
    } else if (error.code === 'auth/weak-password') {
      next(new AppError('Password is too weak', 400, 'auth/weak-password'));
    } else {
      next(error);
    }
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      throw new AppError('Email and password are required', 400, 'auth/invalid-input');
    }
    
    // Find user by email
    const userRecord = await auth.getUserByEmail(email);
    
    // In a real implementation, you would use Firebase Authentication REST API
    // to sign in with email and password, as the Admin SDK doesn't support this directly.
    // For this example, we'll simulate successful authentication and return a token.
    
    // Create custom token for the user
    const token = await auth.createCustomToken(userRecord.uid);
    
    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    const userData = userDoc.data();
    
    res.status(200).json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        ...userData
      },
      token
    });
  } catch (error: any) {
    // Handle Firebase Auth specific errors
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      next(new AppError('Invalid credentials', 400, 'auth/invalid-credentials'));
    } else if (error.code === 'auth/too-many-requests') {
      next(new AppError('Too many login attempts, please try again later', 429, 'auth/too-many-requests'));
    } else {
      next(error);
    }
  }
});

// Reset password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // Validate input
    if (!email) {
      throw new AppError('Email is required', 400, 'auth/invalid-input');
    }
    
    // Generate password reset link
    // In a real implementation, you would use Firebase Authentication REST API
    // to send a password reset email, as the Admin SDK doesn't support this directly.
    // For this example, we'll simulate successful password reset email sending.
    
    // Check if user exists
    try {
      await auth.getUserByEmail(email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new AppError('Email not found', 404, 'auth/user-not-found');
      }
      throw error;
    }
    
    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    next(error);
  }
});

// Logout (server-side)
router.post('/logout', async (req, res, next) => {
  // In a real implementation, you might revoke tokens or update session status
  // For this example, we'll just return a success response
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

export const authRoutes = router;
