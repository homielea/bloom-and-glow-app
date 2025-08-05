import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionType;
    webkitSpeechRecognition: new () => SpeechRecognitionType;
  }
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionType extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognitionType, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognitionType, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognitionType, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognitionType, ev: Event) => any) | null;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onComplete?: (finalText: string) => void;
  className?: string;
  placeholder?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  onComplete,
  className = '',
  placeholder = 'Tap to speak...'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionType | null>(null);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionConstructor) {
      setIsSupported(true);
      const recognitionInstance = new SpeechRecognitionConstructor();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
      };

      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript + interimTranscript;
        setTranscript(fullTranscript);
        onTranscript(fullTranscript);

        if (finalTranscript && onComplete) {
          onComplete(finalTranscript);
        }
      };

      recognitionInstance.onerror = (event) => {
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please enable microphone permissions.');
        } else if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else {
          toast.error('Speech recognition error. Please try again.');
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (!recognition || isListening) return;

    try {
      setTranscript('');
      recognition.start();
      toast.success('Listening... Speak now');
    } catch (error) {
      toast.error('Failed to start voice recognition');
    }
  };

  const stopListening = () => {
    if (!recognition || !isListening) return;

    recognition.stop();
    toast.success('Voice input completed');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <Badge variant="secondary" className="mb-2">
          Voice input not supported in this browser
        </Badge>
        <p className="text-sm text-gray-600">
          Try using Chrome, Safari, or Edge for voice input functionality
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-center">
        <Button
          onClick={toggleListening}
          variant={isListening ? "destructive" : "default"}
          size="lg"
          className={`rounded-full w-16 h-16 ${
            isListening ? 'animate-pulse bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isListening ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </Button>
      </div>

      <div className="text-center">
        {isListening ? (
          <div className="space-y-2">
            <Badge variant="default" className="bg-green-100 text-green-800">
              <Volume2 className="w-3 h-3 mr-1" />
              Listening...
            </Badge>
            <p className="text-sm text-gray-600">Speak clearly into your microphone</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Badge variant="secondary">Tap to speak</Badge>
            <p className="text-sm text-gray-600">{placeholder}</p>
          </div>
        )}
      </div>

      {transcript && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-1">Transcript:</p>
          <p className="text-sm text-gray-900">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
