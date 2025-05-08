
/**
 * Utility for making requests to Google's Gemini API
 */

// Store API key locally
let apiKey: string | null = localStorage.getItem('geminiApiKey');

/**
 * Set the Gemini API key and store it in localStorage
 */
export const setGeminiApiKey = (key: string): void => {
  apiKey = key;
  localStorage.setItem('geminiApiKey', key);
};

/**
 * Get the currently stored Gemini API key
 */
export const getGeminiApiKey = (): string | null => {
  return apiKey;
};

/**
 * Clear the stored API key
 */
export const clearGeminiApiKey = (): void => {
  apiKey = null;
  localStorage.removeItem('geminiApiKey');
};

/**
 * Check if the API key is set
 */
export const hasGeminiApiKey = (): boolean => {
  return !!apiKey;
};

// Define the message role type to match what's used in AIAssistant
export type MessageRole = 'user' | 'model' | 'system';

// Define the message interface
export interface GeminiMessage {
  role: MessageRole;
  content: string;
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
  }[];
}

/**
 * Generate a response using the Gemini API
 */
export const generateGeminiResponse = async (
  messages: GeminiMessage[],
  systemContext?: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error('Gemini API key not set');
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
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: apiMessages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }],
          })),
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json() as GeminiResponse;
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};
