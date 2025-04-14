import { v4 as uuidv4 } from 'uuid';
import { ChatSession, Message } from '@/types';

// Local storage keys
const SESSIONS_KEY = 'chat_sessions';
const CURRENT_SESSION_KEY = 'current_session_id';

// Get all sessions from local storage
export function getSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  
  const sessionsJson = localStorage.getItem(SESSIONS_KEY);
  if (!sessionsJson) return [];
  
  try {
    return JSON.parse(sessionsJson);
  } catch (error) {
    console.error('Error parsing sessions:', error);
    return [];
  }
}

// Save sessions to local storage
export function saveSessions(sessions: ChatSession[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

// Get current session ID
export function getCurrentSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_SESSION_KEY);
}

// Set current session ID
export function setCurrentSessionId(sessionId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
}

// Create a new session
export function createSession(modelId: string): ChatSession {
  const newSession: ChatSession = {
    id: uuidv4(),
    title: 'New Chat',
    messages: [],
    modelId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  const sessions = getSessions();
  sessions.push(newSession);
  saveSessions(sessions);
  setCurrentSessionId(newSession.id);
  
  return newSession;
}

// Get a session by ID
export function getSessionById(sessionId: string): ChatSession | null {
  const sessions = getSessions();
  return sessions.find(session => session.id === sessionId) || null;
}

// Update a session
export function updateSession(updatedSession: ChatSession): void {
  const sessions = getSessions();
  const index = sessions.findIndex(session => session.id === updatedSession.id);
  
  if (index !== -1) {
    updatedSession.updatedAt = Date.now();
    sessions[index] = updatedSession;
    saveSessions(sessions);
  }
}

// Delete a session
export function deleteSession(sessionId: string): void {
  let sessions = getSessions();
  sessions = sessions.filter(session => session.id !== sessionId);
  saveSessions(sessions);
  
  // If the deleted session was the current one, set current to null
  if (getCurrentSessionId() === sessionId) {
    setCurrentSessionId(sessions.length > 0 ? sessions[0].id : '');
  }
}

// Add a message to a session
export function addMessageToSession(sessionId: string, message: Message): void {
  const session = getSessionById(sessionId);
  if (!session) return;
  
  session.messages.push(message);
  session.updatedAt = Date.now();
  
  // Update session title if it's the first user message
  if (message.role === 'user' && session.title === 'New Chat') {
    session.title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
  }
  
  updateSession(session);
}

// Initialize with a default session if none exists
export function initializeSessionsIfEmpty(defaultModelId: string): string {
  const sessions = getSessions();
  let currentId = getCurrentSessionId();
  
  if (sessions.length === 0 || !currentId) {
    const newSession = createSession(defaultModelId);
    currentId = newSession.id;
  }
  
  return currentId;
}
