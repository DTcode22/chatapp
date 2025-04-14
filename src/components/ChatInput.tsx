'use client';

import React, { useState, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import { processFileUpload } from '@/lib/fileHandler';
import { Attachment } from '@/types';
import { FiSend, FiPaperclip, FiX } from 'react-icons/fi';

export default function ChatInput() {
  const { sendMessage, isLoading, selectedModelId, models } = useChat();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if selected model supports images
  const selectedModel = models.find(m => m.id === selectedModelId);
  const supportsImages = selectedModel?.multimodal || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && attachments.length === 0) return;
    
    await sendMessage(message, attachments);
    setMessage('');
    setAttachments([]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      const newAttachments: Attachment[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const attachment = await processFileUpload(files[i]);
        newAttachments.push(attachment);
      }
      
      setAttachments(prev => [...prev, ...newAttachments]);
    } catch (error) {
      console.error('Error processing file:', error);
    }
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((attachment, index) => (
            <div key={index} className="relative">
              {attachment.type === 'image' ? (
                <div className="relative w-16 h-16 rounded-md overflow-hidden">
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/3 -translate-y-1/3"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-md p-2 pr-8">
                  <span className="text-xs truncate max-w-[100px]">{attachment.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/3 -translate-y-1/3"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Input area */}
      <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-3 focus:outline-none bg-transparent"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        
        {supportsImages && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*"
              multiple
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={isLoading}
            >
              <FiPaperclip />
            </button>
          </>
        )}
        
        <button
          type="submit"
          className="p-3 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          disabled={isLoading || (!message.trim() && attachments.length === 0)}
        >
          <FiSend />
        </button>
      </div>
      
      {isLoading && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
          AI is thinking...
        </div>
      )}
    </form>
  );
}
