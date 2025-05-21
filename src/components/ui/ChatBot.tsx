
import { useRef, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChatBot } from '@/hooks/useChatBot';
import ChatMessage from '@/components/chatbot/ChatMessage';
import QuickSuggestions from '@/components/chatbot/QuickSuggestions';
import ChatInput from '@/components/chatbot/ChatInput';

interface ChatBotProps {
  className?: string;
}

export function ChatBot({ className }: ChatBotProps) {
  const {
    isOpen,
    setIsOpen,
    input,
    setInput,
    messages,
    isTyping,
    handleSend,
    isLoading
  } = useChatBot();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  if (isLoading && isOpen) {
    return (
      <div className={cn(
        "fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-lg shadow-xl flex flex-col items-center justify-center z-50",
        className
      )}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-barber-navy"></div>
        <p className="mt-4 text-barber-navy">Loading chatbot data...</p>
      </div>
    );
  }

  return (
    <>
      {/* Chat bubble trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-barber-gold text-barber-dark rounded-full p-4 shadow-lg hover:bg-amber-500 transition-all duration-300 z-50"
          aria-label="Open chat assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat interface */}
      {isOpen && (
        <div className={cn(
          "fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden z-50 animate-fade-in",
          className
        )}>
          {/* Chat header */}
          <div className="bg-barber-navy text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <MessageCircle size={20} />
              <h3 className="font-medium">EliteCuts Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length > 0 ? (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  id={message.id}
                  sender={message.sender}
                  text={message.text}
                  timestamp={message.timestamp}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Start a conversation</p>
              </div>
            )}
            {isTyping && (
              <div className="bg-gray-100 text-barber-dark rounded-lg p-3 max-w-[80%] animate-pulse">
                <span>Typing</span>
                <span className="dots">...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <QuickSuggestions onSuggestionClick={handleSuggestionClick} />

          {/* Input area */}
          <ChatInput 
            value={input}
            onChange={setInput}
            onSend={handleSend}
          />
          
          {/* Book now shortcut */}
          <div className="bg-barber-navy/10 py-2 px-4 text-center">
            <Button asChild variant="link" className="text-barber-navy font-medium">
              <Link to="/booking">Book an appointment now</Link>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBot;
