'use client';

import React, { useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import MessageItem from './MessageItem';

export default function ChatWindow() {
  const { currentSession } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  if (!currentSession) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">
          Select a chat session or create a new one to start
        </p>
      </div>
    );
  }

  return (
    <div className="flex-grow p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg">
      {currentSession.messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center">
          <h3 className="text-xl font-semibold mb-2">
            Start a new conversation
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
            Send a message to start chatting with the AI assistant.
            {currentSession.modelId && (
              <span className="block mt-2">
                Using model: {currentSession.modelId}
              </span>
            )}
          </p>
        </div>
      ) : (
        <>
          {currentSession.messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
