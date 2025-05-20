
import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  findService, 
  findBarberAvailability, 
  findFAQ, 
  findPromotion, 
  services, 
  barbers 
} from '@/utils/chatbotData';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface ChatBotProps {
  className?: string;
}

export function ChatBot({ className }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Welcome to EliteCuts! I can help you with service information, check barber availability, or assist with appointment booking. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() === '') return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate thinking/processing time
    setTimeout(() => {
      const botResponse = processUserInput(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponse,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const processUserInput = (text: string): string => {
    const lowercaseText = text.toLowerCase();
    
    // Check for greetings
    if (/^(hi|hello|hey|greetings)[\s!.]*$/i.test(lowercaseText)) {
      return "Hello! How can I help you today? I can provide information about our services, check barber availability, or help you book an appointment.";
    }
    
    // Check for service information
    if (lowercaseText.includes('service') || lowercaseText.includes('haircut') || lowercaseText.includes('price')) {
      const service = findService(text);
      
      if (service) {
        return `${service.name} costs $${service.price} and takes approximately ${service.duration} minutes. ${service.description} Would you like to book this service?`;
      } else if (lowercaseText.includes('service')) {
        return `We offer a variety of services including haircuts, beard trims, shaves, hair coloring, and more. You can view all our services on our Services page. Would you like me to tell you more about a specific service?`;
      }
    }
    
    // Check for barber availability
    if (lowercaseText.includes('available') || lowercaseText.includes('book')) {
      const matches = text.match(/(\w+)\s+(?:on|for|this|next)?\s*(\w+day|tomorrow|today)/i);
      
      if (matches) {
        const barberName = matches[1];
        const day = matches[2];
        
        // Create a date object for the requested day
        let date = new Date();
        if (day.toLowerCase() === 'tomorrow') {
          date.setDate(date.getDate() + 1);
        } else if (day.toLowerCase() !== 'today') {
          // Handle specific days of the week
          const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const today = date.getDay();
          const targetDay = days.findIndex(d => d.toLowerCase() === day.toLowerCase());
          
          if (targetDay !== -1) {
            let daysToAdd = targetDay - today;
            if (daysToAdd <= 0) daysToAdd += 7; // If the day has passed this week, look at next week
            date.setDate(date.getDate() + daysToAdd);
          }
        }
        
        const availability = findBarberAvailability(barberName, date.toISOString());
        
        if (availability) {
          const availableSlots = availability.filter(slot => slot.available);
          
          if (availableSlots.length > 0) {
            const slotsList = availableSlots.slice(0, 3).map(slot => slot.time).join(', ');
            return `Yes, there are ${availableSlots.length} available slots for ${barberName} on ${date.toLocaleDateString()}. Some available times include: ${slotsList}. Would you like to book an appointment?`;
          } else {
            return `I'm sorry, it looks like ${barberName} is fully booked on ${date.toLocaleDateString()}. Would you like to check another date or a different barber?`;
          }
        } else {
          return `I couldn't find availability information for that request. Please try another barber or date, or visit our booking page to see the full schedule.`;
        }
      } else {
        return `To check availability, please specify a barber name and day. For example, "Is James available tomorrow?" or "When is Michael free on Friday?"`;
      }
    }
    
    // Check for FAQ information
    const faq = findFAQ(text);
    if (faq) {
      return faq.answer;
    }
    
    // Check for promotion information
    if (lowercaseText.includes('discount') || lowercaseText.includes('offer') || lowercaseText.includes('promo') || lowercaseText.includes('deal')) {
      const promotion = findPromotion(text);
      
      if (promotion) {
        let response = `${promotion.title}: ${promotion.description}`;
        if (promotion.expiryDate) {
          response += ` Valid until ${promotion.expiryDate}.`;
        }
        return response;
      } else {
        return `We have several ongoing promotions, including 20% off for first-time clients with code WELCOME20, and our loyalty program where every 10th haircut is free. Would you like to know more about any of these?`;
      }
    }
    
    // Check for booking request
    if (lowercaseText.includes('appointment') || lowercaseText.includes('book') || lowercaseText.includes('schedule')) {
      return `You can book an appointment through our booking page, or I can help you get started. What service would you like to book, and do you have a preferred barber and time?`;
    }
    
    // Default response for unrecognized inputs
    return "I'm not sure I understand. I can help with service information, barber availability, booking appointments, or answering frequently asked questions. How can I assist you?";
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      {/* Chat bubble trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-barber-gold text-barber-dark rounded-full p-4 shadow-lg hover:bg-amber-500 transition-all duration-300 z-50"
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
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={cn(
                  "mb-4 max-w-[80%] rounded-lg p-3",
                  message.sender === 'user' 
                    ? "bg-barber-navy text-white ml-auto" 
                    : "bg-gray-100 text-barber-dark"
                )}
              >
                {message.text}
                <div className={cn(
                  "text-xs mt-1",
                  message.sender === 'user' ? "text-white/70" : "text-gray-500"
                )}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="bg-gray-100 text-barber-dark rounded-lg p-3 max-w-[80%] animate-pulse">
                <span>Typing</span>
                <span className="dots">...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            <button 
              onClick={() => setInput("What services do you offer?")}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-barber-navy py-1 px-2 rounded-full transition-colors"
            >
              Services?
            </button>
            <button 
              onClick={() => setInput("When is James available tomorrow?")}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-barber-navy py-1 px-2 rounded-full transition-colors"
            >
              Check availability
            </button>
            <button 
              onClick={() => setInput("How do I book an appointment?")}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-barber-navy py-1 px-2 rounded-full transition-colors"
            >
              Book appointment
            </button>
          </div>

          {/* Input area */}
          <div className="border-t p-3 flex items-center">
            <Input
              type="text"
              placeholder="Type your message..."
              className="flex-1 mr-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button 
              onClick={handleSend} 
              size="icon" 
              className="bg-barber-gold hover:bg-amber-500 text-barber-dark"
            >
              <Send size={18} />
            </Button>
          </div>
          
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
