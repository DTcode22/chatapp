'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  ChatSession,
  Message,
  OpenRouterModel,
  Document,
  Attachment,
} from '@/types';
import { getChatCompletion, parseModels } from '@/lib/api';
import {
  getSessions,
  setCurrentSessionId,
  createSession,
  getSessionById,
  updateSession,
  deleteSession,
  addMessageToSession,
  initializeSessionsIfEmpty,
} from '@/lib/sessionManager';

interface ChatContextType {
  sessions: ChatSession[];
  currentSessionId: string | null;
  currentSession: ChatSession | null;
  models: OpenRouterModel[];
  selectedModelId: string;
  documents: Document[];
  isLoading: boolean;
  error: string | null;

  setCurrentSessionId: (id: string) => void;
  createNewSession: () => void;
  deleteCurrentSession: () => void;
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  selectModel: (modelId: string) => void;
  addDocument: (doc: Document) => void;
  removeDocument: (docId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionIdState] = useState<string | null>(
    null
  );
  const [models] = useState<OpenRouterModel[]>(parseModels());
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const defaultModelId = models.length > 0 ? models[0].id : '';
    setSelectedModelId(defaultModelId);

    const storedSessions = getSessions();
    setSessions(storedSessions);

    const currentId = initializeSessionsIfEmpty(defaultModelId);
    setCurrentSessionIdState(currentId);
  }, [models]);

  const currentSession = currentSessionId
    ? sessions.find((session) => session.id === currentSessionId) || null
    : null;

  const handleSetCurrentSessionId = (id: string) => {
    setCurrentSessionId(id);
    setCurrentSessionIdState(id);
  };

  const createNewSession = () => {
    const newSession = createSession(selectedModelId);
    setSessions([...sessions, newSession]);
    setCurrentSessionIdState(newSession.id);
  };

  const deleteCurrentSession = () => {
    if (!currentSessionId) return;

    deleteSession(currentSessionId);
    const updatedSessions = sessions.filter(
      (session) => session.id !== currentSessionId
    );
    setSessions(updatedSessions);

    if (updatedSessions.length > 0) {
      const newCurrentId = updatedSessions[0].id;
      setCurrentSessionId(newCurrentId);
      setCurrentSessionIdState(newCurrentId);
    } else {
      createNewSession();
    }
  };

  const sendMessage = async (
    content: string,
    attachments: Attachment[] = []
  ) => {
    if (!currentSessionId || !content.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: Date.now(),
        attachments,
      };

      addMessageToSession(currentSessionId, userMessage);

      const updatedSession = getSessionById(currentSessionId);
      if (!updatedSession) throw new Error('Session not found');

      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === currentSessionId ? updatedSession : session
        )
      );

      let contextContent = '';
      if (documents.length > 0) {
        contextContent =
          'Context information:\n' +
          documents.map((doc) => `${doc.name}:\n${doc.content}`).join('\n\n');
      }

      const messagesForApi = [...updatedSession.messages];
      if (
        contextContent &&
        messagesForApi.findIndex((m) => m.role === 'system') === -1
      ) {
        messagesForApi.unshift({
          id: uuidv4(),
          role: 'system',
          content: contextContent,
          timestamp: Date.now(),
        });
      }

      const aiResponse = await getChatCompletion(
        messagesForApi,
        updatedSession.modelId
      );

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
      };

      addMessageToSession(currentSessionId, assistantMessage);

      const finalSession = getSessionById(currentSessionId);
      if (!finalSession) throw new Error('Session not found');

      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === currentSessionId ? finalSession : session
        )
      );
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const selectModel = (modelId: string) => {
    setSelectedModelId(modelId);

    if (currentSessionId) {
      const session = getSessionById(currentSessionId);
      if (session) {
        session.modelId = modelId;
        updateSession(session);

        setSessions((prevSessions) =>
          prevSessions.map((s) => (s.id === currentSessionId ? session : s))
        );
      }
    }
  };

  const addDocument = (doc: Document) => {
    setDocuments((prev) => [...prev, doc]);
  };

  const removeDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  const value = {
    sessions,
    currentSessionId,
    currentSession,
    models,
    selectedModelId,
    documents,
    isLoading,
    error,

    setCurrentSessionId: handleSetCurrentSessionId,
    createNewSession,
    deleteCurrentSession,
    sendMessage,
    selectModel,
    addDocument,
    removeDocument,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
