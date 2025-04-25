'use client';

import React from 'react';
import { useChat } from '@/context/ChatContext';
import { FiPlus, FiMessageSquare, FiTrash2 } from 'react-icons/fi';

export default function SessionList() {
  const {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    createNewSession,
    deleteCurrentSession,
  } = useChat();

  return (
    <div className="w-full flex-grow flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Chat Sessions</h2>
        <button
          onClick={createNewSession}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          aria-label="New chat"
        >
          <FiPlus />
        </button>
      </div>

      <div className="space-y-2 overflow-y-auto flex-grow">
        {sessions.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            No sessions yet. Create a new one!
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                currentSessionId === session.id
                  ? 'bg-blue-900 border border-blue-700'
                  : 'hover:bg-gray-700 border border-gray-700'
              }`}
              onClick={() => setCurrentSessionId(session.id)}
            >
              <div className="flex items-center">
                <FiMessageSquare className="mr-2" />
                <div>
                  <div className="font-medium truncate max-w-[180px]">
                    {session.title}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(session.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {currentSessionId === session.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCurrentSession();
                  }}
                  className="p-1 text-red-400 hover:bg-red-900 rounded-full"
                  aria-label="Delete session"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
