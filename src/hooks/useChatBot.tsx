
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  DbService, 
  DbBarber, 
  DbFAQ, 
  DbPromotion,
  fetchServices,
  fetchBarbers,
  fetchFAQs,
  fetchPromotions,
  checkBarberAvailability
} from '@/lib/supabase';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export function useChatBot() {
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
  const [services, setServices] = useState<DbService[] | null>(null);
  const [barbers, setBarbers] = useState<DbBarber[] | null>(null);
  const [faqs, setFaqs] = useState<DbFAQ[] | null>(null);
  const [promotions, setPromotions] = useState<DbPromotion[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from Supabase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch all needed data in parallel
        const [servicesData, barbersData, faqsData, promotionsData] = await Promise.all([
          fetchServices(),
          fetchBarbers(),
          fetchFAQs(),
          fetchPromotions()
        ]);
        
        setServices(servicesData);
        setBarbers(barbersData);
        setFaqs(faqsData);
        setPromotions(promotionsData);
      } catch (error) {
        console.error('Error loading chatbot data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
      processUserInput(input).then(botResponse => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: botResponse,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      });
    }, 1000);
  };

  const processUserInput = async (text: string): Promise<string> => {
    const lowercaseText = text.toLowerCase();
    
    // Check for greetings
    if (/^(hi|hello|hey|greetings)[\s!.]*$/i.test(lowercaseText)) {
      return "Hello! How can I help you today? I can provide information about our services, check barber availability, or help you book an appointment.";
    }
    
    // Check for service information
    if (lowercaseText.includes('service') || lowercaseText.includes('haircut') || lowercaseText.includes('price')) {
      if (services) {
        const service = findServiceFromSupabase(text, services);
        
        if (service) {
          return `${service.name} costs $${service.price} and takes approximately ${service.duration_minutes} minutes. Would you like to book this service?`;
        } else if (lowercaseText.includes('service')) {
          const serviceNames = services.map(s => s.name).join(', ');
          return `We offer a variety of services including ${serviceNames}. You can view all our services on our Services page. Would you like me to tell you more about a specific service?`;
        }
      }
    }
    
    // Check for barber availability
    if (lowercaseText.includes('available') || lowercaseText.includes('book')) {
      const matches = text.match(/(\w+)\s+(?:on|for|this|next)?\s*(\w+day|tomorrow|today)/i);
      
      if (matches && barbers) {
        const barberName = matches[1];
        const day = matches[2];
        
        // Find the barber in our Supabase data
        const barber = barbers.find(b => 
          b.name.toLowerCase().includes(barberName.toLowerCase())
        );
        
        if (!barber) {
          return `I couldn't find a barber named ${barberName}. Our available barbers are: ${barbers.map(b => b.name).join(', ')}. Would you like to check availability for one of them?`;
        }
        
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
        
        try {
          const availability = await checkBarberAvailability(barber.id, date.toISOString().split('T')[0]);
          
          if (availability) {
            const availableSlots = availability.filter(slot => slot.available);
            
            if (availableSlots.length > 0) {
              const slotsList = availableSlots.slice(0, 3).map(slot => slot.time).join(', ');
              return `Yes, there are ${availableSlots.length} available slots for ${barber.name} on ${date.toLocaleDateString()}. Some available times include: ${slotsList}. Would you like to book an appointment?`;
            } else {
              return `I'm sorry, it looks like ${barber.name} is fully booked on ${date.toLocaleDateString()}. Would you like to check another date or a different barber?`;
            }
          }
        } catch (error) {
          console.error("Error checking barber availability:", error);
        }
        
        return `I'm having trouble checking availability right now. Please try again later or contact us directly.`;
      } else {
        return `To check availability, please specify a barber name and day. For example, "Is James available tomorrow?" or "When is Michael free on Friday?"`;
      }
    }
    
    // Check for FAQ information
    if (faqs) {
      const faq = findFAQFromSupabase(text, faqs);
      if (faq) {
        return faq.answer;
      }
    }
    
    // Check for promotion information
    if (lowercaseText.includes('discount') || lowercaseText.includes('offer') || lowercaseText.includes('promo') || lowercaseText.includes('deal')) {
      if (promotions) {
        const promotion = findPromotionFromSupabase(text, promotions);
        
        if (promotion) {
          let response = `${promotion.title}: ${promotion.details}`;
          if (promotion.valid_until) {
            response += ` Valid until ${new Date(promotion.valid_until).toLocaleDateString()}.`;
          }
          return response;
        } else if (promotions.length > 0) {
          const promoList = promotions.map(p => p.title).join(', ');
          return `We have several ongoing promotions, including ${promoList}. Would you like to know more about any of these?`;
        }
      }
      
      return `We have several ongoing promotions. Please check our website for the latest deals or ask me about a specific promotion.`;
    }
    
    // Check for booking request
    if (lowercaseText.includes('appointment') || lowercaseText.includes('book') || lowercaseText.includes('schedule')) {
      return `You can book an appointment through our booking page, or I can help you get started. What service would you like to book, and do you have a preferred barber and time?`;
    }
    
    // Default response for unrecognized inputs
    return "I'm not sure I understand. I can help with service information, barber availability, booking appointments, or answering frequently asked questions. How can I assist you?";
  };

  const findServiceFromSupabase = (query: string, services: DbService[]): DbService | null => {
    const normalizedQuery = query.toLowerCase();
    
    for (const service of services) {
      if (
        service.name.toLowerCase().includes(normalizedQuery) ||
        (service.description && service.description.toLowerCase().includes(normalizedQuery))
      ) {
        return service;
      }
    }
    
    return null;
  };

  const findFAQFromSupabase = (query: string, faqs: DbFAQ[]): DbFAQ | null => {
    const normalizedQuery = query.toLowerCase();
    
    for (const faq of faqs) {
      if (
        faq.question.toLowerCase().includes(normalizedQuery) ||
        faq.answer.toLowerCase().includes(normalizedQuery)
      ) {
        return faq;
      }
    }
    
    return null;
  };

  const findPromotionFromSupabase = (query: string, promotions: DbPromotion[]): DbPromotion | null => {
    const normalizedQuery = query.toLowerCase();
    
    for (const promotion of promotions) {
      if (
        promotion.title.toLowerCase().includes(normalizedQuery) ||
        promotion.details.toLowerCase().includes(normalizedQuery)
      ) {
        return promotion;
      }
    }
    
    return null;
  };

  return {
    isOpen,
    setIsOpen,
    input,
    setInput,
    messages,
    isTyping,
    handleSend,
    isLoading,
    barbers,
    services
  };
}

export default useChatBot;
