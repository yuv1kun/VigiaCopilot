
/**
 * Utility for text-to-speech functionality using the Web Speech API
 */

// Check if the browser supports speech synthesis
const isSpeechSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

// Store voices once loaded to avoid repeated calls
let cachedVoices: SpeechSynthesisVoice[] = [];

/**
 * Get available voices and ensure they're loaded
 * Chrome requires voices to be loaded asynchronously
 */
export const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported) {
      resolve([]);
      return;
    }

    // If we already have voices cached, return them immediately
    if (cachedVoices.length > 0) {
      resolve(cachedVoices);
      return;
    }

    // Try to get voices immediately first
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedVoices = voices;
      resolve(voices);
      return;
    }

    // If voices aren't available immediately, wait for the voiceschanged event
    const voicesChangedHandler = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
      window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
    };

    window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
  });
};

/**
 * Speaks the given text using the Web Speech API
 * @param text - The text to speak
 */
export const speak = async (text: string): Promise<void> => {
  if (!isSpeechSynthesisSupported) {
    console.warn('Speech synthesis is not supported in this browser');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Create a new utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Get available voices
  const voices = await getVoices();
  
  // Set preferred voice (female English voice)
  const femaleEnglishVoices = voices.filter(
    voice => voice.lang.includes('en') && voice.name.toLowerCase().includes('female')
  );
  
  if (femaleEnglishVoices.length > 0) {
    utterance.voice = femaleEnglishVoices[0];
    console.log('Using voice:', femaleEnglishVoices[0].name);
  } else {
    // Find any English voice as fallback
    const englishVoices = voices.filter(voice => voice.lang.includes('en'));
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices[0];
      console.log('Using fallback voice:', englishVoices[0].name);
    } else {
      console.log('No suitable English voice found, using default browser voice');
    }
  }
  
  // Set voice properties
  utterance.rate = 1.0; // Normal speed
  utterance.pitch = 1.0; // Normal pitch
  utterance.volume = 1.0; // Full volume
  
  // Add event handlers for debugging
  utterance.onstart = () => console.log('Speech started');
  utterance.onend = () => console.log('Speech ended');
  utterance.onerror = (event) => console.error('Speech error:', event);
  
  // Speak the text
  window.speechSynthesis.speak(utterance);
};

/**
 * Stops any ongoing speech
 */
export const stopSpeaking = (): void => {
  if (isSpeechSynthesisSupported) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Checks if the browser is currently speaking
 * @returns boolean indicating if speech is in progress
 */
export const isSpeaking = (): boolean => {
  if (isSpeechSynthesisSupported) {
    return window.speechSynthesis.speaking;
  }
  return false;
};

// Initialize voices when this module loads
if (isSpeechSynthesisSupported) {
  getVoices().then(voices => {
    console.log(`Loaded ${voices.length} speech synthesis voices`);
  });
}
