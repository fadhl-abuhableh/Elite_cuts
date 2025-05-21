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
  checkBarberAvailability,
  createAppointment
} from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface BookingState {
  active: boolean;
  step: 'service' | 'barber' | 'date' | 'time' | 'name' | 'email' | 'phone' | 'confirmation' | 'complete';
  data: {
    service?: string;
    barber?: string;
    date?: string;
    time?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
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
  const [dataInitialized, setDataInitialized] = useState(false);
  const [bookingState, setBookingState] = useState<BookingState>({
    active: false,
    step: 'service',
    data: {}
  });
  
  const navigate = useNavigate();

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
        
        if (servicesData) setServices(servicesData);
        if (barbersData) setBarbers(barbersData);
        if (faqsData) setFaqs(faqsData);
        if (promotionsData) setPromotions(promotionsData);
        
        setDataInitialized(true);
        
        if (import.meta.env.DEV) {
          console.log('Chatbot data loaded:', {
            services: !!servicesData && servicesData.length,
            barbers: !!barbersData && barbersData.length,
            faqs: !!faqsData && faqsData.length,
            promotions: !!promotionsData && promotionsData.length
          });
        }
      } catch (error) {
        console.error('Error loading chatbot data:', error);
        toast.error('Error loading chat assistant data. Some features may be limited.');
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
    }, 800);
  };

  const handleBookingFlow = (text: string): string => {
    // If booking flow is not active, return empty to let regular processing happen
    if (!bookingState.active) return '';
    
    const currentStep = bookingState.step;
    let response = '';
    
    // Process the current booking step
    switch (currentStep) {
      case 'service':
        if (!services) return "I'm having trouble accessing our service information. Please try again later.";
        
        const serviceMatch = findServiceByName(text, services);
        if (serviceMatch) {
          setBookingState({
            ...bookingState,
            step: 'barber',
            data: { ...bookingState.data, service: serviceMatch.id }
          });
          
          response = `Great! You've selected ${serviceMatch.name}. Which barber would you prefer for your appointment?`;
          if (barbers && barbers.length > 0) {
            response += ` Available barbers: ${barbers.map(b => b.name).join(', ')}.`;
          }
        } else {
          response = "I don't recognize that service. Please choose from one of our available services:";
          if (services && services.length > 0) {
            response += ` ${services.map(s => s.name).join(', ')}.`;
          }
        }
        break;
        
      case 'barber':
        if (!barbers) return "I'm having trouble accessing our barber information. Please try again later.";
        
        const barberMatch = findBarberByName(text, barbers);
        if (barberMatch) {
          setBookingState({
            ...bookingState,
            step: 'date',
            data: { ...bookingState.data, barber: barberMatch.id }
          });
          
          response = `Great! You've selected ${barberMatch.name}. What date would you like to book? (e.g., tomorrow, next Friday, May 25)`;
        } else {
          response = "I don't recognize that barber. Please choose from one of our available barbers:";
          if (barbers && barbers.length > 0) {
            response += ` ${barbers.map(b => b.name).join(', ')}.`;
          }
        }
        break;
        
      case 'date':
        const dateMatch = extractDateReference(text);
        if (dateMatch) {
          setBookingState({
            ...bookingState,
            step: 'time',
            data: { ...bookingState.data, date: dateMatch.toISOString().split('T')[0] }
          });
          
          response = `Got it! You've selected ${dateMatch.toLocaleDateString()}. What time would you prefer? (e.g., morning, afternoon, 2 PM)`;
        } else {
          response = "I couldn't understand that date. Please specify a date for your appointment (e.g., tomorrow, next Friday, May 25).";
        }
        break;
        
      case 'time':
        const timeMatch = extractTimeReference(text);
        if (timeMatch) {
          setBookingState({
            ...bookingState,
            step: 'name',
            data: { ...bookingState.data, time: timeMatch }
          });
          
          response = `Great! What's your full name for the appointment?`;
        } else {
          response = "I couldn't understand that time. Please specify a time for your appointment (e.g., morning, afternoon, 2 PM).";
        }
        break;
        
      case 'name':
        if (text.trim().length >= 2) {
          setBookingState({
            ...bookingState,
            step: 'email',
            data: { ...bookingState.data, name: text.trim() }
          });
          
          response = `Thanks ${text.trim()}! What's your email address?`;
        } else {
          response = "Please provide your full name for the appointment.";
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(text.trim())) {
          setBookingState({
            ...bookingState,
            step: 'phone',
            data: { ...bookingState.data, email: text.trim() }
          });
          
          response = `Great! What's your phone number?`;
        } else {
          response = "That doesn't appear to be a valid email address. Please provide a valid email.";
        }
        break;
        
      case 'phone':
        const phoneRegex = /^[0-9()\-\s+]{7,15}$/;
        if (phoneRegex.test(text.trim().replace(/\s/g, ''))) {
          setBookingState({
            ...bookingState,
            step: 'confirmation',
            data: { ...bookingState.data, phone: text.trim() }
          });
          
          // Get names for display instead of IDs
          const selectedService = services?.find(s => s.id === bookingState.data.service);
          const selectedBarber = barbers?.find(b => b.id === bookingState.data.barber);
          
          response = `Perfect! Here's a summary of your appointment:
          
Service: ${selectedService?.name || 'Unknown service'}
Barber: ${selectedBarber?.name || 'Unknown barber'}
Date: ${new Date(bookingState.data.date || '').toLocaleDateString()}
Time: ${bookingState.data.time}
Name: ${bookingState.data.name}
Email: ${bookingState.data.email}

Is this information correct? Please respond with "yes" to confirm or "no" to restart.`;
        } else {
          response = "That doesn't appear to be a valid phone number. Please provide a valid phone number.";
        }
        break;
        
      case 'confirmation':
        if (text.toLowerCase().includes('yes') || text.toLowerCase().includes('confirm')) {
          // Handle booking confirmation
          const selectedService = services?.find(s => s.id === bookingState.data.service);
          const selectedBarber = barbers?.find(b => b.id === bookingState.data.barber);
          
          setBookingState({
            ...bookingState,
            step: 'complete',
            active: false
          });
          
          // Fixing the toast implementation here
          setTimeout(() => {
            toast("Appointment Booked!", {
              description: `Your appointment with ${selectedBarber?.name} for ${selectedService?.name} has been scheduled.`,
            });
          }, 1000);
          
          response = `Thank you! Your appointment has been successfully booked. You'll receive a confirmation email at ${bookingState.data.email}. We look forward to seeing you on ${new Date(bookingState.data.date || '').toLocaleDateString()} at ${bookingState.data.time}!`;
          
          // Reset booking state after completion
          setTimeout(() => {
            setBookingState({
              active: false,
              step: 'service',
              data: {}
            });
          }, 1000);
        } else if (text.toLowerCase().includes('no')) {
          setBookingState({
            active: true,
            step: 'service',
            data: {}
          });
          
          response = "Let's restart your booking. Which service would you like to book?";
        } else {
          response = "Please respond with 'yes' to confirm your appointment or 'no' to restart the booking process.";
        }
        break;
        
      default:
        response = "I'm not sure how to proceed with your booking. Let's try again. Which service would you like to book?";
        setBookingState({
          active: true,
          step: 'service',
          data: {}
        });
    }
    
    return response;
  };

  const processUserInput = async (text: string): Promise<string> => {
    if (!dataInitialized) {
      return "I'm still loading data. Please try again in a moment.";
    }
    
    // Check if we're in active booking flow
    const bookingResponse = handleBookingFlow(text);
    if (bookingResponse) return bookingResponse;
    
    const lowercaseText = text.toLowerCase();
    
    // Check for booking or appointment requests
    if (lowercaseText.includes('book') || 
        lowercaseText.includes('appoint') || 
        lowercaseText.includes('schedule') || 
        lowercaseText.includes('reserve') ||
        (lowercaseText.includes('haircut') && (lowercaseText.includes('want') || lowercaseText.includes('like'))) ||
        text.toLowerCase() === 'yes') {
      
      // Activate booking flow
      setBookingState({
        active: true,
        step: 'service',
        data: {}
      });
      
      return "Great! I'd be happy to help you book an appointment. Which service would you like to book?";
    }
    
    // Check for greetings
    if (/^(hi|hello|hey|greetings)[\s!.]*$/i.test(lowercaseText)) {
      return "Hello! How can I help you today? I can provide information about our services, check barber availability, or help you book an appointment.";
    }
    
    // Check for service information
    if (lowercaseText.includes('service') || 
        lowercaseText.includes('haircut') || 
        lowercaseText.includes('price') || 
        lowercaseText.includes('cost') ||
        lowercaseText.includes('trim') ||
        lowercaseText.includes('shave')) {
      
      if (services && services.length > 0) {
        // Try to find a specific service match
        const service = findServiceFromSupabase(text, services);
        
        if (service) {
          return `${service.name} costs $${service.price} and takes approximately ${service.duration_minutes} minutes. ${service.description || ''}. Would you like to book this service?`;
        } else if (lowercaseText.includes('service') || lowercaseText.includes('offer')) {
          const serviceNames = services.map(s => s.name).join(', ');
          return `We offer a variety of services including ${serviceNames}. Our prices range from $${Math.min(...services.map(s => s.price))} to $${Math.max(...services.map(s => s.price))}. You can view all our services on our Services page. Would you like me to tell you more about a specific service?`;
        }
      } else {
        return "I'm having trouble accessing our service information. Please check our Services page for details, or contact us directly.";
      }
    }
    
    // Check for barber information
    if (lowercaseText.includes('barber') || 
        lowercaseText.includes('stylist') || 
        lowercaseText.includes('who') && (lowercaseText.includes('cut') || lowercaseText.includes('work'))) {
      
      if (barbers && barbers.length > 0) {
        // Check if asking about a specific barber
        const barberName = extractBarberName(text, barbers);
        
        if (barberName) {
          const barber = barbers.find(b => 
            b.name.toLowerCase().includes(barberName.toLowerCase())
          );
          
          if (barber) {
            return `${barber.name} is one of our skilled barbers. ${barber.bio || ''}`;
          }
        }
        
        // General barber information
        return `We have ${barbers.length} talented barbers on our team: ${barbers.map(b => b.name).join(', ')}. Would you like to know more about any of them?`;
      }
    }
    
    // Check for barber availability
    if (lowercaseText.includes('available') || lowercaseText.includes('free')) {
      
      // Look for patterns like "Is [name] available on [day]?" or "Book with [name]"
      const barberMatch = extractBarberName(text, barbers || []);
      const dateMatch = extractDateReference(text);
      
      if (barberMatch && dateMatch && barbers) {
        const barber = barbers.find(b => 
          b.name.toLowerCase().includes(barberMatch.toLowerCase())
        );
        
        if (!barber) {
          return `I couldn't find a barber named ${barberMatch}. Our available barbers are: ${barbers.map(b => b.name).join(', ')}. Would you like to check availability for one of them?`;
        }
        
        try {
          const availability = await checkBarberAvailability(barber.id, dateMatch.toISOString().split('T')[0]);
          
          if (availability) {
            const availableSlots = availability.filter(slot => slot.available);
            
            if (availableSlots.length > 0) {
              const slotsList = availableSlots.slice(0, 3).map(slot => slot.time).join(', ');
              return `Yes, ${barber.name} has ${availableSlots.length} available slots on ${dateMatch.toLocaleDateString()}. Some available times include: ${slotsList}. Would you like to book an appointment?`;
            } else {
              return `I'm sorry, it looks like ${barber.name} is fully booked on ${dateMatch.toLocaleDateString()}. Would you like to check another date or a different barber?`;
            }
          }
        } catch (error) {
          console.error("Error checking barber availability:", error);
        }
        
        return `I'm having trouble checking availability right now. Please try again later or contact us directly at (123) 456-7890.`;
      }
    }
    
    // Check for FAQ information
    if (faqs && faqs.length > 0) {
      const faq = findFAQFromSupabase(text, faqs);
      if (faq) {
        return faq.answer;
      }
    }
    
    // Check for promotion information
    if (lowercaseText.includes('discount') || 
        lowercaseText.includes('offer') || 
        lowercaseText.includes('promo') || 
        lowercaseText.includes('deal') || 
        lowercaseText.includes('special')) {
      
      if (promotions && promotions.length > 0) {
        const promotion = findPromotionFromSupabase(text, promotions);
        
        if (promotion) {
          let response = `${promotion.title}: ${promotion.details}`;
          if (promotion.valid_until) {
            response += ` Valid until ${new Date(promotion.valid_until).toLocaleDateString()}.`;
          }
          return response;
        } else {
          const promoList = promotions.map(p => p.title).join(', ');
          return `We have several ongoing promotions, including ${promoList}. Would you like to know more about any of these?`;
        }
      }
      
      return `We have several promotions throughout the year. Please check our website for the latest deals or ask me about a specific promotion.`;
    }
    
    // Check for location or hours information
    if (lowercaseText.includes('where') || 
        lowercaseText.includes('location') || 
        lowercaseText.includes('address') ||
        lowercaseText.includes('situated')) {
      return "We're located at 123 Barber Street, New York, NY 10001. You can find directions on our website or contact us at (123) 456-7890 for more information.";
    }
    
    if (lowercaseText.includes('hour') || 
        lowercaseText.includes('open') || 
        lowercaseText.includes('close') || 
        (lowercaseText.includes('when') && lowercaseText.includes('open'))) {
      return "Our hours are:\nMonday-Friday: 9:00 AM - 7:00 PM\nSaturday: 10:00 AM - 6:00 PM\nSunday: 10:00 AM - 4:00 PM";
    }
    
    // Check for parking
    if (lowercaseText.includes('parking') || lowercaseText.includes('park')) {
      return "Yes, we offer free parking in front of our shop and there's additional street parking nearby.";
    }
    
    // Check for gift cards
    if (lowercaseText.includes('gift') || lowercaseText.includes('card') || lowercaseText.includes('present')) {
      return "Yes, we offer gift cards in various denominations which can be purchased in-store or online through our website.";
    }
    
    // Check for cancellation policy
    if (lowercaseText.includes('cancel') || lowercaseText.includes('reschedule')) {
      return "We request at least 24 hours notice for cancellations or rescheduling. Late cancellations or no-shows may be subject to a fee for the reserved time.";
    }
    
    // Default response for unrecognized inputs
    return "I'm not sure I understand. I can help with service information, barber availability, booking appointments, or answering frequently asked questions. How can I assist you?";
  };
  
  // Helper function to extract barber name from text
  const extractBarberName = (text: string, barbers: DbBarber[]): string | null => {
    const lowercaseText = text.toLowerCase();
    
    // Check for direct mentions of barber names
    for (const barber of barbers) {
      const barberFirstName = barber.name.split(' ')[0].toLowerCase();
      const barberFullName = barber.name.toLowerCase();
      
      if (lowercaseText.includes(barberFullName) || lowercaseText.includes(barberFirstName)) {
        return barber.name;
      }
    }
    
    // Try to match patterns like "book with [name]" or "is [name] available"
    const bookWithMatch = text.match(/(?:book|appointment|schedule)\s+(?:with|for)\s+(\w+)/i);
    if (bookWithMatch && bookWithMatch[1]) {
      const potentialName = bookWithMatch[1];
      // Check if this partial name matches any barber
      for (const barber of barbers) {
        if (barber.name.toLowerCase().includes(potentialName.toLowerCase())) {
          return barber.name;
        }
      }
    }
    
    const isAvailableMatch = text.match(/is\s+(\w+)\s+available/i);
    if (isAvailableMatch && isAvailableMatch[1]) {
      const potentialName = isAvailableMatch[1];
      // Check if this partial name matches any barber
      for (const barber of barbers) {
        if (barber.name.toLowerCase().includes(potentialName.toLowerCase())) {
          return barber.name;
        }
      }
    }
    
    return null;
  };
  
  // Helper function to extract date reference
  const extractDateReference = (text: string): Date | null => {
    const lowercaseText = text.toLowerCase();
    
    // Handle "tomorrow"
    if (lowercaseText.includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    
    // Handle "today"
    if (lowercaseText.includes('today')) {
      return new Date();
    }
    
    // Handle day names (next occurrence)
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < days.length; i++) {
      if (lowercaseText.includes(days[i])) {
        const today = new Date();
        const dayDiff = (i - today.getDay() + 7) % 7;
        const targetDate = new Date();
        targetDate.setDate(today.getDate() + (dayDiff === 0 ? 7 : dayDiff)); // Next occurrence
        return targetDate;
      }
    }
    
    // Handle specific dates like "May 15" or "15th May"
    const dateMatch = text.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(january|february|march|april|may|june|july|august|september|october|november|december)|(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?/i);
    
    if (dateMatch) {
      const currentYear = new Date().getFullYear();
      let day, month;
      
      if (dateMatch[1] && dateMatch[2]) {
        // Format: "15th May"
        day = parseInt(dateMatch[1]);
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        month = monthNames.indexOf(dateMatch[2].toLowerCase());
      } else {
        // Format: "May 15"
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        month = monthNames.findIndex(m => dateMatch[0].toLowerCase().includes(m));
        day = parseInt(dateMatch[3] || dateMatch[0].match(/\d{1,2}/)[0]);
      }
      
      if (!isNaN(day) && month !== -1) {
        const specificDate = new Date(currentYear, month, day);
        return specificDate;
      }
    }
    
    // Handle generic timeframe mentions
    if (lowercaseText.includes('next week')) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }
    
    if (lowercaseText.includes('weekend')) {
      const weekend = new Date();
      const daysUntilSaturday = (6 - weekend.getDay() + 7) % 7;
      weekend.setDate(weekend.getDate() + daysUntilSaturday);
      return weekend;
    }
    
    // Default to tomorrow if no specific date is found
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };
  
  // Helper function to extract time reference
  const extractTimeReference = (text: string): string => {
    const lowercaseText = text.toLowerCase();
    
    // Check for specific times in format "X PM/AM" or "X:XX PM/AM"
    const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period = timeMatch[3].toLowerCase();
      
      let formattedHour = period === 'pm' && hour < 12 ? hour + 12 : hour;
      if (period === 'am' && hour === 12) formattedHour = 0;
      
      return `${formattedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    // Check for time of day references
    if (lowercaseText.includes('morning')) {
      return '10:00';
    } else if (lowercaseText.includes('afternoon')) {
      return '14:00';
    } else if (lowercaseText.includes('evening')) {
      return '17:00';
    }
    
    // Default time if nothing matches
    return '12:00';
  };

  const findServiceByName = (query: string, services: DbService[]): DbService | null => {
    const normalizedQuery = query.toLowerCase().trim();
    
    // First try exact match
    for (const service of services) {
      if (service.name.toLowerCase() === normalizedQuery) {
        return service;
      }
    }
    
    // Try partial match
    for (const service of services) {
      if (service.name.toLowerCase().includes(normalizedQuery)) {
        return service;
      }
    }
    
    return null;
  };
  
  const findBarberByName = (query: string, barbers: DbBarber[]): DbBarber | null => {
    const normalizedQuery = query.toLowerCase().trim();
    
    // First try exact match
    for (const barber of barbers) {
      if (barber.name.toLowerCase() === normalizedQuery) {
        return barber;
      }
    }
    
    // Try first name match
    for (const barber of barbers) {
      const firstName = barber.name.split(' ')[0].toLowerCase();
      if (firstName === normalizedQuery) {
        return barber;
      }
    }
    
    // Try partial match
    for (const barber of barbers) {
      if (barber.name.toLowerCase().includes(normalizedQuery)) {
        return barber;
      }
    }
    
    return null;
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
    
    // Try to match common service keywords
    if (normalizedQuery.includes('haircut') || normalizedQuery.includes('cut')) {
      return services.find(s => 
        s.name.toLowerCase().includes('haircut') || 
        s.name.toLowerCase().includes('cut')
      ) || null;
    }
    
    if (normalizedQuery.includes('beard') || normalizedQuery.includes('trim')) {
      return services.find(s => 
        s.name.toLowerCase().includes('beard') || 
        s.name.toLowerCase().includes('trim')
      ) || null;
    }
    
    if (normalizedQuery.includes('shave')) {
      return services.find(s => 
        s.name.toLowerCase().includes('shave')
      ) || null;
    }
    
    return null;
  };

  const findFAQFromSupabase = (query: string, faqs: DbFAQ[]): DbFAQ | null => {
    const normalizedQuery = query.toLowerCase();
    
    // First try to match keywords with question
    for (const faq of faqs) {
      if (
        keywordMatch(faq.question.toLowerCase(), normalizedQuery) ||
        keywordMatch(faq.answer.toLowerCase(), normalizedQuery)
      ) {
        return faq;
      }
    }
    
    // If no direct keyword match, try checking for question patterns
    for (const faq of faqs) {
      // Convert FAQ question to lowercase for comparison
      const lowercaseQuestion = faq.question.toLowerCase();
      
      // Check for question keywords
      const questionKeywords = extractKeywords(lowercaseQuestion);
      const userKeywords = extractKeywords(normalizedQuery);
      
      // If there's significant keyword overlap, this is probably the right FAQ
      const overlap = questionKeywords.filter(keyword => userKeywords.includes(keyword));
      if (overlap.length >= Math.min(2, Math.floor(questionKeywords.length / 2))) {
        return faq;
      }
    }
    
    return null;
  };
  
  // Helper function to check for keyword matches
  const keywordMatch = (source: string, query: string): boolean => {
    // Extract important words from the query (3+ letters)
    const queryWords = query
      .split(/\s+/)
      .filter(word => word.length >= 3 && !['how', 'what', 'when', 'where', 'why', 'who', 'the', 'and', 'for', 'are', 'you', 'can', 'your'].includes(word));
    
    // Check if significant keywords from the query appear in the source
    return queryWords.some(word => source.includes(word));
  };
  
  // Extract meaningful keywords from text
  const extractKeywords = (text: string): string[] => {
    const stopWords = ['how', 'what', 'when', 'where', 'why', 'who', 'the', 'and', 'for', 'are', 'you', 'can', 'your', 'that', 'this', 'with', 'have'];
    return text
      .split(/\s+/)
      .map(word => word.replace(/[.,?!;:]/, '').toLowerCase())
      .filter(word => word.length >= 3 && !stopWords.includes(word));
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
  
  // Handle direct navigation to booking page
  const navigateToBooking = (serviceId?: string) => {
    const queryParams = serviceId ? `?service=${serviceId}` : '';
    navigate(`/booking${queryParams}`);
    setIsOpen(false);
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
    services,
    navigateToBooking
  };
}

export default useChatBot;
