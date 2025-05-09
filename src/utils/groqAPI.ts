
/**
 * Utility for making requests to Groq's API for LLM analysis and text-to-speech
 */

// Define the message role type to match what's used in AIAssistant
export type MessageRole = 'user' | 'model' | 'system';

// Define the message interface
export interface GroqMessage {
  role: MessageRole;
  content: string;
}

interface GroqChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface GroqTTSResponse {
  audio_url: string;
}

// Groq API URLs
const GROQ_CHAT_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_TTS_API_URL = 'https://api.groq.com/openai/v1/audio/speech';

// Get the API key from environment variables
const getGroqApiKey = (): string | null => {
  const apiKey = import.meta.env.VITE_REACT_APP_GROQ_API_KEY;
  return apiKey || null;
};

/**
 * Check if the Groq API key is available
 */
export const hasGroqApiKey = (): boolean => {
  return !!getGroqApiKey();
};

/**
 * Generate a response using the Groq LLM API
 */
export const generateGroqResponse = async (
  messages: GroqMessage[],
  systemContext?: string
): Promise<string> => {
  const apiKey = getGroqApiKey();
  
  if (!apiKey) {
    throw new Error('Groq API key not found in environment variables');
  }
  
  const apiMessages = [...messages];
  
  // Add system message if provided
  if (systemContext) {
    apiMessages.unshift({
      role: 'system',
      content: systemContext
    });
  }
  
  try {
    const response = await fetch(GROQ_CHAT_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3-70b-8192',
        messages: apiMessages.map(msg => ({
          role: msg.role === 'model' ? 'assistant' : msg.role, // Adjust role naming to match Groq's expected format
          content: msg.content
        })),
        temperature: 0.5,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json() as GroqChatResponse;
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response generated by Groq');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Groq LLM API:', error);
    throw error;
  }
};

/**
 * Generate speech from text using Groq's TTS API
 * Returns an audio URL that can be played
 */
export const generateSpeech = async (text: string): Promise<string> => {
  const apiKey = getGroqApiKey();
  
  if (!apiKey) {
    throw new Error('Groq API key not found in environment variables');
  }
  
  try {
    const response = await fetch(GROQ_TTS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'playai-tts',
        input: text,
        voice: 'sarah', // Use Sarah voice for consistency
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq TTS API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json() as GroqTTSResponse;
    return data.audio_url;
  } catch (error) {
    console.error('Error calling Groq TTS API:', error);
    throw error;
  }
};
