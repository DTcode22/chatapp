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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <FiMessageSquare className="text-2xl mr-2" />
          <h1 className="text-xl font-bold">AI Chat App</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto p-4 flex flex-col md:flex-row gap-4">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4 space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <ModelSelector />
          <DocumentUploader />
          <SessionList />
        </aside>

        {/* Chat area */}
        <section className="w-full md:w-3/4 flex flex-col gap-4">
          <ChatWindow />
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <ChatInput />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 p-4 text-center text-gray-600 dark:text-gray-400 text-sm">
        <p>Powered by OpenRouter Free Models</p>
      </footer>
    </div>
  );
}
