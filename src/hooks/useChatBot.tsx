import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  DbService, 
  DbBarber, 
  DbFAQ, 
  DbPromotion,
  DbLocation,
  DbWorkingHours,
  fetchServices,
  fetchBarbers,
  fetchFAQs,
  fetchPromotions,
  fetchLocations,
  fetchWorkingHours,
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

// Enhanced conversation context interface
interface ConversationContext {
  lastTopic?: 'promotions' | 'services' | 'booking' | 'barbers' | 'hours' | 'location' | 'time';
  lastPromotion?: string;
  lastService?: string;
  lastBarber?: string;
  followUpCount: number;
  // New fields for better context tracking
  conversationHistory: {
    topic: string;
    timestamp: Date;
    details?: any;
  }[];
  userPreferences: {
    preferredBarber?: string;
    preferredService?: string;
    preferredTime?: string;
    preferredDay?: string;
  };
  pendingQuestions: {
    topic: string;
    question: string;
    timestamp: Date;
  }[];
  currentIntent?: 'booking' | 'information' | 'support' | 'general';
}

// Update interface for availability check response
interface TimeSlot {
  time: string;
  available: boolean;
}

// Add interface for availability check response
interface BarberAvailabilityResponse {
  available: boolean;
  availableSlots?: string[];
}

