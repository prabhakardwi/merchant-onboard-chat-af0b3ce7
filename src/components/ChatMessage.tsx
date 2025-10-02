
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
            ? message.isAIResponse
              ? 'bg-secondary/50 border border-primary/30 text-foreground shadow-sm'
              : 'bg-card border border-border text-foreground shadow-sm'
            : 'bg-primary text-primary-foreground shadow-md'
        }`}
      >
        {message.image && (
          <div className="mb-3">
            <img 
              src={message.image} 
              alt="Congratulations" 
              className="w-full h-32 object-cover rounded-lg shadow-sm"
            />
          </div>
        )}
        
        {message.text && (
          <div className="text-sm leading-relaxed whitespace-pre-line font-medium">
            {message.isAIResponse && (
              <div className="flex items-center gap-2 mb-2 text-primary font-semibold">
                <span>🤖</span>
                <span className="text-xs">AI Assistant</span>
              </div>
            )}
            <p>{message.text}</p>
          </div>
        )}
        
        {message.options && message.options.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className={`w-full text-left justify-start transition-colors ${
                  message.isAIResponse 
                    ? 'hover:bg-primary/10 border-primary/30' 
                    : 'hover:bg-primary/10'
                }`}
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
