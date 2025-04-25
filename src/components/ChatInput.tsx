'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useChat } from '@/context/ChatContext';
import { processFileUpload } from '@/lib/fileHandler';
import { Attachment } from '@/types';
import { FiSend, FiPaperclip, FiX } from 'react-icons/fi';

export default function ChatInput() {
  const { sendMessage, isLoading, selectedModelId, models } = useChat();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedModel = models.find((m) => m.id === selectedModelId);
  const supportsImages = selectedModel?.multimodal || false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && attachments.length === 0) return;

    const currentMessage = message;
    const currentAttachments = [...attachments];

    // Clear input field before sending the request
    setMessage('');
    setAttachments([]);

    // Then send the message with the saved content
    await sendMessage(currentMessage, currentAttachments);
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

      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch (error) {
      console.error('Error processing file:', error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col w-full flex-shrink-0"
    >
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((attachment, index) => (
            <div key={index} className="relative">
              {attachment.type === 'image' ? (
                <div className="relative w-16 h-16 rounded-md overflow-hidden">
                  <Image
                    src={attachment.url}
                    alt={attachment.name || 'Attachment'}
                    className="object-cover"
                    fill
                    sizes="64px"
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
                  <span className="text-xs truncate max-w-[100px]">
                    {attachment.name}
                  </span>
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

      <div className="flex items-center border border-gray-600 rounded-lg overflow-hidden bg-gray-700">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-3 focus:outline-none bg-transparent text-gray-100 placeholder-gray-400"
          rows={1}
          maxLength={4000}
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
              className="p-3 text-gray-400 hover:text-gray-200 transition-colors"
              disabled={isLoading}
            >
              <FiPaperclip />
            </button>
          </>
        )}

        <button
          type="submit"
          className="p-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          disabled={isLoading || (!message.trim() && attachments.length === 0)}
        >
          <FiSend />
        </button>
      </div>

      {isLoading && (
        <div className="text-center text-sm text-gray-400 mt-2">
          AI is thinking...
        </div>
      )}
    </form>
  );
}
