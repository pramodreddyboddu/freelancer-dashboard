import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import * as calendarService from '../services/calendar.service';

const router = Router();

// Authorize Google Calendar
router.post('/authorize', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      throw new AppError('User ID not found', 401, 'auth/user-not-found');
    }
    
    // Generate authorization URL
    const authUrl = calendarService.getAuthUrl(userId);
    
    res.status(200).json({
      success: true,
      authUrl
    });
  } catch (error) {
    next(error);
  }
});

// Handle OAuth callback
router.get('/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      throw new AppError('Authorization code and state are required', 400, 'calendar/invalid-callback');
    }
    
    // Handle the callback
    await calendarService.handleCallback(code as string, state as string);
    
    // Redirect to frontend with success message
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/calendar/success`);
  } catch (error) {
    // Redirect to frontend with error message
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/calendar/error`);
  }
});

// Get calendar events
router.get('/events', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      throw new AppError('User ID not found', 401, 'auth/user-not-found');
    }
    
    const { startDate, endDate, limit } = req.query;
    
    // Parse query parameters
    const startDateObj = startDate ? new Date(startDate as string) : undefined;
    const endDateObj = endDate ? new Date(endDate as string) : undefined;
    const limitNum = limit ? parseInt(limit as string, 10) : undefined;
    
    // Get events
    try {
      const events = await calendarService.getEvents(
        userId,
        startDateObj,
        endDateObj,
        limitNum
      );
      
      res.status(200).json({ events });
    } catch (error: any) {
      if (error.message === 'User not authorized for Google Calendar') {
        throw new AppError('Google Calendar not authorized', 401, 'calendar/not-authorized');
      } else {
        throw new AppError('Failed to get calendar events', 500, 'calendar/api-error');
      }
    }
  } catch (error) {
    next(error);
  }
});

// Create calendar event
router.post('/events', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      throw new AppError('User ID not found', 401, 'auth/user-not-found');
    }
    
    const { summary, description, start, end, pitchId } = req.body;
    
    // Validate input
    if (!summary || !start || !end) {
      throw new AppError('Summary, start, and end are required', 400, 'validation/invalid-input');
    }
    
    // Create event
    try {
      const event = await calendarService.createEvent(userId, {
        summary,
        description,
        start,
        end
      });
      
      // If pitchId is provided, update the pitch with the calendar event ID
      if (pitchId) {
        // In a real implementation, you would update the pitch document in Firestore
        // For this example, we'll skip this step
      }
      
      res.status(201).json(event);
    } catch (error: any) {
      if (error.message === 'User not authorized for Google Calendar') {
        throw new AppError('Google Calendar not authorized', 401, 'calendar/not-authorized');
      } else {
        throw new AppError('Failed to create calendar event', 500, 'calendar/api-error');
      }
    }
  } catch (error) {
    next(error);
  }
});

// Update calendar event
router.put('/events/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.uid;
    const eventId = req.params.id;
    
    if (!userId) {
      throw new AppError('User ID not found', 401, 'auth/user-not-found');
    }
    
    const { summary, description, start, end } = req.body;
    
    // Validate input
    if (!summary || !start || !end) {
      throw new AppError('Summary, start, and end are required', 400, 'validation/invalid-input');
    }
    
    // Update event
    try {
      const event = await calendarService.updateEvent(userId, eventId, {
        summary,
        description,
        start,
        end
      });
      
      res.status(200).json(event);
    } catch (error: any) {
      if (error.message === 'User not authorized for Google Calendar') {
        throw new AppError('Google Calendar not authorized', 401, 'calendar/not-authorized');
      } else if (error.message.includes('not found')) {
        throw new AppError('Event not found', 404, 'calendar/event-not-found');
      } else {
        throw new AppError('Failed to update calendar event', 500, 'calendar/api-error');
      }
    }
  } catch (error) {
    next(error);
  }
});

// Delete calendar event
router.delete('/events/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.uid;
    const eventId = req.params.id;
    
    if (!userId) {
      throw new AppError('User ID not found', 401, 'auth/user-not-found');
    }
    
    // Delete event
    try {
      await calendarService.deleteEvent(userId, eventId);
      
      res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error: any) {
      if (error.message === 'User not authorized for Google Calendar') {
        throw new AppError('Google Calendar not authorized', 401, 'calendar/not-authorized');
      } else if (error.message.includes('not found')) {
        throw new AppError('Event not found', 404, 'calendar/event-not-found');
      } else {
        throw new AppError('Failed to delete calendar event', 500, 'calendar/api-error');
      }
    }
  } catch (error) {
    next(error);
  }
});

export const calendarRoutes = router;
