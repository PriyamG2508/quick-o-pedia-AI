// API service for communicating with the FastAPI backend
import { config } from './config';

const API_BASE_URL = config.apiUrl;

export interface ScrapeRequest {
  topic: string;
}

export interface ScrapeResponse {
  topic: string;
  content_length: number;
  word_count: number;
  content: string;
}

export interface ChatRequest {
  topic: string;
  question: string;
}

export interface ChatResponse {
  topic: string;
  question: string;
  answer: string;
}

export interface HealthResponse {
  status: string;
  message: string;
  groq_api_configured: boolean;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, errorData.detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Health check
  async healthCheck(): Promise<HealthResponse> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse<HealthResponse>(response);
  },

  // Scrape Wikipedia content
  async scrapeWikipedia(topic: string): Promise<ScrapeResponse> {
    const response = await fetch(`${API_BASE_URL}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });
    return handleResponse<ScrapeResponse>(response);
  },

  // Chat with Wikipedia content
  async chatWithWikipedia(topic: string, question: string): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, question }),
    });
    return handleResponse<ChatResponse>(response);
  },
};

export { ApiError };
