'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatSession, Message, OpenRouterModel, Document, Attachment } from '@/types';
import { getChatCompletion, parseModels } from '@/lib/api';
import {
  getSessions,
  getCurrentSessionId,
  setCurrentSessionId,
  createSession,
  getSessionById,
  updateSession,
  deleteSession,
  addMessageToSession,
  initializeSessionsIfEmpty
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
  
  // Methods
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
  const [currentSessionId, setCurrentSessionIdState] = useState<string | null>(null);
  const [models] = useState<OpenRouterModel[]>(parseModels());
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize on client-side only
  useEffect(() => {
    // Set default model to the first one
    const defaultModelId = models.length > 0 ? models[0].id : '';
    setSelectedModelId(defaultModelId);
    
    // Load sessions from local storage
    const storedSessions = getSessions();
    setSessions(storedSessions);
    
    // Initialize current session
    const currentId = initializeSessionsIfEmpty(defaultModelId);
    setCurrentSessionIdState(currentId);
  }, [models]);

  // Get current session
  const currentSession = currentSessionId 
    ? sessions.find(session => session.id === currentSessionId) || null 
    : null;

  // Set current session ID
  const handleSetCurrentSessionId = (id: string) => {
    setCurrentSessionId(id);
    setCurrentSessionIdState(id);
  };

  // Create a new session
  const createNewSession = () => {
    const newSession = createSession(selectedModelId);
    setSessions([...sessions, newSession]);
    setCurrentSessionIdState(newSession.id);
  };

  // Delete current session
  const deleteCurrentSession = () => {
    if (!currentSessionId) return;
    
    deleteSession(currentSessionId);
    const updatedSessions = sessions.filter(session => session.id !== currentSessionId);
    setSessions(updatedSessions);
    
    // Set new current session
    if (updatedSessions.length > 0) {
      const newCurrentId = updatedSessions[0].id;
      setCurrentSessionId(newCurrentId);
      setCurrentSessionIdState(newCurrentId);
    } else {
      // Create a new session if none left
      createNewSession();
    }
  };

  // Send a message
  const sendMessage = async (content: string, attachments: Attachment[] = []) => {
    if (!currentSessionId || !content.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create user message
      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content,
        timestamp: Date.now(),
        attachments
      };
      
      // Add user message to session
      addMessageToSession(currentSessionId, userMessage);
      
      // Get updated session with the new message
      const updatedSession = getSessionById(currentSessionId);
      if (!updatedSession) throw new Error('Session not found');
      
      // Update local state
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === currentSessionId ? updatedSession : session
        )
      );
      
      // Prepare context from documents if any
      let contextContent = '';
      if (documents.length > 0) {
        contextContent = 'Context information:\n' + 
          documents.map(doc => `${doc.name}:\n${doc.content}`).join('\n\n');
      }
      
      // Add system message with context if needed
      const messagesForApi = [...updatedSession.messages];
      if (contextContent && messagesForApi.findIndex(m => m.role === 'system') === -1) {
        messagesForApi.unshift({
          id: uuidv4(),
          role: 'system',
          content: contextContent,
          timestamp: Date.now()
        });
      }
      
      // Get AI response
      const aiResponse = await getChatCompletion(
        messagesForApi,
        updatedSession.modelId
      );
      
      // Create assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now()
      };
      
      // Add assistant message to session
      addMessageToSession(currentSessionId, assistantMessage);
      
      // Get final updated session
      const finalSession = getSessionById(currentSessionId);
      if (!finalSession) throw new Error('Session not found');
      
      // Update local state
      setSessions(prevSessions => 
        prevSessions.map(session => 
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

  // Select a model
  const selectModel = (modelId: string) => {
    setSelectedModelId(modelId);
    
    // Update current session model if it exists
    if (currentSessionId) {
      const session = getSessionById(currentSessionId);
      if (session) {
        session.modelId = modelId;
        updateSession(session);
        
        // Update local state
        setSessions(prevSessions => 
          prevSessions.map(s => 
            s.id === currentSessionId ? session : s
          )
        );
      }
    }
  };

  // Add a document
  const addDocument = (doc: Document) => {
    setDocuments(prev => [...prev, doc]);
  };

  // Remove a document
  const removeDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
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
    removeDocument
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
