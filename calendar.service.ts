import { google, calendar_v3 } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Initialize Calendar API
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Store tokens by user ID (in production, store these in a database)
const userTokens: Record<string, any> = {};

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: string | Date;
  end: string | Date;
  htmlLink?: string;
}

export const getAuthUrl = (userId: string): string => {
  const scopes = ['https://www.googleapis.com/auth/calendar'];
  
  // Generate a state parameter that includes the user ID
  const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
  
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state,
  });
  
  return url;
};

export const handleCallback = async (code: string, state: string): Promise<void> => {
  try {
    // Decode the state parameter to get the user ID
    const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
    const userId = decodedState.userId;
    
    // Exchange the code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store the tokens for this user
    userTokens[userId] = tokens;
    
    // Set the credentials for this request
    oauth2Client.setCredentials(tokens);
  } catch (error) {
    console.error('Error handling Google OAuth callback:', error);
    throw new Error('Failed to authenticate with Google Calendar');
  }
};

export const getEvents = async (
  userId: string,
  startDate?: Date,
  endDate?: Date,
  limit: number = 10
): Promise<CalendarEvent[]> => {
  try {
    // Set the credentials for this user
    const tokens = userTokens[userId];
    if (!tokens) {
      throw new Error('User not authorized for Google Calendar');
    }
    
    oauth2Client.setCredentials(tokens);
    
    // Prepare the request parameters
    const params: calendar_v3.Params$Resource$Events$List = {
      calendarId: 'primary',
      maxResults: limit,
      singleEvents: true,
      orderBy: 'startTime',
    };
    
    if (startDate) {
      params.timeMin = startDate.toISOString();
    }
    
    if (endDate) {
      params.timeMax = endDate.toISOString();
    }
    
    // Get the events
    const response = await calendar.events.list(params);
    
    // Map the response to our CalendarEvent interface
    return (response.data.items || []).map(event => ({
      id: event.id,
      summary: event.summary || 'Untitled Event',
      description: event.description,
      start: event.start?.dateTime || event.start?.date || '',
      end: event.end?.dateTime || event.end?.date || '',
      htmlLink: event.htmlLink,
    }));
  } catch (error) {
    console.error('Error getting Google Calendar events:', error);
    throw new Error('Failed to get calendar events');
  }
};

export const createEvent = async (
  userId: string,
  event: CalendarEvent
): Promise<CalendarEvent> => {
  try {
    // Set the credentials for this user
    const tokens = userTokens[userId];
    if (!tokens) {
      throw new Error('User not authorized for Google Calendar');
    }
    
    oauth2Client.setCredentials(tokens);
    
    // Prepare the event resource
    const eventResource: calendar_v3.Schema$Event = {
      summary: event.summary,
      description: event.description,
      start: {
        dateTime: new Date(event.start).toISOString(),
      },
      end: {
        dateTime: new Date(event.end).toISOString(),
      },
    };
    
    // Create the event
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: eventResource,
    });
    
    // Return the created event
    return {
      id: response.data.id,
      summary: response.data.summary || 'Untitled Event',
      description: response.data.description,
      start: response.data.start?.dateTime || response.data.start?.date || '',
      end: response.data.end?.dateTime || response.data.end?.date || '',
      htmlLink: response.data.htmlLink,
    };
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    throw new Error('Failed to create calendar event');
  }
};

export const updateEvent = async (
  userId: string,
  eventId: string,
  event: CalendarEvent
): Promise<CalendarEvent> => {
  try {
    // Set the credentials for this user
    const tokens = userTokens[userId];
    if (!tokens) {
      throw new Error('User not authorized for Google Calendar');
    }
    
    oauth2Client.setCredentials(tokens);
    
    // Prepare the event resource
    const eventResource: calendar_v3.Schema$Event = {
      summary: event.summary,
      description: event.description,
      start: {
        dateTime: new Date(event.start).toISOString(),
      },
      end: {
        dateTime: new Date(event.end).toISOString(),
      },
    };
    
    // Update the event
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: eventResource,
    });
    
    // Return the updated event
    return {
      id: response.data.id,
      summary: response.data.summary || 'Untitled Event',
      description: response.data.description,
      start: response.data.start?.dateTime || response.data.start?.date || '',
      end: response.data.end?.dateTime || response.data.end?.date || '',
      htmlLink: response.data.htmlLink,
    };
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    throw new Error('Failed to update calendar event');
  }
};

export const deleteEvent = async (
  userId: string,
  eventId: string
): Promise<void> => {
  try {
    // Set the credentials for this user
    const tokens = userTokens[userId];
    if (!tokens) {
      throw new Error('User not authorized for Google Calendar');
    }
    
    oauth2Client.setCredentials(tokens);
    
    // Delete the event
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    throw new Error('Failed to delete calendar event');
  }
};
