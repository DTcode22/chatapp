'use client';

import React from 'react';
import ModelSelector from '@/components/ModelSelector';
import SessionList from '@/components/SessionList';
import ChatWindow from '@/components/ChatWindow';
import ChatInput from '@/components/ChatInput';
import DocumentUploader from '@/components/DocumentUploader';
import { FiMessageSquare } from 'react-icons/fi';

export default function Home() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="bg-blue-600 text-white p-4 shadow-md flex-shrink-0">
        <div className="container mx-auto flex items-center">
          <FiMessageSquare className="text-2xl mr-2" />
          <h1 className="text-xl font-bold">AI Chat App</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 flex flex-col md:flex-row gap-4 overflow-hidden">
        <aside className="w-full md:w-1/4 space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
          <ModelSelector />
          <DocumentUploader />
          <SessionList />
        </aside>

        <section className="w-full md:w-3/4 flex flex-col gap-4 overflow-hidden">
          <ChatWindow />
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <ChatInput />
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 dark:bg-gray-900 p-2 text-center text-gray-600 dark:text-gray-400 text-sm flex-shrink-0">
        <p>Powered by OpenRouter Free Models</p>
      </footer>
    </div>
  );
}
