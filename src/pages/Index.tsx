import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Copy, Trash2, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.success('Listening started');
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
      toast.info('Listening stopped');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        } else {
          interimText += transcriptPart;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript + ' ');
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast.error(`Recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    toast.success('Transcript cleared');
  };

  const copyToClipboard = () => {
    const textToCopy = transcript + interimTranscript;
    if (textToCopy.trim()) {
      navigator.clipboard.writeText(textToCopy);
      toast.success('Copied to clipboard');
    } else {
      toast.error('No text to copy');
    }
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Not Supported</h1>
          <p className="text-gray-600">
            Speech recognition is not supported in your browser. Please try using Chrome, Edge, or Safari.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Speech to Text
          </h1>
          <p className="text-gray-600 text-lg">
            Click Start to begin recording or End to stop recording
          </p>
        </div>

        {/* Main Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={startListening}
            disabled={isListening}
            size="lg"
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 transition-all duration-300 shadow-lg flex items-center gap-2 px-6 py-3"
          >
            <Play className="w-5 h-5" />
            Start
          </Button>
          
          <Button
            onClick={stopListening}
            disabled={!isListening}
            size="lg"
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 transition-all duration-300 shadow-lg flex items-center gap-2 px-6 py-3"
          >
            <Square className="w-5 h-5" />
            End
          </Button>
        </div>

        {/* Status */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            isListening
              ? 'bg-red-100 text-red-700 border border-red-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            {isListening ? 'Recording...' : 'Ready to record'}
          </div>
        </div>

        {/* Transcript Display */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Transcript</h2>
              <div className="flex gap-2">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
                <Button
                  onClick={clearTranscript}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="min-h-[200px] max-h-[400px] overflow-y-auto bg-gray-50 rounded-lg p-4">
              {transcript || interimTranscript ? (
                <div className="text-gray-800 leading-relaxed">
                  <span>{transcript}</span>
                  <span className="text-gray-500 italic">{interimTranscript}</span>
                  {isListening && <span className="inline-block w-1 h-5 bg-blue-500 animate-pulse ml-1"></span>}
                </div>
              ) : (
                <div className="text-gray-400 text-center flex items-center justify-center h-full">
                  <div>
                    <Mic className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Your transcribed text will appear here...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <Card className="backdrop-blur-sm bg-white/60 border-0">
            <div className="p-6">
              <h3 className="font-semibold mb-3 text-gray-800">How to use:</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">1</span>
                  </div>
                  <span>Click the Start button</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">2</span>
                  </div>
                  <span>Allow microphone access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">3</span>
                  </div>
                  <span>Click End when finished</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
