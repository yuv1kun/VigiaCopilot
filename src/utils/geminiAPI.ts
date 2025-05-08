
/**
 * Utility for making requests to Google's Gemini API
 */

import { supabase } from '@/lib/supabase';

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
 * Get the Gemini API key for the current user from Supabase
 */
export const getGeminiApiKey = async (): Promise<string | null> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) {
      console.log('No user logged in');
      return null;
    }

    const { data, error } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('user_id', session.session.user.id)
      .single();

    if (error || !data) {
      console.error('Error fetching API key:', error);
      return null;
    }

    return data.api_key;
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
};

/**
 * Set the Gemini API key for the current user
 */
export const setGeminiApiKey = async (key: string): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.user) {
      console.log('No user logged in');
      return false;
    }

    const { error } = await supabase
      .from('api_keys')
      .upsert(
        { 
          user_id: session.session.user.id, 
          api_key: key,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('Error saving API key:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error setting API key:', error);
    return false;
  }
};

/**
 * Clear the stored API key (fallback for local storage for backward compatibility)
 */
export const clearGeminiApiKey = (): void => {
  localStorage.removeItem('geminiApiKey');
};

/**
 * Check if the current user has an API key stored
 */
export const hasGeminiApiKey = async (): Promise<boolean> => {
  const apiKey = await getGeminiApiKey();
  
  // Fallback to localStorage for backward compatibility
  if (!apiKey) {
    const localKey = localStorage.getItem('geminiApiKey');
    return !!localKey;
  }
  
  return !!apiKey;
};

/**
 * Generate a response using the Gemini API
 */
export const generateGeminiResponse = async (
  messages: GeminiMessage[],
  systemContext?: string
): Promise<string> => {
  let apiKey = await getGeminiApiKey();
  
  // Fallback to localStorage for backward compatibility
  if (!apiKey) {
    apiKey = localStorage.getItem('geminiApiKey');
  }
  
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
