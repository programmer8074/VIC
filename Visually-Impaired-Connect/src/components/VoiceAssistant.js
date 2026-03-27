import React, { useState } from 'react';
import { Mic, Volume2, X } from 'lucide-react';

const VoiceAssistant = ({ onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTranscript('Listening...');
      setTimeout(() => setTranscript('How can I help you navigate?'), 1000);
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 border-2 border-blue-500">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Voice Assistant</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-4 min-h-[80px]">
          <p className="text-gray-700 text-sm">{transcript || 'Click microphone to start'}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={toggleListening}
            className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
              isListening ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Mic size={20} />
            {isListening ? 'Stop' : 'Speak'}
          </button>
          
          <button
            onClick={() => speak('Welcome to VisionConnect. Your trusted mobility companion.')}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            <Volume2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
