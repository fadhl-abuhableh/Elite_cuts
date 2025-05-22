
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { 
  fetchServices, 
  fetchBarbers, 
  fetchFAQs, 
  fetchPromotions, 
  fetchLocations, 
  fetchWorkingHours,
  DbService,
  DbBarber,
  DbFAQ,
  DbPromotion,
  DbLocation,
  DbWorkingHours
} from '@/lib/supabase';

// Define message interface
export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export function useChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Data from Supabase
  const [services, setServices] = useState<DbService[]>([]);
  const [barbers, setBarbers] = useState<DbBarber[]>([]);
  const [faqs, setFaqs] = useState<DbFAQ[]>([]);
  const [promotions, setPromotions] = useState<DbPromotion[]>([]);
  const [locations, setLocations] = useState<DbLocation[]>([]);
  const [workingHours, setWorkingHours] = useState<DbWorkingHours[]>([]);

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const servicesData = await fetchServices();
        const barbersData = await fetchBarbers();
        const faqsData = await fetchFAQs();
        const promotionsData = await fetchPromotions();
        const locationsData = await fetchLocations();
        const workingHoursData = await fetchWorkingHours();
        
        if (servicesData) setServices(servicesData);
        if (barbersData) setBarbers(barbersData);
        if (faqsData) setFaqs(faqsData);
        if (promotionsData) setPromotions(promotionsData);
        if (locationsData) setLocations(locationsData);
        if (workingHoursData) setWorkingHours(workingHoursData);
        
      } catch (error) {
        console.error("Error loading chatbot data:", error);
        toast({
          title: "Failed to load chatbot data",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Navigate to booking
  const navigateToBooking = useCallback(() => {
    setIsOpen(false);
    navigate('/booking');
  }, [navigate]);

  // Format services for display
  const formatServicesResponse = useCallback(() => {
    if (services.length === 0) return "I'm sorry, we couldn't load our service information right now.";
    
    return `Here are our services:\n\n${services
      .map(service => `• ${service.name}: $${service.price} (${service.duration_minutes} mins) - ${service.description || 'No description available.'}`)
      .join('\n\n')}`;
  }, [services]);

  // Format barbers for display
  const formatBarbersResponse = useCallback(() => {
    if (barbers.length === 0) return "I'm sorry, we couldn't load our barber information right now.";
    
    return `Here are our talented barbers:\n\n${barbers
      .map(barber => `• ${barber.name} - ${barber.bio || 'No bio available.'}`)
      .join('\n\n')}`;
  }, [barbers]);

  // Format location information
  const formatLocationResponse = useCallback(() => {
    if (locations.length === 0) return "I'm sorry, we couldn't load our location information right now.";
    
    const location = locations[0]; // Assuming the first location is the primary one
    return `We're located at:\n\n${location.name}\n${location.address}\n${location.city}\n\nPhone: ${location.phone || 'Not available'}\nEmail: ${location.email || 'Not available'}\n\nFeel free to visit us or book an appointment!`;
  }, [locations]);

  // Format working hours
  const formatHoursResponse = useCallback(() => {
    if (workingHours.length === 0) return "I'm sorry, we couldn't load our hours information right now.";
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const sortedHours = [...workingHours].sort((a, b) => a.day_of_week - b.day_of_week);
    
    return `Our current hours are:\n\n${sortedHours
      .map(hour => {
        if (hour.is_closed) {
          return `• ${dayNames[hour.day_of_week]}: Closed`;
        }
        return `• ${dayNames[hour.day_of_week]}: ${hour.start_time} - ${hour.end_time}`;
      })
      .join('\n')}`;
  }, [workingHours]);

  // Format promotions
  const formatPromotionsResponse = useCallback(() => {
    if (promotions.length === 0) return "I'm sorry, we don't have any active promotions at this time.";
    
    const currentDate = new Date();
    const activePromotions = promotions.filter(promo => 
      !promo.valid_until || new Date(promo.valid_until) > currentDate
    );
    
    if (activePromotions.length === 0) {
      return "I'm sorry, we don't have any active promotions at this time.";
    }
    
    return `Here are our current promotions:\n\n${activePromotions
      .map(promo => {
        const validUntil = promo.valid_until ? `Valid until: ${new Date(promo.valid_until).toLocaleDateString()}` : 'No expiration date';
        return `• ${promo.title}\n  ${promo.details || 'No details available.'}\n  ${validUntil}`;
      })
      .join('\n\n')}`;
  }, [promotions]);

  // Format FAQ response
  const formatFAQResponse = useCallback((query: string) => {
    if (faqs.length === 0) return null;
    
    // Find most relevant FAQ - simple implementation
    const queryWords = query.toLowerCase().split(/\s+/);
    
    let bestMatch = null;
    let highestScore = 0;
    
    for (const faq of faqs) {
      const questionWords = faq.question.toLowerCase().split(/\s+/);
      const answerWords = faq.answer.toLowerCase().split(/\s+/);
      const allWords = [...new Set([...questionWords, ...answerWords])];
      
      let score = 0;
      for (const word of queryWords) {
        if (word.length <= 2) continue; // Skip short words
        if (allWords.includes(word)) score += 1;
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = faq;
      }
    }
    
    // Only return if we have a decent match
    if (highestScore >= 2 && bestMatch) {
      return bestMatch.answer;
    }
    
    return null;
  }, [faqs]);

  // Process user input and generate response
  const processUserInput = useCallback((userInput: string) => {
    const normalizedInput = userInput.toLowerCase().trim();
    
    // Check for booking intent
    const bookingKeywords = ['book', 'appointment', 'schedule', 'reserve'];
    if (bookingKeywords.some(keyword => normalizedInput.includes(keyword))) {
      setMessages(prevMessages => [...prevMessages, {
        id: uuidv4(),
        sender: 'bot',
        text: "Great! I can help you book an appointment. Would you like me to take you to our booking page?",
        timestamp: new Date()
      }]);
      
      // Add a second message with the booking prompt
      setTimeout(() => {
        setMessages(prevMessages => [...prevMessages, {
          id: uuidv4(),
          sender: 'bot',
          text: "Click the 'Book an appointment now' link below to get started, or I can answer any other questions about our services first.",
          timestamp: new Date()
        }]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    // Try to find a matching FAQ first
    const faqAnswer = formatFAQResponse(normalizedInput);
    if (faqAnswer) {
      setMessages(prevMessages => [...prevMessages, {
        id: uuidv4(),
        sender: 'bot',
        text: faqAnswer,
        timestamp: new Date()
      }]);
      setIsTyping(false);
      return;
    }
    
    // Handle different intents
    if (normalizedInput.includes('service') || normalizedInput.includes('price') || normalizedInput.includes('offer')) {
      setMessages(prevMessages => [...prevMessages, {
        id: uuidv4(),
        sender: 'bot',
        text: formatServicesResponse(),
        timestamp: new Date()
      }]);
    } 
    else if (normalizedInput.includes('barber') || normalizedInput.includes('stylist') || normalizedInput.includes('staff')) {
      setMessages(prevMessages => [...prevMessages, {
        id: uuidv4(),
        sender: 'bot',
        text: formatBarbersResponse(),
        timestamp: new Date()
      }]);
    }
    else if (normalizedInput.includes('location') || normalizedInput.includes('address') || normalizedInput.includes('where') || normalizedInput.includes('find')) {
      setMessages(prevMessages => [...prevMessages, {
        id: uuidv4(),
        sender: 'bot',
        text: formatLocationResponse(),
        timestamp: new Date()
      }]);
    }
    else if (normalizedInput.includes('hour') || normalizedInput.includes('time') || normalizedInput.includes('open') || normalizedInput.includes('close')) {
      setMessages(prevMessages => [...prevMessages, {
        id: uuidv4(),
        sender: 'bot',
        text: formatHoursResponse(),
        timestamp: new Date()
      }]);
    }
    else if (normalizedInput.includes('promotion') || normalizedInput.includes('deal') || normalizedInput.includes('discount') || normalizedInput.includes('offer')) {
      setMessages(prevMessages => [...prevMessages, {
        id: uuidv4(),
        sender: 'bot',
        text: formatPromotionsResponse(),
        timestamp: new Date()
      }]);
    }
    else {
      // Fallback response for unrelated questions
      setMessages(prevMessages => [...prevMessages, {
        id: uuidv4(),
        sender: 'bot',
        text: "I'm sorry, but I can only provide information about our barbershop services, barbers, locations, hours, and promotions. Is there anything specific about EliteCuts that I can help you with?",
        timestamp: new Date()
      }]);
    }
    
    setIsTyping(false);
  }, [formatServicesResponse, formatBarbersResponse, formatLocationResponse, formatHoursResponse, formatPromotionsResponse, formatFAQResponse]);

  // Handle sending a message
  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: uuidv4(),
      sender: 'user' as const,
      text: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Simulate bot thinking and respond after a short delay
    setTimeout(() => {
      processUserInput(userMessage.text);
    }, 1000);
  }, [input, processUserInput]);

  return {
    isOpen,
    setIsOpen,
    input,
    setInput,
    messages,
    isTyping,
    handleSend,
    isLoading,
    navigateToBooking
  };
}
