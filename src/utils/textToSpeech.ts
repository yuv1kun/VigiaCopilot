
/**
 * Utility for text-to-speech functionality using the Web Speech API
 */

// Check if the browser supports speech synthesis
const isSpeechSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

// Store voices once loaded to avoid repeated calls
let cachedVoices: SpeechSynthesisVoice[] = [];

// Track the current utterance
let currentUtterance: SpeechSynthesisUtterance | null = null;

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
 * Chunk text for more reliable speech synthesis
 * This helps prevent the speech synthesis from cutting off for longer texts
 * @param text - Text to chunk
 */
const chunkText = (text: string): string[] => {
  // First try to split on double newlines (paragraph breaks) for more natural chunks
  const paragraphs = text.split(/\n\n+/);
  if (paragraphs.length > 1) {
    // Further chunk any paragraphs that are too long
    const chunks: string[] = [];
    for (const paragraph of paragraphs) {
      if (paragraph.length > 150) {
        // For long paragraphs, split by sentence breaks
        const sentenceChunks = chunkSentences(paragraph);
        chunks.push(...sentenceChunks);
      } else if (paragraph.trim()) {
        // Only add non-empty paragraphs
        chunks.push(paragraph.trim());
      }
    }
    return chunks;
  }
  
  // If no paragraph breaks or text is very short, use sentence chunking
  return chunkSentences(text);
};

/**
 * Helper function to chunk text by sentences
 */
const chunkSentences = (text: string): string[] => {
  // Split text at sentence boundaries for more natural breaks
  const sentenceBreaks = text.match(/[^.!?]+[.!?]+/g) || [];
  
  // If no sentence breaks or text is short enough, return as is
  if (sentenceBreaks.length === 0 || text.length < 150) {
    return [text];
  }
  
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentenceBreaks) {
    // If adding this sentence would make the chunk too long, start a new chunk
    if ((currentChunk + sentence).length > 200 && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }
  
  // Add the last chunk if there's anything left
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
};

/**
 * Process and clean text for better speech synthesis
 */
const processTextForSpeech = (text: string): string => {
  // Replace common abbreviations and symbols for better pronunciation
  return text
    .replace(/\n/g, ' ')           // Replace newlines with spaces
    .replace(/\s+/g, ' ')          // Normalize whitespace
    .replace(/&/g, ' and ')        // Replace & with "and"
    .replace(/%/g, ' percent ')    // Replace % with "percent"
    .replace(/°C/g, ' degrees Celsius') // Replace temperature symbol
    .replace(/BOP/g, 'B O P')      // Speak acronyms letter by letter
    .replace(/PPE/g, 'P P E')
    .replace(/H2S/g, 'H 2 S')
    .replace(/PSI/g, 'P S I')
    .trim();
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
  stopSpeaking();

  // Get available voices
  const voices = await getVoices();

  // Set preferred voice (female English voice)
  const femaleEnglishVoices = voices.filter(
    voice => voice.lang.includes('en') && voice.name.toLowerCase().includes('female')
  );
  
  let selectedVoice = null;
  if (femaleEnglishVoices.length > 0) {
    selectedVoice = femaleEnglishVoices[0];
    console.log('Using voice:', femaleEnglishVoices[0].name);
  } else {
    // Find any English voice as fallback
    const englishVoices = voices.filter(voice => voice.lang.includes('en'));
    if (englishVoices.length > 0) {
      selectedVoice = englishVoices[0];
      console.log('Using fallback voice:', englishVoices[0].name);
    } else {
      console.log('No suitable English voice found, using default browser voice');
    }
  }

  // Process text for better speech synthesis
  const processedText = processTextForSpeech(text);
  
  // Split text into chunks for more reliable speech synthesis
  const textChunks = chunkText(processedText);
  console.log(`Speaking text in ${textChunks.length} chunks`);
  
  // Process each chunk sequentially
  for (let i = 0; i < textChunks.length; i++) {
    const chunk = textChunks[i];
    await new Promise<void>((resolve, reject) => {
      // Create a new utterance for this chunk
      const utterance = new SpeechSynthesisUtterance(chunk);
      
      // Store the current utterance
      currentUtterance = utterance;
      
      // Set voice if we found a suitable one
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Set voice properties for better clarity
      utterance.rate = 0.95;  // Slightly slower for better comprehension
      utterance.pitch = 1.0;  // Normal pitch
      utterance.volume = 1.0; // Full volume
      
      // Add event handlers
      utterance.onend = () => {
        console.log(`Speech chunk ${i + 1}/${textChunks.length} completed`);
        // Short delay between chunks for more natural pauses
        setTimeout(resolve, 300);
      };
      utterance.onerror = (event) => {
        console.error(`Speech error in chunk ${i + 1}:`, event);
        reject(event);
      };

      // Chrome has a bug where utterances can get cut off
      // This keeps the speech synthesis active
      if (i === textChunks.length - 1) {
        utterance.onboundary = (event) => {
          // Reset speech synthesis periodically to prevent cutoffs
          if (window.speechSynthesis && event.charIndex > 0 && event.charIndex % 50 === 0) {
            const isPaused = !window.speechSynthesis.speaking;
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
            if (isPaused) {
              window.speechSynthesis.pause();
            }
          }
        };
      }
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
    }).catch(err => {
      console.error('Error during speech:', err);
    });
  }
};

/**
 * Stops any ongoing speech
 */
export const stopSpeaking = (): void => {
  if (isSpeechSynthesisSupported) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
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

/**
 * Pauses any ongoing speech
 */
export const pauseSpeaking = (): void => {
  if (isSpeechSynthesisSupported && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
};

/**
 * Resumes any paused speech
 */
export const resumeSpeaking = (): void => {
  if (isSpeechSynthesisSupported && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
};

// Initialize voices when this module loads
if (isSpeechSynthesisSupported) {
  getVoices().then(voices => {
    console.log(`Loaded ${voices.length} speech synthesis voices`);
  });
  
  // Fix for Chrome bug where speech can get cut off
  // Keep speech synthesis alive in Chrome
  if (typeof window !== 'undefined') {
    setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        setTimeout(() => window.speechSynthesis.resume(), 10);
      }
    }, 5000);
  }
}
