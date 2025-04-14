'use client';

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useChat } from '@/context/ChatContext';
import { processTextFile } from '@/lib/fileHandler';
import { FiFile, FiX } from 'react-icons/fi';

export default function DocumentUploader() {
  const { documents, addDocument, removeDocument } = useChat();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Only process text files
        if (!file.type.includes('text') && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
          continue;
        }
        
        const content = await processTextFile(file);
        
        addDocument({
          id: uuidv4(),
          name: file.name,
          content,
          type: file.type
        });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setIsUploading(false);
      // Reset the input
      e.target.value = '';
    }
  };

  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium">
          Context Documents
        </label>
        <label className="cursor-pointer bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-1 rounded-md text-sm">
          Upload
          <input
            type="file"
            accept=".txt,.md,text/plain,text/markdown"
            onChange={handleFileUpload}
            className="hidden"
            multiple
            disabled={isUploading}
          />
        </label>
      </div>
      
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {documents.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-2 text-sm">
            No documents added
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
            >
              <div className="flex items-center">
                <FiFile className="mr-2" />
                <span className="text-sm truncate max-w-[200px]">{doc.name}</span>
              </div>
              <button
                onClick={() => removeDocument(doc.id)}
                className="p-1 text-gray-500 hover:text-red-500"
                aria-label="Remove document"
              >
                <FiX />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
