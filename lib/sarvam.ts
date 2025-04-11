// lib/sarvam.ts
import axios from 'axios';

// Sarvam AI API configuration
const SARVAM_API_KEY = process.env.SARVAM_API_KEY || '';
const SARVAM_API_BASE_URL = 'https://api.sarvam.ai/v1';

// Available languages for the voice assistant
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', voice: 'en-US-Neural2-F' },
  { code: 'hi', name: 'Hindi', voice: 'hi-IN-Neural2-A' },
  { code: 'ta', name: 'Tamil', voice: 'ta-IN-Neural2-A' },
  { code: 'te', name: 'Telugu', voice: 'te-IN-Neural2-A' },
  { code: 'kn', name: 'Kannada', voice: 'kn-IN-Neural2-A' },
  { code: 'ml', name: 'Malayalam', voice: 'ml-IN-Neural2-A' },
  { code: 'bn', name: 'Bengali', voice: 'bn-IN-Neural2-A' },
  { code: 'gu', name: 'Gujarati', voice: 'gu-IN-Neural2-A' },
  { code: 'mr', name: 'Marathi', voice: 'mr-IN-Neural2-A' },
];

// Initialize the Sarvam AI client
const sarvamClient = axios.create({
  baseURL: SARVAM_API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${SARVAM_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Detect the language of the provided audio
 * @param audioBlob - The audio blob to analyze
 * @returns The detected language code
 */
export async function detectLanguage(audioBlob: Blob): Promise<string> {
  try {
    console.log('Detecting language with Sarvam AI...');

    // Check if we're in development mode and should use mock data
    if (process.env.NODE_ENV === 'development' || !SARVAM_API_KEY) {
      console.log('Using mock language detection in development mode');
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // For development testing, randomly select a language to simulate detection
      const mockLanguages = ['en', 'hi', 'ta', 'te', 'kn', 'ml'];
      const randomIndex = Math.floor(Math.random() * mockLanguages.length);
      const detectedLang = mockLanguages[randomIndex];

      console.log(`Mock detected language: ${detectedLang}`);
      return detectedLang;
    }

    // Convert blob to base64
    const base64Audio = await blobToBase64(audioBlob);

    const response = await sarvamClient.post('/language-detection', {
      audio: base64Audio,
    });

    if (response.data && response.data.language) {
      console.log(`Detected language: ${response.data.language}`);
      return response.data.language;
    }

    // Default to English if detection fails
    console.warn('Language detection failed, defaulting to English');
    return 'en';
  } catch (error) {
    console.error('Error detecting language:', error);
    // Default to English on error
    return 'en';
  }
}

/**
 * Transcribe audio to text in the specified language
 * @param audioBlob - The audio blob to transcribe
 * @param language - The language code (e.g., 'en', 'hi')
 * @returns The transcribed text
 */
export async function transcribeAudio(audioBlob: Blob, language: string = 'en'): Promise<string> {
  try {
    console.log(`Transcribing audio in ${language}...`);

    // Check if we're in development mode and should use mock data
    if (process.env.NODE_ENV === 'development' || !SARVAM_API_KEY) {
      console.log('Using mock transcription in development mode');
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock transcriptions that will trigger different responses from Gemini
      const mockQuestions = {
        'en': [
          'What is the capital of France?',
          'Can you explain how photosynthesis works?',
          'Tell me about the solar system',
          'What is the Pythagorean theorem?',
          'Who was Albert Einstein?'
        ],
        'hi': [
          'फ्रांस की राजधानी क्या है?',
          'क्या आप बता सकते हैं कि प्रकाश संश्लेषण कैसे काम करता है?',
          'मुझे सौर मंडल के बारे में बताओ',
          'पाइथागोरस प्रमेय क्या है?',
          'अल्बर्ट आइंस्टाइन कौन थे?'
        ],
        'ta': [
          'பிரான்சின் தலைநகரம் என்ன?',
          'ஒளிச்சேர்க்கை எவ்வாறு செயல்படுகிறது என்பதை விளக்க முடியுமா?',
          'சூரிய குடும்பத்தைப் பற்றி எனக்குச் சொல்லுங்கள்',
          'பைதாகரஸ் தேற்றம் என்றால் என்ன?',
          'ஆல்பர்ட் ஐன்ஸ்டைன் யார்?'
        ],
        'te': [
          'ఫ్రాన్స్ రాజధాని ఏమిటి?',
          'కిరణజన్య సంయోగక్రియ ఎలా పనిచేస్తుందో వివరించగలరా?',
          'సౌర వ్యవస్థ గురించి నాకు చెప్పండి',
          'పైథాగరస్ సిద్ధాంతం అంటే ఏమిటి?',
          'ఆల్బర్ట్ ఐన్‌స్టీన్ ఎవరు?'
        ]
      };

      // Select a random question based on the language
      const questions = mockQuestions[language as keyof typeof mockQuestions] || mockQuestions['en'];
      const randomIndex = Math.floor(Math.random() * questions.length);
      const mockTranscription = questions[randomIndex];

      console.log(`Mock transcription: ${mockTranscription}`);
      return mockTranscription;
    }

    // Convert blob to base64
    const base64Audio = await blobToBase64(audioBlob);

    const response = await sarvamClient.post('/speech-to-text', {
      audio: base64Audio,
      language: language,
    });

    if (response.data && response.data.text) {
      console.log(`Transcription result: ${response.data.text.substring(0, 100)}...`);
      return response.data.text;
    }

    throw new Error('No transcription result returned');
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

/**
 * Translate text from one language to another
 * @param text - The text to translate
 * @param sourceLanguage - The source language code
 * @param targetLanguage - The target language code
 * @returns The translated text
 */
export async function translateText(
  text: string,
  sourceLanguage: string = 'en',
  targetLanguage: string = 'en'
): Promise<string> {
  // If source and target are the same, return the original text
  if (sourceLanguage === targetLanguage) {
    return text;
  }

  try {
    console.log(`Translating from ${sourceLanguage} to ${targetLanguage}...`);

    // Check if we're in development mode and should use mock data
    if (process.env.NODE_ENV === 'development' || !SARVAM_API_KEY) {
      console.log('Using mock translation in development mode');
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // For development testing, we'll provide mock translations based on common phrases
      // This simulates actual translation while ensuring varied responses

      // Common educational phrases in different languages
      const mockTranslations: Record<string, Record<string, string[]>> = {
        'hi': {
          'capital': 'पेरिस फ्रांस की राजधानी है।',
          'photosynthesis': 'प्रकाश संश्लेषण वह प्रक्रिया है जिसके द्वारा पौधे सूर्य के प्रकाश का उपयोग करके कार्बन डाइऑक्साइड और पानी से ग्लूकोज और ऑक्सीजन बनाते हैं।',
          'solar': 'सौर मंडल हमारे सूर्य और उसके चारों ओर परिक्रमा करने वाले सभी खगोलीय पिंडों का समूह है।',
          'pythagorean': 'पाइथागोरस प्रमेय कहता है कि एक समकोण त्रिभुज में, कर्ण के वर्ग का मान अन्य दो भुजाओं के वर्गों के योग के बराबर होता है।',
          'einstein': 'अल्बर्ट आइंस्टाइन एक प्रसिद्ध सैद्धांतिक भौतिक विज्ञानी थे जिन्होंने आपेक्षिकता के सिद्धांत का विकास किया।'
        },
        'ta': {
          'capital': 'பாரிஸ் பிரான்ஸின் தலைநகரம் ஆகும்.',
          'photosynthesis': 'ஒளிச்சேர்க்கை என்பது தாவரங்கள் சூரிய ஒளியைப் பயன்படுத்தி கார்பன் டை ஆக்ஸைடு மற்றும் நீரிலிருந்து குளூக்கோஸ் மற்றும் ஆக்ஸிஜனை உருவாக்கும் செயல்முறையாகும்.',
          'solar': 'சூரிய குடும்பம் என்பது நமது சூரியனைச் சுற்றி வரும் அனைத்து வானியல் பொருட்களின் தொகுப்பாகும்.',
          'pythagorean': 'பைதாகரஸ் தேற்றம் கூறுவது, ஒரு செங்கோண முக்கோணத்தில், கர்ணத்தின் வர்க்கம் மற்ற இரண்டு பக்கங்களின் வர்க்கங்களின் கூட்டுத்தொகைக்குச் சமமாக இருக்கும்.',
          'einstein': 'ஆல்பர்ட் ஐன்ஸ்டைன் ஒரு பிரபல தத்துவ இயற்பியலாளர், சார்பியல் கோட்பாட்டை உருவாக்கியவர்.'
        },
        'te': {
          'capital': 'ఫ్రాన్స్ రాజధాని పారిస్.',
          'photosynthesis': 'కిరణజన్య సంయోగక్రియ అనేది మొక్కలు సూర్యుడి కాంతిని ఉపయోగించి కార్బన్ డై ఆక్సైడ్ మరియు నీటి నుండి గ్లూకోజ్ మరియు ఆక్సిజన్‌ను తయారు చేసే ప్రక్రియ.',
          'solar': 'సౌర వ్యవస్థ అనేది మన సూర్యుడి చుట్టూ తిరిగే అన్ని ఖగోళ వస్తువుల సముదాయం.',
          'pythagorean': 'పైథాగరస్ సిద్ధాంతం ప్రకారం, లంబకోణ త్రిభుజంలో, కర్ణం యొక్క వర్గం మిగిలిన రెండు భుజాల వర్గాల మొత్తానికి సమానం.',
          'einstein': 'ఆల్బర్ట్ ఐన్‌స్టీన్ ఒక ప్రముఖ సైద్ధాంతిక భౌతిక శాస్త్రవేత్త, సాపేక్షతా సిద్ధాంతాన్ని అభివృద్ధి చేశారు.'
        }
      };

      // For development testing, we'll force translation regardless of content
      // This ensures responses are always in the target language

      // Define some generic responses for each language
      const genericResponses: Record<string, string[]> = {
        'hi': [
          'आपके प्रश्न का उत्तर यह है: ',
          'इस विषय पर मेरी जानकारी के अनुसार: ',
          'मैं आपको बताना चाहूंगा कि: '
        ],
        'ta': [
          'உங்கள் கேள்விக்கான பதில்: ',
          'இந்த தலைப்பில் எனது அறிவுக்கு ஏற்ப: ',
          'நான் உங்களுக்குச் சொல்ல விரும்புகிறேன்: '
        ],
        'te': [
          'మీ ప్రశ్నకు సమాధానం: ',
          'ఈ అంశంపై నా అవగాహన ప్రకారం: ',
          'నేను మీకు చెప్పాలనుకుంటున్నాను: '
        ]
      };

      // Check if we have generic responses for this language
      if (targetLanguage in genericResponses) {
        // Select a random prefix
        const prefixes = genericResponses[targetLanguage];
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];

        // Check if the text contains any of our keywords for more specific translations
        if (targetLanguage in mockTranslations) {
          const translations = mockTranslations[targetLanguage];

          // Check for keywords in the text and replace with translations
          for (const [keyword, translation] of Object.entries(translations)) {
            if (text.toLowerCase().includes(keyword.toLowerCase())) {
              // If we find a keyword, use its translation
              return translation;
            }
          }
        }

        // If no specific translation was found, use the generic prefix with the original text
        // This simulates a translation while preserving the original content
        return randomPrefix + text;
      } else {
        // For unsupported languages, add a prefix to indicate translation
        return `[${targetLanguage}] ${text}`;
      }


    }

    const response = await sarvamClient.post('/translation', {
      text: text,
      source_language: sourceLanguage,
      target_language: targetLanguage,
    });

    if (response.data && response.data.translated_text) {
      console.log(`Translation result: ${response.data.translated_text.substring(0, 100)}...`);
      return response.data.translated_text;
    }

    throw new Error('No translation result returned');
  } catch (error) {
    console.error('Error translating text:', error);
    throw error;
  }
}

/**
 * Convert text to speech in the specified language
 * @param text - The text to convert to speech
 * @param language - The language code
 * @returns The audio blob
 */
export async function textToSpeech(text: string, language: string = 'en'): Promise<Blob> {
  try {
    console.log(`Converting text to speech in ${language}...`);

    // Find the appropriate voice for the language
    const languageInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === language) || SUPPORTED_LANGUAGES[0];

    // Check if we're in development mode and should use mock data
    if (process.env.NODE_ENV === 'development' || !SARVAM_API_KEY) {
      console.log('Using mock text-to-speech in development mode');
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For development, we'll create a simple audio blob with varying sizes
      // to simulate different audio responses

      // Generate a random size for the mock audio data (between 1000 and 5000 bytes)
      // Larger size to make it seem more realistic
      const size = Math.floor(Math.random() * 4000) + 1000;
      const mockAudioData = new Uint8Array(size);

      // Fill with pseudo-random data to simulate different audio responses
      // Use the text content to seed the random data to make responses more consistent
      const textSeed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      for (let i = 0; i < size; i++) {
        mockAudioData[i] = Math.floor((Math.sin(i * 0.1 + textSeed) * 0.5 + 0.5) * 256);
      }

      // Add some metadata to the beginning of the array to make it more unique
      if (size > 10) {
        // Add a "signature" based on the language
        if (language === 'hi') {
          mockAudioData[0] = 72; // 'H'
          mockAudioData[1] = 73; // 'I'
        } else if (language === 'ta') {
          mockAudioData[0] = 84; // 'T'
          mockAudioData[1] = 65; // 'A'
        } else if (language === 'te') {
          mockAudioData[0] = 84; // 'T'
          mockAudioData[1] = 69; // 'E'
        } else {
          mockAudioData[0] = 69; // 'E'
          mockAudioData[1] = 78; // 'N'
        }
      }

      return new Blob([mockAudioData], { type: 'audio/mp3' });
    }

    const response = await sarvamClient.post('/text-to-speech', {
      text: text,
      voice: languageInfo.voice,
    }, {
      responseType: 'arraybuffer',
    });

    // Convert the response to a blob
    const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
    return audioBlob;
  } catch (error) {
    console.error('Error converting text to speech:', error);
    throw error;
  }
}

/**
 * Helper function to convert a Blob to base64
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:audio/wav;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Helper function to convert base64 to Blob
 */
export function base64ToBlob(base64: string, mimeType: string = 'audio/mp3'): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
}
