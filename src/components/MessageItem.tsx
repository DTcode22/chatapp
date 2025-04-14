'use client';

import React from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Message } from '@/types';
import { FiUser, FiCpu } from 'react-icons/fi';

interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`flex max-w-[80%] ${
          isUser
            ? 'bg-blue-500 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg'
            : 'bg-gray-200 dark:bg-gray-800 rounded-tl-lg rounded-tr-lg rounded-br-lg'
        } p-3`}
      >
        <div className="mr-3 mt-1">
          {isUser ? (
            <FiUser className="w-5 h-5" />
          ) : (
            <FiCpu className="w-5 h-5" />
          )}
        </div>
        
        <div className="flex flex-col">
          {/* Message content */}
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
          
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment, index) => (
                <div key={index}>
                  {attachment.type === 'image' && (
                    <div className="relative w-full max-w-[300px] h-[200px]">
                      <Image
                        src={attachment.url}
                        alt={attachment.name || 'Attached image'}
                        fill
                        style={{ objectFit: 'contain' }}
                        className="rounded-md"
                      />
                    </div>
                  )}
                  {attachment.type === 'file' && (
                    <div className="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                      <FiUser className="mr-2" />
                      <span>{attachment.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Timestamp */}
          <div className="text-xs mt-1 opacity-70">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}
