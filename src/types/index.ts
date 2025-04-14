export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface Attachment {
  type: 'image' | 'file';
  url: string;
  name: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  modelId: string;
  createdAt: number;
  updatedAt: number;
}

export interface OpenRouterModel {
  id: string;
  name: string;
  contextLength: number;
  multimodal?: boolean;
}

export interface Document {
  id: string;
  name: string;
  content: string;
  type: string;
}
