
import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types/merchant';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  message: ChatMessageType;
  onOptionSelect?: (option: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onOptionSelect }) => {
  return (
    <div
      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} mb-4 animate-in fade-in duration-500`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
          message.isBot
            ? 'bg-white border border-gray-200 text-gray-800 shadow-sm'
            : 'bg-blue-600 text-white shadow-md'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
        
        {message.options && message.options.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full text-left justify-start hover:bg-blue-50 transition-colors"
                onClick={() => onOptionSelect?.(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        )}
        
        <span className="text-xs opacity-70 mt-2 block">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
