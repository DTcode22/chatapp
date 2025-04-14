import { v4 as uuidv4 } from 'uuid';
import { ChatSession, Message } from '@/types';

const SESSIONS_KEY = 'chat_sessions';
const CURRENT_SESSION_KEY = 'current_session_id';

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

export function saveSessions(sessions: ChatSession[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getCurrentSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(CURRENT_SESSION_KEY);
}

export function setCurrentSessionId(sessionId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
}

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

export function getSessionById(sessionId: string): ChatSession | null {
  const sessions = getSessions();
  return sessions.find((session) => session.id === sessionId) || null;
}

export function updateSession(updatedSession: ChatSession): void {
  const sessions = getSessions();
  const index = sessions.findIndex(
    (session) => session.id === updatedSession.id
  );

  if (index !== -1) {
    updatedSession.updatedAt = Date.now();
    sessions[index] = updatedSession;
    saveSessions(sessions);
  }
}

export function deleteSession(sessionId: string): void {
  let sessions = getSessions();
  sessions = sessions.filter((session) => session.id !== sessionId);
  saveSessions(sessions);

  if (getCurrentSessionId() === sessionId) {
    setCurrentSessionId(sessions.length > 0 ? sessions[0].id : '');
  }
}

export function addMessageToSession(sessionId: string, message: Message): void {
  const session = getSessionById(sessionId);
  if (!session) return;

  session.messages.push(message);
  session.updatedAt = Date.now();

  if (message.role === 'user' && session.title === 'New Chat') {
    session.title =
      message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
  }

  updateSession(session);
}

export function initializeSessionsIfEmpty(defaultModelId: string): string {
  const sessions = getSessions();
  let currentId = getCurrentSessionId();

  if (sessions.length === 0 || !currentId) {
    const newSession = createSession(defaultModelId);
    currentId = newSession.id;
  }

  return currentId;
}
