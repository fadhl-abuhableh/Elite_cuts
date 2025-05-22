
import { useRef, useEffect } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';
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
    setMessages,
    isTyping,
    handleSend,
    isLoading,
    navigateToBooking
  } = useChatBot();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Send welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0 && !isLoading) {
      const welcomeMessage = {
        id: '0',
        sender: 'bot' as const,
        text: "👋 Hello! Welcome to EliteCuts. How can I help you today? I can provide information about our services, barbers, location, hours, or promotions.",
        timestamp: new Date()
      };
      
      setTimeout(() => {
        setInput('');
        setMessages([welcomeMessage]);
      }, 500);
    }
  }, [isOpen, messages.length, isLoading, setInput, setMessages]);

  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
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
          className="fixed bottom-6 right-6 bg-barber-gold text-barber-dark rounded-full p-4 shadow-lg hover:bg-amber-500 transition-all duration-300 z-50 group"
          aria-label="Open chat assistant"
        >
          <MessageCircle size={24} />
          <span className="absolute -top-10 right-0 bg-barber-navy text-white text-sm py-1 px-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Chat with us
          </span>
        </button>
      )}

      {/* Chat interface */}
      {isOpen && (
        <div className={cn(
          "fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden z-50 animate-fade-in",
          className
        )}>
          {/* Chat header */}
          <div className="bg-barber-navy text-white p-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <MessageCircle size={20} />
              <h3 className="font-medium">EliteCuts Assistant</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-barber-navy/50"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 bg-opacity-50">
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
              <div className="flex items-center justify-center h-full flex-col space-y-2 text-gray-500">
                <MessageCircle size={40} className="text-barber-navy opacity-50" />
                <p className="text-sm">Start a conversation</p>
                <p className="text-xs text-center max-w-[80%]">
                  Ask about our services, barbers, location, hours, or promotions
                </p>
              </div>
            )}
            
            {isTyping && (
              <div className="flex space-x-1 p-3 max-w-[60%] rounded-lg">
                <span className="w-2 h-2 bg-barber-navy rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-barber-navy rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-barber-navy rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
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
          <div className="bg-barber-navy/5 py-2 px-4 text-center border-t border-gray-200">
            <Button asChild variant="default" size="sm" className="text-white font-medium bg-barber-gold hover:bg-barber-gold/90">
              <Link to="/booking">Book an appointment now</Link>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBot;
