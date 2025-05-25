import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { db } from '../config/firebase';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// Get user profile
router.get('/profile', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      throw new AppError('User ID not found', 401, 'auth/user-not-found');
    }
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new AppError('User profile not found', 404, 'user/not-found');
    }
    
    const userData = userDoc.data();
    
    res.status(200).json({
      uid: userId,
      email: req.user?.email,
      ...userData
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      throw new AppError('User ID not found', 401, 'auth/user-not-found');
    }
    
    const { displayName, skills, preferences } = req.body;
    
    // Validate input
    if (!displayName) {
      throw new AppError('Display name is required', 400, 'validation/invalid-input');
    }
    
    // Update user document
    await db.collection('users').doc(userId).update({
      displayName,
      skills: skills || [],
      preferences: preferences || {},
      updatedAt: new Date().toISOString()
    });
    
    // Get updated user data
    const updatedUserDoc = await db.collection('users').doc(userId).get();
    const userData = updatedUserDoc.data();
    
    res.status(200).json({
      success: true,
      user: {
        uid: userId,
        email: req.user?.email,
        ...userData
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user subscription
router.get('/subscription', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      throw new AppError('User ID not found', 401, 'auth/user-not-found');
    }
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new AppError('User profile not found', 404, 'user/not-found');
    }
    
    const userData = userDoc.data();
    const subscription = userData?.subscription || {
      tier: 'free',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      features: {
        pitchesPerMonth: 5,
        analytics: false,
        multiPlatform: false
      }
    };
    
    res.status(200).json(subscription);
  } catch (error) {
    next(error);
  }
});

// Update user subscription
router.put('/subscription', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      throw new AppError('User ID not found', 401, 'auth/user-not-found');
    }
    
    const { tier } = req.body;
    
    // Validate input
    if (!tier || !['free', 'pro', 'premium'].includes(tier)) {
      throw new AppError('Valid subscription tier is required', 400, 'validation/invalid-input');
    }
    
    // Define features based on tier
    const features = {
      free: {
        pitchesPerMonth: 5,
        analytics: false,
        multiPlatform: false
      },
      pro: {
        pitchesPerMonth: -1, // Unlimited
        analytics: true,
        multiPlatform: false
      },
      premium: {
        pitchesPerMonth: -1, // Unlimited
        analytics: true,
        multiPlatform: true
      }
    };
    
    // Update subscription
    const subscription = {
      tier,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      features: features[tier as keyof typeof features]
    };
    
    await db.collection('users').doc(userId).update({
      subscription,
      updatedAt: new Date().toISOString()
    });
    
    res.status(200).json({
      success: true,
      subscription
    });
  } catch (error) {
    next(error);
  }
});

export const userRoutes = router;
