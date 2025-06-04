
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';

interface VoiceInputProps {
  onVoiceInput: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onVoiceInput, 
  disabled = false, 
  placeholder = "Click microphone and speak..." 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const { speak, cancel: cancelSpeech, speaking } = useSpeechSynthesis();
  
  const { listen, stop, listening } = useSpeechRecognition({
    onResult: (result: string) => {
      console.log('Speech recognition result:', result);
      setTranscript(result);
      
      // Auto-stop listening after getting result
      if (result.trim()) {
        handleStopListening();
        onVoiceInput(result);
      }
    },
    onError: (error: any) => {
      console.error('Speech recognition error:', error);
      setIsListening(false);
    },
    onEnd: () => {
      console.log('Speech recognition ended');
      setIsListening(false);
    }
  });

  useEffect(() => {
    setIsListening(listening);
  }, [listening]);

  const handleStartListening = () => {
    if (disabled) return;
    
    console.log('Starting voice input...');
    setTranscript('');
    setIsListening(true);
    
    try {
      listen({
        interimResults: true,
        lang: 'en-US'
      });
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    console.log('Stopping voice input...');
    stop();
    setIsListening(false);
  };

  const handleToggleListening = () => {
    if (isListening) {
      handleStopListening();
    } else {
      handleStartListening();
    }
  };

  // Test speech synthesis
  const testSpeak = () => {
    speak({ text: "Voice input is working!" });
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Voice Input Button */}
      <Button
        type="button"
        variant={isListening ? "destructive" : "outline"}
        size="sm"
        onClick={handleToggleListening}
        disabled={disabled}
        className={`transition-all duration-200 ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'hover:bg-blue-50'
        }`}
        title={isListening ? "Stop listening" : "Start voice input"}
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>

      {/* Test Speech Button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={testSpeak}
        disabled={disabled || speaking}
        className="hover:bg-gray-100"
        title="Test speech synthesis"
      >
        <Volume2 className="h-4 w-4" />
      </Button>

      {/* Voice Input Status */}
      {isListening && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>Listening...</span>
        </div>
      )}

      {/* Transcript Preview */}
      {transcript && !isListening && (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          "{transcript}"
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
