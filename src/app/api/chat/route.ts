import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// OpenRouter API endpoint
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Get API key from environment variable
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { messages, model } = await request.json();

    if (!messages || !model) {
      return NextResponse.json(
        { error: 'Messages and model are required' },
        { status: 400 }
      );
    }

    // Make request to OpenRouter API
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model,
        messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': request.headers.get('origin') || 'https://chatapp.example.com',
          'X-Title': 'AI Chat App',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error in chat API route:', error);
    
    // Handle different types of errors
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { error: error.response.data.error || 'Error from OpenRouter API' },
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
