import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { db } from '../config/firebase';
import { AppError } from '../middleware/error.middleware';
import { generatePitch, GigDetails } from '../services/openai.service';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Generate a new pitch
router.post('/generate', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      throw new AppError('User ID not found', 401, 'auth/user-not-found');
    }
    
    const { skills, gigDetails } = req.body;
    
    // Validate input
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      throw new AppError('Skills are required', 400, 'validation/invalid-input');
    }
    
    if (!gigDetails || !gigDetails.projectType || !gigDetails.budget) {
      throw new AppError('Project type and budget are required', 400, 'validation/invalid-input');
    }
    
    // Check user subscription for pitch limit
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      throw new AppError('User not found', 404, 'user/not-found');
    }
    
    const userData = userDoc.data();
    const subscription = userData?.subscription || { tier: 'free' };
    
    // Check pitch limit for free tier
    if (subscription.tier === 'free') {
      // Count pitches created this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const pitchesThisMonth = await db.collection('pitches')
        .where('userId', '==', userId)
        .where('createdAt', '>=', startOfMonth.toISOString())
        .get();
      
      if (pitchesThisMonth.size >= 5) {
        throw new AppError('Monthly pitch limit exceeded', 402, 'pitch/limit-exceeded');
      }
    }
    
    // Generate pitch using OpenAI
    const generatedPitchText = await generatePitch(skills, gigDetails as GigDetails);
    
    // Create pitch document in Firestore
    const now = new Date().toISOString();
    const pitchId = uuidv4();
    
    const pitchData = {
      id: pitchId,
      userId,
      createdAt: now,
      updatedAt: now,
      skills,
      gigDetails,
      generatedPitch: generatedPitchText,
      editedPitch: '',
      status: 'draft',
    };
    
    await db.collection('pitches').doc(pitchId).set(pitchData);
    
    res.status(201).json(pitchData);
  } catch (error) {
    next(error);
  }
});

// Get all pitches for the current user
router.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      throw new AppError('User ID not found', 401, 'auth/user-not-found');
    }
    
    const { status, limit = '20', offset = '0' } = req.query;
    
    // Create query
    let query = db.collection('pitches').where('userId', '==', userId);
    
    // Add status filter if provided
    if (status) {
      query = query.where('status', '==', status);
    }
    
    // Add sorting
    query = query.orderBy('createdAt', 'desc');
    
    // Execute query
    const snapshot = await query.get();
    
    // Parse limit and offset
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);
    
    // Apply pagination manually
    const pitches = snapshot.docs
      .map(doc => doc.data())
      .slice(offsetNum, offsetNum + limitNum);
    
    res.status(200).json({
      pitches,
      total: snapshot.size,
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    next(error);
  }
});

// Get a specific pitch by ID
router.get('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.uid;
    const pitchId = req.params.id;
    
    if (!userId) {
      throw new AppError('User ID not found', 401, 'auth/user-not-found');
    }
    
    // Get pitch document
    const pitchDoc = await db.collection('pitches').doc(pitchId).get();
    
    if (!pitchDoc.exists) {
      throw new AppError('Pitch not found', 404, 'pitch/not-found');
    }
    
    const pitchData = pitchDoc.data();
    
    // Check if pitch belongs to the current user
    if (pitchData?.userId !== userId) {
      throw new AppError('Unauthorized access to pitch', 403, 'auth/forbidden');
    }
    
    res.status(200).json(pitchData);
  } catch (error) {
    next(error);
  }
});

// Update a pitch
router.put('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.uid;
    const pitchId = req.params.id;
    
    if (!userId) {
      throw new AppError('User ID not found', 401, 'auth/user-not-found');
    }
    
    const { editedPitch, status } = req.body;
    
    // Get pitch document
    const pitchDoc = await db.collection('pitches').doc(pitchId).get();
    
    if (!pitchDoc.exists) {
      throw new AppError('Pitch not found', 404, 'pitch/not-found');
    }
    
    const pitchData = pitchDoc.data();
    
    // Check if pitch belongs to the current user
    if (pitchData?.userId !== userId) {
      throw new AppError('Unauthorized access to pitch', 403, 'auth/forbidden');
    }
    
    // Update pitch
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };
    
    if (editedPitch !== undefined) {
      updateData.editedPitch = editedPitch;
    }
    
    if (status !== undefined) {
      updateData.status = status;
    }
    
    await db.collection('pitches').doc(pitchId).update(updateData);
    
    // Get updated pitch
    const updatedPitchDoc = await db.collection('pitches').doc(pitchId).get();
    const updatedPitchData = updatedPitchDoc.data();
    
    res.status(200).json(updatedPitchData);
  } catch (error) {
    next(error);
  }
});

// Delete a pitch
router.delete('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.uid;
    const pitchId = req.params.id;
    
    if (!userId) {
      throw new AppError('User ID not found', 401, 'auth/user-not-found');
    }
    
    // Get pitch document
    const pitchDoc = await db.collection('pitches').doc(pitchId).get();
    
    if (!pitchDoc.exists) {
      throw new AppError('Pitch not found', 404, 'pitch/not-found');
    }
    
    const pitchData = pitchDoc.data();
    
    // Check if pitch belongs to the current user
    if (pitchData?.userId !== userId) {
      throw new AppError('Unauthorized access to pitch', 403, 'auth/forbidden');
    }
    
    // Delete pitch
    await db.collection('pitches').doc(pitchId).delete();
    
    res.status(200).json({
      success: true,
      message: 'Pitch deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Schedule a pitch to Google Calendar
router.post('/:id/schedule', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.uid;
    const pitchId = req.params.id;
    
    if (!userId) {
      throw new AppError('User ID not found', 401, 'auth/user-not-found');
    }
    
    const { scheduledDate, duration, title, description } = req.body;
    
    // Validate input
    if (!scheduledDate || !duration || !title) {
      throw new AppError('Scheduled date, duration, and title are required', 400, 'validation/invalid-input');
    }
    
    // Get pitch document
    const pitchDoc = await db.collection('pitches').doc(pitchId).get();
    
    if (!pitchDoc.exists) {
      throw new AppError('Pitch not found', 404, 'pitch/not-found');
    }
    
    const pitchData = pitchDoc.data();
    
    // Check if pitch belongs to the current user
    if (pitchData?.userId !== userId) {
      throw new AppError('Unauthorized access to pitch', 403, 'auth/forbidden');
    }
    
    // In a real implementation, you would use the calendar service to create an event
    // For this example, we'll simulate a successful calendar event creation
    
    const calendarEventId = `cal_${uuidv4()}`;
    
    // Update pitch with calendar event ID and status
    await db.collection('pitches').doc(pitchId).update({
      status: 'scheduled',
      calendarEventId,
      updatedAt: new Date().toISOString()
    });
    
    // Get updated pitch
    const updatedPitchDoc = await db.collection('pitches').doc(pitchId).get();
    const updatedPitchData = updatedPitchDoc.data();
    
    // Create mock calendar event response
    const startTime = new Date(scheduledDate);
    const endTime = new Date(startTime.getTime() + duration * 60000);
    
    const calendarEvent = {
      id: calendarEventId,
      summary: title,
      description: description || updatedPitchData?.editedPitch || updatedPitchData?.generatedPitch,
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      htmlLink: `https://calendar.google.com/calendar/event?eid=${calendarEventId}`
    };
    
    res.status(200).json({
      success: true,
      pitch: updatedPitchData,
      calendarEvent
    });
  } catch (error) {
    next(error);
  }
});

export const pitchRoutes = router;
