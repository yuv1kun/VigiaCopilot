
/**
 * Utility for text-to-speech functionality using the Web Speech API
 */

// Check if the browser supports speech synthesis
const isSpeechSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

/**
 * Speaks the given text using the Web Speech API
 * @param text - The text to speak
 */
export const speak = (text: string): void => {
  if (!isSpeechSynthesisSupported) {
    console.warn('Speech synthesis is not supported in this browser');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Create a new utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set preferred voice (female English voice)
  const voices = window.speechSynthesis.getVoices();
  const femaleEnglishVoices = voices.filter(
    voice => voice.lang.includes('en') && voice.name.toLowerCase().includes('female')
  );
  
  if (femaleEnglishVoices.length > 0) {
    utterance.voice = femaleEnglishVoices[0];
  } else {
    // Find any English voice as fallback
    const englishVoices = voices.filter(voice => voice.lang.includes('en'));
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices[0];
    }
  }
  
  // Set voice properties
  utterance.rate = 1.0; // Normal speed
  utterance.pitch = 1.0; // Normal pitch
  utterance.volume = 1.0; // Full volume
  
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