export function useChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Welcome to EliteCuts! How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [services, setServices] = useState<DbService[] | null>(null);
  const [barbers, setBarbers] = useState<DbBarber[] | null>(null);
  const [faqs, setFaqs] = useState<DbFAQ[] | null>(null);
  const [promotions, setPromotions] = useState<DbPromotion[] | null>(null);
  // New state variables for location and hours
  const [locations, setLocations] = useState<DbLocation[] | null>(null);
  const [workingHours, setWorkingHours] = useState<DbWorkingHours[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [bookingState, setBookingState] = useState<BookingState>({
    active: false,
    step: 'service',
    data: {}
  });
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    followUpCount: 0,
    conversationHistory: [],
    userPreferences: {},
    pendingQuestions: []
  });
  
  const navigate = useNavigate();

  // Fetch data from Supabase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch all needed data in parallel including location and hours
        const [
          servicesData, 
          barbersData, 
          faqsData, 
          promotionsData,
          locationsData,
          hoursData
        ] = await Promise.all([
          fetchServices(),
          fetchBarbers(),
          fetchFAQs(),
          fetchPromotions(),
          fetchLocations(),
          fetchWorkingHours()
        ]);
        
        if (servicesData) setServices(servicesData);
        if (barbersData) setBarbers(barbersData);
        if (faqsData) setFaqs(faqsData);
        if (promotionsData) setPromotions(promotionsData);
        if (locationsData) setLocations(locationsData);
        if (hoursData) setWorkingHours(hoursData);
        
        setDataInitialized(true);
        
        if (import.meta.env.DEV) {
          console.log('Chatbot data loaded:', {
            services: !!servicesData && servicesData.length,
            barbers: !!barbersData && barbersData.length,
            faqs: !!faqsData && faqsData.length,
            promotions: !!promotionsData && promotionsData.length,
            locations: !!locationsData && locationsData.length,
            hours: !!hoursData && hoursData.length
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

  const handleBookingFlow = async (text: string): Promise<string> => {
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
          
          response = `Great! You've selected ${serviceMatch.name}. Which barber would you prefer for your appointment?\n\n👨‍💼 Our Barbers:\n${barbers?.map(b => `• ${b.name} - ${b.bio?.split('.')[0] || 'Professional barber'}`).join('\n') || ''}\n\nYou can choose any of them, or I can recommend one based on your preferences. What kind of style are you looking for?`;
        } else {
          response = "I don't recognize that service. Please choose from one of our available services:\n\n";
          if (services && services.length > 0) {
            response += services.map(s => `• ${s.name} - $${s.price}`).join('\n');
          }
        }
        break;
        
      case 'barber':
        if (!barbers) return "I'm having trouble accessing our barber information. Please try again later.";
        
        // Handle recommendation requests
        if (text.toLowerCase().includes('recommend') || 
            text.toLowerCase().includes('suggest') || 
            text.toLowerCase().includes('who') || 
            text.toLowerCase().includes('which') ||
            text.toLowerCase().includes('help') ||
            text.toLowerCase().includes('choose') ||
            text.toLowerCase().includes('what do you recommend')) {
          
          // Get the selected service to make a better recommendation
          const selectedService = services?.find(s => s.id === bookingState.data.service);
          
          if (selectedService) {
            // Find barbers who specialize in this type of service
            const specializedBarbers = barbers.filter(b => {
              const specializations = extractSpecializations(b.bio || '');
              return specializations.some(spec => 
                spec.toLowerCase().includes(selectedService.name.toLowerCase()) ||
                (selectedService.name.toLowerCase().includes('haircut') && 
                 (spec.toLowerCase().includes('cut') || spec.toLowerCase().includes('style')))
              );
            });
            
            if (specializedBarbers.length > 0) {
              const recommendedBarber = specializedBarbers[0];
              setBookingState({
                ...bookingState,
                step: 'date',
                data: { ...bookingState.data, barber: recommendedBarber.id }
              });
              
              return `👨‍💼 Barber Recommendation\n\nBased on your selection of ${selectedService.name}, I recommend ${recommendedBarber.name}.\n\n📝 About ${recommendedBarber.name}:\n${recommendedBarber.bio?.split('.')[0] || 'Professional barber with extensive experience.'}\n\n🎯 Specializations:\n${extractSpecializations(recommendedBarber.bio || '').map(s => `• ${s}`).join('\n')}\n\nI've selected ${recommendedBarber.name} for your appointment. What date would you like to book? (e.g., tomorrow, next Friday, May 25)`;
            }
          }
          
          // If no specialized barber found, recommend based on experience
          const experiencedBarber = barbers.find(b => b.bio?.toLowerCase().includes('experienced') || b.bio?.toLowerCase().includes('expert'));
          if (experiencedBarber) {
            setBookingState({
              ...bookingState,
              step: 'date',
              data: { ...bookingState.data, barber: experiencedBarber.id }
            });
            
            return `👨‍💼 Barber Recommendation\n\nI recommend ${experiencedBarber.name} for your appointment.\n\n📝 About ${experiencedBarber.name}:\n${experiencedBarber.bio?.split('.')[0] || 'Professional barber with extensive experience.'}\n\n🎯 Specializations:\n${extractSpecializations(experiencedBarber.bio || '').map(s => `• ${s}`).join('\n')}\n\nI've selected ${experiencedBarber.name} for your appointment. What date would you like to book? (e.g., tomorrow, next Friday, May 25)`;
          }
          
          // If no experienced barber found, just pick the first one
          const firstBarber = barbers[0];
          setBookingState({
            ...bookingState,
            step: 'date',
            data: { ...bookingState.data, barber: firstBarber.id }
          });
          
          return `👨‍💼 Barber Recommendation\n\nI recommend ${firstBarber.name} for your appointment.\n\n📝 About ${firstBarber.name}:\n${firstBarber.bio?.split('.')[0] || 'Professional barber with extensive experience.'}\n\n🎯 Specializations:\n${extractSpecializations(firstBarber.bio || '').map(s => `• ${s}`).join('\n')}\n\nI've selected ${firstBarber.name} for your appointment. What date would you like to book? (e.g., tomorrow, next Friday, May 25)`;
        }
        
        const barberMatch = findBarberByName(text, barbers);
        if (barberMatch) {
          setBookingState({
            ...bookingState,
            step: 'date',
            data: { ...bookingState.data, barber: barberMatch.id }
          });
          
          response = `Great! You've selected ${barberMatch.name}. What date would you like to book? (e.g., tomorrow, next Friday, May 25)`;
        } else {
          response = "I don't recognize that barber. Here are our available barbers:\n\n";
          if (barbers && barbers.length > 0) {
            response += barbers.map(b => `• ${b.name} - ${b.bio?.split('.')[0] || 'Professional barber'}`).join('\n');
            response += "\n\nYou can choose any of them, or I can recommend one based on your preferences. What kind of style are you looking for?";
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
          
          if (!selectedService || !selectedBarber) {
            response = "I'm sorry, there was an error with your booking. Please try again.";
            break;
          }

          // Create appointment data
          const appointmentDate = new Date(`${bookingState.data.date}T${bookingState.data.time}`);
          const startTime = appointmentDate.toTimeString().split(' ')[0]; // Gets HH:MM:SS
          
          const appointmentData = {
            customer_name: bookingState.data.name || '',
            customer_email: bookingState.data.email || '',
            service_id: bookingState.data.service || '',
            barber_id: bookingState.data.barber || '',
            appointment_time: appointmentDate.toISOString(),
            date: bookingState.data.date || '',
            start_time: startTime,
            duration_minutes: selectedService.duration_minutes || 30,
            notes: ''
          };

          try {
            const result = await createAppointment(appointmentData);
            
            if (result.success) {
          setBookingState({
            ...bookingState,
            step: 'complete',
            active: false
          });
          
              // Show success toast
          setTimeout(() => {
            toast("Appointment Booked!", {
                  description: `Your appointment with ${selectedBarber.name} for ${selectedService.name} has been scheduled.`,
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
            } else {
              console.error('Appointment creation failed:', result.error);
              response = "I'm sorry, there was an error booking your appointment. Please try again or contact us directly.";
            }
          } catch (error) {
            console.error('Error creating appointment:', error);
            response = "I'm sorry, there was an error booking your appointment. Please try again or contact us directly.";
          }
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

  // New helper function to detect conversation intent
  const detectIntent = (text: string): ConversationContext['currentIntent'] => {
    const lowercaseText = text.toLowerCase();
    
    if (lowercaseText.includes('book') || 
        lowercaseText.includes('appointment') || 
        lowercaseText.includes('schedule') ||
        lowercaseText.includes('reserve')) {
      return 'booking';
    }
    
    if (lowercaseText.includes('what') || 
        lowercaseText.includes('how') || 
        lowercaseText.includes('tell me') ||
        lowercaseText.includes('information')) {
      return 'information';
    }
    
    if (lowercaseText.includes('help') || 
        lowercaseText.includes('issue') || 
        lowercaseText.includes('problem') ||
        lowercaseText.includes('support')) {
      return 'support';
    }
    
    return 'general';
  };

  // New helper function to handle topic switches
  const handleTopicSwitch = (text: string, currentContext: ConversationContext): Partial<ConversationContext> => {
    const lowercaseText = text.toLowerCase();
    const updates: Partial<ConversationContext> = {};
    
    // Detect new topic
    if (lowercaseText.includes('promotion') || lowercaseText.includes('deal') || lowercaseText.includes('special')) {
      updates.lastTopic = 'promotions';
    } else if (lowercaseText.includes('service') || lowercaseText.includes('haircut') || lowercaseText.includes('price')) {
      updates.lastTopic = 'services';
    } else if (lowercaseText.includes('barber') || lowercaseText.includes('stylist') || lowercaseText.includes('who cut')) {
      updates.lastTopic = 'barbers';
    } else if (lowercaseText.includes('time') || lowercaseText.includes('when') || lowercaseText.includes('available')) {
      updates.lastTopic = 'hours';
    } else if (lowercaseText.includes('where') || lowercaseText.includes('location') || lowercaseText.includes('address')) {
      updates.lastTopic = 'location';
    }
    
    // If topic changed, update history
    if (updates.lastTopic && updates.lastTopic !== currentContext.lastTopic) {
      updates.conversationHistory = [
        ...currentContext.conversationHistory,
        {
          topic: updates.lastTopic,
          timestamp: new Date(),
          details: { text }
        }
      ];
    }
    
    return updates;
  };

  // Add new helper function for barber recommendations
  const getBarberRecommendation = (currentContext: ConversationContext, services: DbService[] | null, barbers: DbBarber[] | null): string => {
    if (!barbers || !services) return "I'm having trouble accessing our barber information. Please try again later.";
    
    const selectedService = services.find(s => s.id === currentContext.lastService);
    if (!selectedService) return "I'm having trouble finding the service details. Please try again.";
    
    // For senior haircuts, prioritize barbers with experience in classic cuts and gentle handling
    if (selectedService.name.toLowerCase().includes('senior')) {
      const seniorSpecialists = barbers.filter(b => 
        b.bio?.toLowerCase().includes('classic') || 
        b.bio?.toLowerCase().includes('experienced') ||
        b.bio?.toLowerCase().includes('gentle') ||
        b.bio?.toLowerCase().includes('traditional')
      );
      
      if (seniorSpecialists.length > 0) {
        const recommendedBarber = seniorSpecialists[0];
        setBookingState(prev => ({
          ...prev,
          step: 'date',
          data: { ...prev.data, barber: recommendedBarber.id }
        }));
        
        return `👨‍💼 Barber Recommendation\n\nFor your Senior Haircut, I recommend ${recommendedBarber.name}.\n\n📝 Why ${recommendedBarber.name}?\n• ${recommendedBarber.bio?.split('.')[0] || 'Experienced barber with gentle approach'}\n• Specializes in classic, comfortable cuts\n• Known for patient, careful service\n\nI've selected ${recommendedBarber.name} for your appointment. What date would you like to book? (e.g., tomorrow, next Friday, May 25)`;
      }
    }
    
    // For other services, recommend based on specialization
    const specializedBarbers = barbers.filter(b => {
      const specializations = extractSpecializations(b.bio || '');
      return specializations.some(spec => 
        spec.toLowerCase().includes(selectedService.name.toLowerCase()) ||
        (selectedService.name.toLowerCase().includes('haircut') && 
         (spec.toLowerCase().includes('cut') || spec.toLowerCase().includes('style')))
      );
    });
    
    if (specializedBarbers.length > 0) {
      const recommendedBarber = specializedBarbers[0];
      setBookingState(prev => ({
        ...prev,
        step: 'date',
        data: { ...prev.data, barber: recommendedBarber.id }
      }));
      
      return `👨‍💼 Barber Recommendation\n\nFor your ${selectedService.name}, I recommend ${recommendedBarber.name}.\n\n📝 About ${recommendedBarber.name}:\n${recommendedBarber.bio?.split('.')[0] || 'Professional barber with extensive experience.'}\n\n🎯 Specializations:\n${extractSpecializations(recommendedBarber.bio || '').map(s => `• ${s}`).join('\n')}\n\nI've selected ${recommendedBarber.name} for your appointment. What date would you like to book? (e.g., tomorrow, next Friday, May 25)`;
    }
    
    // Fallback to most experienced barber
    const experiencedBarber = barbers.find(b => 
      b.bio?.toLowerCase().includes('experienced') || 
      b.bio?.toLowerCase().includes('expert')
    ) || barbers[0];
    
    setBookingState(prev => ({
      ...prev,
      step: 'date',
      data: { ...prev.data, barber: experiencedBarber.id }
    }));
    
    return `👨‍💼 Barber Recommendation\n\nI recommend ${experiencedBarber.name} for your ${selectedService.name}.\n\n📝 About ${experiencedBarber.name}:\n${experiencedBarber.bio?.split('.')[0] || 'Professional barber with extensive experience.'}\n\n🎯 Specializations:\n${extractSpecializations(experiencedBarber.bio || '').map(s => `• ${s}`).join('\n')}\n\nI've selected ${experiencedBarber.name} for your appointment. What date would you like to book? (e.g., tomorrow, next Friday, May 25)`;
  };

  // Update handleVagueInput to use the new recommendation function
  const handleVagueInput = (text: string, currentContext: ConversationContext): string | null => {
    const lowercaseText = text.toLowerCase();
    
    // Handle uncertainty about barber selection
    if (lowercaseText.includes('dont know') || 
        lowercaseText.includes('not sure') || 
        lowercaseText.includes('any') || 
        lowercaseText.includes('doesn\'t matter') || 
        lowercaseText.includes('whatever') ||
        lowercaseText.includes('surprise me') ||
        lowercaseText.includes('suggest') ||
        lowercaseText.includes('recommend') ||
        lowercaseText.includes('help me choose')) {
      
      if (currentContext.lastTopic === 'barbers' || bookingState.step === 'barber') {
        return getBarberRecommendation(currentContext, services, barbers);
      }
      
      if (currentContext.lastTopic === 'time') {
        return "I can help you find a good time. We typically have more availability in the morning (9-11 AM) or late afternoon (3-5 PM). Which time of day do you prefer?";
      }
    }
    
    // Handle "what time works?" type questions
    if (lowercaseText.includes('what time') || 
        lowercaseText.includes('when') || 
        lowercaseText.includes('available')) {
      return "I can help you find a good time. We're open:\n\n" +
             "• Monday-Friday: 9:00 AM - 7:00 PM\n" +
             "• Saturday: 10:00 AM - 6:00 PM\n" +
             "• Sunday: 10:00 AM - 4:00 PM\n\n" +
             "What day of the week works best for you?";
    }
    
    return null;
  };

  // Enhanced updateContext function
  const updateContext = (updates: Partial<ConversationContext>) => {
    setConversationContext(prev => {
      const newContext = {
        ...prev,
        ...updates,
        followUpCount: updates.lastTopic === prev.lastTopic ? prev.followUpCount + 1 : 0
      };
      
      // Update user preferences if relevant
      if (updates.lastBarber) {
        newContext.userPreferences.preferredBarber = updates.lastBarber;
      }
      if (updates.lastService) {
        newContext.userPreferences.preferredService = updates.lastService;
      }
      
      return newContext;
    });
  };

  // Enhanced getContextualResponse function
  const getContextualResponse = (text: string): string | null => {
    const lowercaseText = text.toLowerCase();
    
    // First, detect intent
    const intent = detectIntent(text);
    updateContext({ currentIntent: intent });
    
    // Handle booking requests with context
    if (intent === 'booking' || 
        lowercaseText.includes('book') || 
        lowercaseText.includes('appointment') || 
        lowercaseText.includes('schedule')) {
      
      // If we have a last service in context, start booking with that service
      if (conversationContext.lastService) {
        const service = services?.find(s => s.id === conversationContext.lastService);
        if (service) {
          setBookingState({
            active: true,
            step: 'barber',
            data: { service: service.id }
          });
          updateContext({ lastTopic: 'booking' });
          return `Great! I'll help you book a ${service.name}. Which barber would you prefer for your appointment?\n\n👨‍💼 Our Barbers:\n${barbers?.map(b => `• ${b.name} - ${b.bio?.split('.')[0] || 'Professional barber'}`).join('\n') || ''}\n\nYou can choose any of them, or I can recommend one based on your preferences. What kind of style are you looking for?`;
        }
      }
      
      // If no specific service in context, start from service selection
      setBookingState({
        active: true,
        step: 'service',
        data: {}
      });
      updateContext({ lastTopic: 'booking' });
      return "I'll help you book an appointment. Which service would you like to book?\n\n" +
             (services ? services.map(s => `• ${s.name} - $${s.price}`).join('\n') : '') +
             "\n\nPlease select a service from the list above.";
    }
    
    // Handle topic switch
    const topicUpdates = handleTopicSwitch(text, conversationContext);
    if (Object.keys(topicUpdates).length > 0) {
      updateContext(topicUpdates);
    }
    
    // Handle vague input
    const vagueResponse = handleVagueInput(text, conversationContext);
    if (vagueResponse) {
      return vagueResponse;
    }
    
    // Handle booking flow responses
    if (bookingState.active) {
      // Handle uncertainty or lack of knowledge
      if (lowercaseText.includes('dont know') || 
          lowercaseText.includes('not sure') || 
          lowercaseText.includes('any barber') ||
          lowercaseText.includes('who') ||
          lowercaseText.includes('recommend') ||
          lowercaseText.includes('suggest')) {
        
        if (bookingState.step === 'barber') {
          if (barbers && barbers.length > 0) {
            const barberList = barbers.map(b => `• ${b.name} - ${b.bio?.split('.')[0] || 'Professional barber'}`).join('\n');
            return `No problem! Let me introduce our barbers:\n\n${barberList}\n\nEach of our barbers is highly skilled. You can choose any of them, or I can recommend one based on your preferences. What kind of style are you looking for?`;
          }
        }
        
        if (bookingState.step === 'date') {
          return "No problem! Let me help you find a good time. We're open:\n\n• Monday-Friday: 9:00 - 19:00\n• Saturday: 10:00 - 18:00\n• Sunday: 10:00 - 16:00\n\nWhat day works best for you?";
        }
        
        if (bookingState.step === 'time') {
          return "I can help you find a good time. We typically have more availability:\n\n• Early morning (9:00 - 11:00)\n• Late afternoon (15:00 - 17:00)\n• Evening (17:00 - 19:00)\n\nWhat time of day do you prefer?";
        }
      }

      // Handle booking cancellation or restart
      if (lowercaseText.includes('cancel') || 
          lowercaseText.includes('stop') || 
          lowercaseText.includes('never mind') ||
          lowercaseText.includes('forget it') ||
          lowercaseText.includes('start over')) {
        setBookingState({
          active: false,
          step: 'service',
          data: {}
        });
        updateContext({ lastTopic: undefined });
        return "I've cancelled the booking process. Is there something else I can help you with?";
      }

      // Handle booking postponement
      if (lowercaseText.includes('later') || 
          lowercaseText.includes('not now') || 
          lowercaseText.includes('maybe later') ||
          lowercaseText.includes('think about it')) {
      setBookingState({
          active: false,
        step: 'service',
        data: {}
      });
        updateContext({ lastTopic: undefined });
        return "No problem! Take your time to decide. When you're ready to book, just let me know. Is there anything else you'd like to know about our services?";
      }
    }

    // Handle service-specific questions
    if (conversationContext.lastTopic === 'services') {
      // Handle price-related questions
      if (lowercaseText.includes('expensive') || 
          lowercaseText.includes('cheaper') || 
          lowercaseText.includes('discount') ||
          lowercaseText.includes('promotion')) {
        return "We offer several ways to save:\n\n• New Client Special: 20% off your first visit\n• Tuesday Senior Discount: 15% off for seniors\n• Refer a Friend: $10 off for both you and your friend\n\nWould you like to know more about any of these offers?";
      }

      // Handle duration-related questions
      if (lowercaseText.includes('long') || 
          lowercaseText.includes('time') || 
          lowercaseText.includes('duration') ||
          lowercaseText.includes('quick')) {
        const service = services?.find(s => s.id === conversationContext.lastService);
        if (service) {
          return `A ${service.name} typically takes ${service.duration_minutes} minutes. This includes:\n\n• Consultation\n• Service performance\n• Final styling\n\nWould you like to book this service?`;
        }
      }

      // Handle style-related questions
      if (lowercaseText.includes('style') || 
          lowercaseText.includes('look') || 
          lowercaseText.includes('type') ||
          lowercaseText.includes('kind')) {
        return "Our barbers are experts in various styles:\n\n• Classic cuts\n• Modern fades\n• Textured styles\n• Beard grooming\n\nWhat kind of style are you interested in? I can recommend a barber who specializes in that style.";
      }
    }

    // Handle barber-specific questions
    if (conversationContext.lastTopic === 'barbers') {
      // Handle experience questions
      if (lowercaseText.includes('experience') || 
          lowercaseText.includes('how long') || 
          lowercaseText.includes('expertise')) {
        const barber = barbers?.find(b => b.id === conversationContext.lastBarber);
        if (barber) {
          return `${barber.name} has extensive experience in various styles. ${barber.bio || 'They are a skilled professional barber.'}\n\nWould you like to see their availability?`;
        }
      }

      // Handle specialization questions
      if (lowercaseText.includes('special') || 
          lowercaseText.includes('good at') || 
          lowercaseText.includes('best at')) {
        const barber = barbers?.find(b => b.id === conversationContext.lastBarber);
        if (barber) {
          const specializations = extractSpecializations(barber.bio || '');
          return `${barber.name} specializes in:\n\n${specializations.map(s => `• ${s}`).join('\n')}\n\nWould you like to book an appointment with ${barber.name}?`;
        }
      }
    }
    
    // Handle common customer concerns
    if (lowercaseText.includes('busy') || 
        lowercaseText.includes('crowded') || 
        lowercaseText.includes('wait')) {
      return "We understand your concern about wait times. Here's what you should know:\n\n• We recommend booking in advance\n• Early morning and late afternoon slots are usually less busy\n• You can check real-time availability before booking\n\nWould you like to check availability for a specific time?";
    }

    if (lowercaseText.includes('parking') || 
        lowercaseText.includes('where to park') || 
        lowercaseText.includes('car')) {
      return `🅿️ Parking Information:\n\n• Free parking available in front of our shop\n• Additional street parking nearby\n• Parking is usually available during all business hours\n\nWould you like to know our exact location?`;
    }

    if (lowercaseText.includes('cancel') || 
        lowercaseText.includes('reschedule') || 
        lowercaseText.includes('change')) {
      return `📋 Our Cancellation Policy:\n\n• 24 hours notice required for cancellations\n• Free rescheduling with 24-hour notice\n• Late cancellations may be subject to a fee\n\nWould you like to modify an existing appointment?`;
    }

    // Handle payment-related questions
    if (lowercaseText.includes('pay') || 
        lowercaseText.includes('payment') || 
        lowercaseText.includes('card') ||
        lowercaseText.includes('cash')) {
      return `💳 Payment Information:\n\n• We accept cash and all major credit cards\n• Gift cards available for purchase\n• No deposit required for booking\n• Payment is collected after service\n\nWould you like to know about our gift card options?`;
    }

    // Handle walk-in questions
    if (lowercaseText.includes('walk in') || 
        lowercaseText.includes('without appointment') || 
        lowercaseText.includes('drop in')) {
      return `We accept walk-ins, but please note:\n\n• Appointments take priority\n• Wait times may vary\n• We recommend booking in advance\n• You can check current wait times by calling us\n\nWould you like to book an appointment to guarantee your spot?`;
    }

    // Handle gift card questions
    if (lowercaseText.includes('gift') || 
        lowercaseText.includes('present') || 
        lowercaseText.includes('gift card')) {
      return `🎁 Gift Cards:\n\n• Available in various denominations\n• Can be purchased in-store or online\n• Never expire\n• Perfect for any occasion\n\nWould you like to know more about our gift card options?`;
    }

    // Handle group booking questions
    if (lowercaseText.includes('group') || 
        lowercaseText.includes('multiple') || 
        lowercaseText.includes('together') ||
        lowercaseText.includes('family')) {
      return `For group bookings:\n\n• We can accommodate multiple appointments\n• Special rates available for groups\n• Please book at least 24 hours in advance\n• We recommend booking during off-peak hours\n\nWould you like to book a group appointment?`;
    }

    // Handle emergency/same-day booking questions
    if (lowercaseText.includes('emergency') || 
        lowercaseText.includes('urgent') || 
        lowercaseText.includes('today') ||
        lowercaseText.includes('asap')) {
      return `For urgent appointments:\n\n• We try to accommodate same-day bookings\n• Please call us directly for immediate assistance\n• We maintain some slots for urgent cases\n• Walk-ins are welcome but subject to availability\n\nWould you like me to check current availability?`;
    }

    // Handle booking confirmations
    if (conversationContext.lastTopic === 'services' && 
        (lowercaseText.includes('yes') || lowercaseText.includes('sure') || lowercaseText.includes('okay'))) {
      // Start booking flow
      setBookingState({
        active: true,
        step: 'service',
        data: {
          service: conversationContext.lastService
        }
      });
      updateContext({ lastTopic: 'booking' });
      return "Great! I'll help you book that service. Which barber would you prefer for your appointment?";
    }

    // Handle polite declines and acknowledgments
    if (lowercaseText.includes('no') || 
        lowercaseText.includes('thanks') || 
        lowercaseText.includes('thank you') ||
        lowercaseText.includes('that\'s all') ||
        lowercaseText.includes('goodbye') ||
        lowercaseText.includes('bye')) {
      
      // If we were discussing promotions
      if (conversationContext.lastTopic === 'promotions') {
        updateContext({ lastTopic: undefined, lastPromotion: undefined });
        return "Is there anything else I can help you with? I can provide information about our services, check barber availability, or help you book an appointment.";
      }
      
      // If we were discussing services
      if (conversationContext.lastTopic === 'services') {
        updateContext({ lastTopic: undefined, lastService: undefined });
        return "Is there anything else I can help you with? I can tell you about our promotions, check barber availability, or help you book an appointment.";
      }
      
      // If we were discussing barbers
      if (conversationContext.lastTopic === 'barbers') {
        updateContext({ lastTopic: undefined, lastBarber: undefined });
        return "Is there anything else I can help you with? I can tell you about our services, promotions, or help you book an appointment.";
      }
      
      // Default response for any other context
      updateContext({ lastTopic: undefined });
      return "Is there anything else I can help you with? I can provide information about our services, promotions, barber availability, or help you book an appointment.";
    }

    // Handle follow-up questions about the last topic
    if (conversationContext.lastTopic === 'promotions') {
      // If asking about a specific promotion
      if (conversationContext.lastPromotion) {
        const promotion = promotions?.find(p => 
          p.title.toLowerCase().includes(conversationContext.lastPromotion?.toLowerCase() || '')
        );
        if (promotion) {
          if (lowercaseText.includes('how') || lowercaseText.includes('what') || lowercaseText.includes('tell me more')) {
            return `${promotion.title}: ${promotion.details} Valid until ${new Date(promotion.valid_until).toLocaleDateString()}. Would you like to know about our other promotions?`;
          }
          if (lowercaseText.includes('other') || lowercaseText.includes('more') || lowercaseText.includes('else')) {
            const otherPromotions = promotions?.filter(p => p.title !== promotion.title);
            if (otherPromotions && otherPromotions.length > 0) {
              const promoList = otherPromotions.map(p => p.title).join(', ');
              return `Yes, we also have: ${promoList}. Would you like to know more about any of these?`;
            }
          }
        }
      }
      
      // Handle specific promotion queries when in promotion context
      if (promotions) {
        const specificPromotion = promotions.find(p => 
          p.title.toLowerCase().includes(lowercaseText) ||
          lowercaseText.includes(p.title.toLowerCase())
        );

        if (specificPromotion) {
          updateContext({
            lastTopic: 'promotions',
            lastPromotion: specificPromotion.title
          });
          
          let response = `${specificPromotion.title}: ${specificPromotion.details}`;
          if (specificPromotion.valid_until) {
            response += ` Valid until ${new Date(specificPromotion.valid_until).toLocaleDateString()}.`;
          }
          response += ` Would you like to know about our other promotions?`;
          return response;
        }
      }
    }

    // Handle general conversation flow
    if (lowercaseText.includes('yes') || lowercaseText.includes('sure') || lowercaseText.includes('okay')) {
      if (conversationContext.lastTopic === 'promotions') {
        if (promotions && promotions.length > 0) {
          const promoList = promotions.map(p => p.title).join(', ');
          return `Great! Here are all our current promotions: ${promoList}. Which one would you like to know more about?`;
        }
      }
    }

    // Handle "what else" or "anything else" type questions
    if (lowercaseText.includes('what else') || 
        lowercaseText.includes('anything else') || 
        lowercaseText.includes('other') && lowercaseText.includes('help')) {
      return "I can help you with:\n" +
             "• Information about our services\n" +
             "• Current promotions and special offers\n" +
             "• Barber availability and scheduling\n" +
             "• Booking an appointment\n" +
             "What would you like to know more about?";
    }

    return null;
  };

  // Update the checkBarberAvailabilityForDate function with proper typing
  const checkBarberAvailabilityForDate = async (barberName: string, date: Date): Promise<BarberAvailabilityResponse> => {
    const barber = barbers?.find(b => 
      b.name.toLowerCase().includes(barberName.toLowerCase()) ||
      b.name.toLowerCase().split(' ')[0] === barberName.toLowerCase()
    );
    
    if (!barber) {
      return { available: false };
    }
    
    try {
      const timeSlots = await checkBarberAvailability(barber.id, date.toISOString().split('T')[0]) as TimeSlot[];
      if (!timeSlots) {
        return { available: false };
      }
      
      const availableSlots = timeSlots
        .filter(slot => slot.available)
        .map(slot => slot.time);
      
      return {
        available: availableSlots.length > 0,
        availableSlots: availableSlots
      };
    } catch (error) {
      console.error('Error checking barber availability:', error);
      return { available: false };
    }
  };

  // Add new helper function to handle availability queries
  const handleAvailabilityQuery = async (text: string): Promise<string | null> => {
    const lowercaseText = text.toLowerCase();
    
    // Extract barber name and date from query
    const barberMatch = text.match(/(?:is\s+)?(\w+)(?:\s+available|\s+free|\s+working|\s+on)/i);
    const dateMatch = extractDateReference(text);
    
    if (!barberMatch) return null;
    
    const barberName = barberMatch[1];
    const date = dateMatch || new Date(); // Default to today if no date specified
    
    // Check if the barber exists
    const barber = barbers?.find(b => 
      b.name.toLowerCase().includes(barberName.toLowerCase()) ||
      b.name.toLowerCase().split(' ')[0] === barberName.toLowerCase()
    );
    
    if (!barber) {
      return `I couldn't find a barber named ${barberName}. Here are our barbers:\n\n${barbers?.map(b => `• ${b.name}`).join('\n') || ''}`;
    }
    
    // Check availability
    const availability = await checkBarberAvailabilityForDate(barberName, date);
    
    if (availability.available) {
      if (availability.availableSlots && availability.availableSlots.length > 0) {
        return `Yes, ${barber.name} is available on ${date.toLocaleDateString()}!\n\nAvailable time slots:\n${availability.availableSlots.map(slot => `• ${slot}`).join('\n')}\n\nWould you like to book an appointment with ${barber.name}?`;
      }
      return `Yes, ${barber.name} is available on ${date.toLocaleDateString()}! Would you like to book an appointment?`;
    } else {
      // Check if the shop is open on that day
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const workingDay = workingHours?.find(h => h.day_of_week.toLowerCase() === dayOfWeek);
      
      if (workingDay?.is_closed) {
        return `I'm sorry, but we're closed on ${dayOfWeek}s. Would you like to check availability for a different day?`;
      }
      
      return `I'm sorry, but ${barber.name} is not available on ${date.toLocaleDateString()}. Would you like to:\n\n1. Check availability for a different day?\n2. See other available barbers for this date?\n3. Book with ${barber.name} on a different date?`;
    }
  };

  // Update processUserInput to handle availability queries
  const processUserInput = async (text: string): Promise<string> => {
    if (!dataInitialized) {
      return "I'm still loading data. Please try again in a moment.";
    }
    
    const lowercaseText = text.toLowerCase();
    
    // Check for availability queries first, before any other processing
    if (lowercaseText.includes('available') || 
        lowercaseText.includes('free') || 
        lowercaseText.includes('working') ||
        (lowercaseText.includes('is') && lowercaseText.includes('on'))) {
      
      // Extract barber name and date from query
      const barberMatch = text.match(/(?:is\s+)?(\w+)(?:\s+available|\s+free|\s+working|\s+on)/i);
      const dateMatch = extractDateReference(text);
      
      if (barberMatch) {
        const barberName = barberMatch[1];
        const date = dateMatch || new Date(); // Default to today if no date specified
        
        // Check if the barber exists
        const barber = barbers?.find(b => 
          b.name.toLowerCase().includes(barberName.toLowerCase()) ||
          b.name.toLowerCase().split(' ')[0] === barberName.toLowerCase()
        );
        
        if (!barber) {
          return `I couldn't find a barber named ${barberName}. Here are our barbers:\n\n${barbers?.map(b => `• ${b.name}`).join('\n') || ''}`;
        }
        
        // Check availability
        const availability = await checkBarberAvailabilityForDate(barberName, date);
        
        if (availability.available) {
          if (availability.availableSlots && availability.availableSlots.length > 0) {
            return `Yes, ${barber.name} is available on ${date.toLocaleDateString()}!\n\nAvailable time slots:\n${availability.availableSlots.map(slot => `• ${slot}`).join('\n')}\n\nWould you like to book an appointment with ${barber.name}?`;
          }
          return `Yes, ${barber.name} is available on ${date.toLocaleDateString()}! Would you like to book an appointment?`;
        } else {
          // Check if the shop is open on that day
          const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          const workingDay = workingHours?.find(h => h.day_of_week.toLowerCase() === dayOfWeek);
          
          if (workingDay?.is_closed) {
            return `I'm sorry, but we're closed on ${dayOfWeek}s. Would you like to check availability for a different day?`;
          }
          
          return `I'm sorry, but ${barber.name} is not available on ${date.toLocaleDateString()}. Would you like to:\n\n1. Check availability for a different day?\n2. See other available barbers for this date?\n3. Book with ${barber.name} on a different date?`;
        }
      }
    }
    
    // Check for contextual response first
    const contextualResponse = getContextualResponse(text);
    if (contextualResponse) {
      return contextualResponse;
    }
    
    // Check if we're in active booking flow
    const bookingResponse = await handleBookingFlow(text);
    if (bookingResponse) return bookingResponse;
    
    // Check for service information with improved formatting
    if (lowercaseText.includes('service') || 
        lowercaseText.includes('haircut') || 
        lowercaseText.includes('price') || 
        lowercaseText.includes('cost') ||
        lowercaseText.includes('trim') ||
        lowercaseText.includes('shave') ||
        lowercaseText.includes('offer')) {
      
      if (services && services.length > 0) {
        // Try to find a specific service match
        const service = findServiceFromSupabase(text, services);
        
        if (service) {
          updateContext({
            lastTopic: 'services',
            lastService: service.id
          });
          return `🎯 Service Details\n\n📌 ${service.name}\n💰 Price: $${service.price}\n⏱️ Duration: ${service.duration_minutes} minutes\n\n📝 Description:\n${service.description || 'Our professional service with attention to detail.'}\n\nWould you like to book this service?`;
        } else {
          const serviceNames = services.map(s => `• ${s.name} - $${s.price}`).join('\n');
          return `💇‍♂️ Our Services\n\n${serviceNames}\n\n💰 Price Range: $${Math.min(...services.map(s => s.price))} - $${Math.max(...services.map(s => s.price))}\n\nWould you like me to tell you more about a specific service?`;
        }
      } else {
        return "I'm having trouble accessing our service information. Please check our Services page for details, or contact us directly.";
      }
    }
    
    // Check for barber information with improved formatting
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
            const specializations = extractSpecializations(barber.bio || '');
            return `👨‍💼 Barber Profile\n\n📌 ${barber.name}\n\n🎯 Specializations:\n${specializations.map(s => `• ${s}`).join('\n')}\n\n📝 Bio:\n${barber.bio || 'Professional barber with extensive experience.'}\n\nWould you like to book an appointment with ${barber.name}?`;
          }
        }
        
        // General barber information
        const barberList = barbers.map(b => {
          const specializations = extractSpecializations(b.bio || '');
          return `• ${b.name}\n  ${specializations.map(s => `  - ${s}`).join('\n')}`;
        }).join('\n\n');
        
        return `👨‍💼 Our Team\n\n${barberList}\n\nWould you like to know more about any of our barbers?`;
      }
    }
    
    // Check for location information with improved formatting
    if (lowercaseText.includes('where') || 
        lowercaseText.includes('location') || 
        lowercaseText.includes('address') ||
        lowercaseText.includes('situated')) {
      
      return `📍 Location Information\n\n🏢 Address:\nAltayçeşme, Bağdat Cad. NO:105 D\nIstanbul\n\n📞 Contact:\nPhone: +90 212 123 4567\nEmail: info@elitecuts.com\n\n⏰ Business Hours:\n• Monday-Friday: 9:00 - 19:00\n• Saturday: 10:00 - 18:00\n• Sunday: 10:00 - 16:00`;
    }
    
    // Check for hours information with improved formatting
    if (lowercaseText.includes('hour') || 
        lowercaseText.includes('open') || 
        lowercaseText.includes('close') || 
        (lowercaseText.includes('when') && lowercaseText.includes('open'))) {
      
      if (workingHours && workingHours.length > 0) {
        const formattedHours = workingHours.map(hour => {
          if (hour.is_closed) {
            return `• ${hour.day_of_week}: ❌ Closed`;
          } else {
            return `• ${hour.day_of_week}: ⏰ ${hour.open_time} - ${hour.close_time}`;
          }
        }).join('\n');
        
        return `⏰ Business Hours\n\n${formattedHours}\n\n📝 Note: We recommend booking appointments in advance to secure your preferred time slot.`;
      } else {
        return `⏰ Business Hours\n\n• Monday-Friday: ⏰ 9:00 AM - 7:00 PM\n• Saturday: ⏰ 10:00 AM - 6:00 PM\n• Sunday: ⏰ 10:00 AM - 4:00 PM\n\n📝 Note: We recommend booking appointments in advance to secure your preferred time slot.`;
      }
    }
    
    // Check for promotions with improved formatting
    if (lowercaseText.includes('discount') || 
        lowercaseText.includes('offer') || 
        lowercaseText.includes('promo') || 
        lowercaseText.includes('deal') || 
        lowercaseText.includes('special') ||
        lowercaseText.includes('promotion')) {
      
      if (promotions && promotions.length > 0) {
        const specificPromotion = promotions.find(p => 
          p.title.toLowerCase().includes(lowercaseText) ||
          (p.details && p.details.toLowerCase().includes(lowercaseText))
        );

        if (specificPromotion) {
          updateContext({
            lastTopic: 'promotions',
            lastPromotion: specificPromotion.title
          });
          
          return `🎉 Special Offer\n\n📌 ${specificPromotion.title}\n\n📝 Details:\n${specificPromotion.details}\n\n⏰ Valid until: ${new Date(specificPromotion.valid_until).toLocaleDateString()}\n\nWould you like to know about our other promotions?`;
        }
        
        updateContext({ lastTopic: 'promotions' });
        const promoList = promotions.map(p => `• ${p.title}\n  ${p.details?.split('.')[0] || ''}`).join('\n\n');
        return `🎉 Current Promotions\n\n${promoList}\n\nWhich promotion would you like to know more about?`;
      }
      
      return `🎉 We have several promotions throughout the year. Please check our website for the latest deals or ask me about a specific promotion.`;
    }
    
    // Default response with improved formatting
    return `👋 Welcome to EliteCuts!\n\nI can help you with:\n\n📌 Services & Pricing\n🎉 Current Promotions\n👨‍💼 Barber Information\n⏰ Availability & Booking\n❓ Frequently Asked Questions\n\nHow can I assist you today?`;
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
    const normalizedQuery = query.toLowerCase().trim();
    
    // First try exact match
    const exactMatch = services.find(service => 
      service.name.toLowerCase() === normalizedQuery
    );
    if (exactMatch) {
      return exactMatch;
    }
    
    // Try partial match with higher priority for service names that start with the query
    const partialMatches = services.filter(service => 
      service.name.toLowerCase().includes(normalizedQuery)
    ).sort((a, b) => {
      // Prioritize matches that start with the query
      const aStartsWith = a.name.toLowerCase().startsWith(normalizedQuery);
      const bStartsWith = b.name.toLowerCase().startsWith(normalizedQuery);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return 0;
    });
    
    if (partialMatches.length > 0) {
      return partialMatches[0];
    }
    
    // Try to match common service keywords as fallback
    if (normalizedQuery.includes('senior') || normalizedQuery.includes('elder')) {
      return services.find(s => 
        s.name.toLowerCase().includes('senior')
      ) || null;
    }
    
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

  // Helper function to extract specializations from barber bio
  const extractSpecializations = (bio: string): string[] => {
    const specializations = [
      'Classic Cuts',
      'Modern Fades',
      'Beard Grooming',
      'Textured Styles',
      'Traditional Shaves'
    ];
    
    // Extract specializations mentioned in bio
    const mentioned = specializations.filter(spec => 
      bio.toLowerCase().includes(spec.toLowerCase())
    );
    
    return mentioned.length > 0 ? mentioned : ['All Haircut Styles'];
  };

  return {
    isOpen,
    setIsOpen,
    input,
    setInput,
    messages,
    setMessages,
    isTyping,
    setIsTyping,
    bookingState,
    setBookingState,
    conversationContext,
    setConversationContext,
    handleSend,
    processUserInput,
    navigateToBooking,
    isLoading,
    barbers,
    services,
    dataInitialized,
  };
}

export default useChatBot;
