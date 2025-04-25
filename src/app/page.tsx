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
    <div className="h-screen flex flex-col overflow-hidden bg-gray-900">
      <header className="bg-gray-800 text-white p-4 shadow-md flex-shrink-0 border-b border-gray-700">
        <div className="container mx-auto flex items-center">
          <FiMessageSquare className="text-2xl mr-2 text-blue-400" />
          <h1 className="text-xl font-bold">ChatApp</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 flex flex-col md:flex-row gap-4 overflow-hidden">
        <aside className="w-full md:w-1/4 space-y-6 p-4 bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-700">
          <ModelSelector />
          <DocumentUploader />
          <SessionList />
        </aside>

        <section className="w-full md:w-3/4 flex flex-col gap-4 overflow-hidden">
          <ChatWindow />
          <div className="p-4 bg-gray-800 rounded-lg shadow-md border border-gray-700">
            <ChatInput />
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 p-2 text-center text-gray-400 text-sm flex-shrink-0 border-t border-gray-700">
        <p>Powered by OpenRouter Free Models</p>
      </footer>
    </div>
  );
}
