'use client';

import React from 'react';
import { useChat } from '@/context/ChatContext';

export default function ModelSelector() {
  const { models, selectedModelId, selectModel } = useChat();

  return (
    <div className="w-full mb-4">
      <label htmlFor="model-selector" className="block text-sm font-medium mb-2">
        Select Model
      </label>
      <select
        id="model-selector"
        value={selectedModelId}
        onChange={(e) => selectModel(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
      >
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name} {model.multimodal ? '(Supports Images)' : ''}
          </option>
        ))}
      </select>
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {selectedModelId && models.find(m => m.id === selectedModelId)?.contextLength 
          ? `Context length: ${models.find(m => m.id === selectedModelId)?.contextLength} tokens` 
          : ''}
      </div>
    </div>
  );
}
