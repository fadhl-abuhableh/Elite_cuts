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
  fetchBarberSpecializations,
  fetchStyleCategories,
  checkBarberAvailability,
  checkBarberWorkingDay,
  createAppointment,
  DbService,
  DbBarber,
  DbFAQ,
  DbPromotion,
  DbLocation,
  DbWorkingHours,
  DbBarberSpecialization,
  DbStyleCategory
} from '@/lib/supabase';
import { getBarberRecommendation, formatBookingResponse } from '@/lib/chatResponses';
import {
  formatStyleCategoryResponse,
  formatServiceDetails,
  formatHairColoringResponse,
  formatKidsHaircutResponse,
  formatBeardTrimResponse,
  formatHotTowelShaveResponse,
  getStyleResponse
} from '@/lib/styleResponses';

// Define message interface
export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

// Add booking state interface
interface BookingState {
  step: 'idle' | 'service' | 'barber' | 'date' | 'time' | 'name' | 'email' | 'phone' | 'notes' | 'confirm';
  data: {
    service?: string;
    barber?: string;
    date?: string;
    time?: string;
    name?: string;
    email?: string;
    phone?: string;
    notes?: string;
  };
}

export function useChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [conversationContext, setConversationContext] = useState<string | null>(null);
  const [bookingState, setBookingState] = useState<BookingState>({
    step: 'idle',
    data: {}
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Data from Supabase
  const [services, setServices] = useState<DbService[]>([]);
  const [barbers, setBarbers] = useState<DbBarber[]>([]);
  const [barberSpecializations, setBarberSpecializations] = useState<DbBarberSpecialization[]>([]);
  const [faqs, setFaqs] = useState<DbFAQ[]>([]);
  const [promotions, setPromotions] = useState<DbPromotion[]>([]);
  const [locations, setLocations] = useState<DbLocation[]>([]);
  const [workingHours, setWorkingHours] = useState<DbWorkingHours[]>([]);
  const [styleCategories, setStyleCategories] = useState<DbStyleCategory[]>([]);

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        const servicesData = await fetchServices();
        const barbersData = await fetchBarbers();
        const specializationsData = await fetchBarberSpecializations();
        const faqsData = await fetchFAQs();
        const promotionsData = await fetchPromotions();
        const locationsData = await fetchLocations();
        const workingHoursData = await fetchWorkingHours();
        const styleCategoriesData = await fetchStyleCategories();
        
        if (servicesData) setServices(servicesData);
        if (barbersData) setBarbers(barbersData);
        if (specializationsData) setBarberSpecializations(specializationsData);
        if (faqsData) setFaqs(faqsData);
        if (promotionsData) setPromotions(promotionsData);
        if (locationsData) setLocations(locationsData);
        if (workingHoursData) setWorkingHours(workingHoursData);
        if (styleCategoriesData) setStyleCategories(styleCategoriesData);
        
        setDataInitialized(true);
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

  // Find specific service information
  const findServiceInfo = useCallback((query: string) => {
    if (services.length === 0) return null;
    
    const normalizedQuery = query.toLowerCase();
    
    // Handle specific service types
    if (normalizedQuery.includes('color') || normalizedQuery.includes('coloring')) {
      return formatHairColoringResponse();
    }
    
    if (normalizedQuery.includes('kid') || normalizedQuery.includes('child')) {
      return formatKidsHaircutResponse();
    }
    
    if (normalizedQuery.includes('beard')) {
      return formatBeardTrimResponse();
    }
    
    if (normalizedQuery.includes('shave') || normalizedQuery.includes('hot towel')) {
      return formatHotTowelShaveResponse();
    }
    
    // Extract the service name from queries like "do you offer beard trim"
    const serviceKeywords = ['offer', 'do you have', 'provide', 'about'];
    let searchQuery = normalizedQuery;
    for (const keyword of serviceKeywords) {
      if (normalizedQuery.includes(keyword)) {
        searchQuery = normalizedQuery.split(keyword)[1]?.trim() || normalizedQuery;
        break;
      }
    }
    
    // Look for specific service matches
    const matchingService = services.find(service => {
      const serviceName = service.name.toLowerCase();
      const serviceDesc = (service.description || '').toLowerCase();
      
      // Check if the search query contains key parts of the service name
      const serviceWords = serviceName.split(' ');
      const queryWords = searchQuery.split(' ');
      
      return serviceWords.some(word => queryWords.includes(word)) ||
             queryWords.some(word => serviceName.includes(word)) ||
             serviceDesc.includes(searchQuery);
    });
    
    if (!matchingService) return null;
    
    return formatServiceDetails(
      matchingService.name,
      matchingService.price || 0,
      matchingService.duration_minutes || 0,
      matchingService.description || ''
    );
  }, [services]);

  // Find style category information
  const findStyleCategoryInfo = useCallback((query: string) => {
    if (!styleCategories || styleCategories.length === 0) return null;
    
    const normalizedQuery = query.toLowerCase();
    
    // Look for specific style matches
    const matchingStyle = styleCategories.find(style => {
      const styleName = style.name.toLowerCase();
      const styleDesc = (style.description || '').toLowerCase();
      
      return styleName.includes(normalizedQuery) ||
             styleDesc.includes(normalizedQuery);
    });
    
    if (!matchingStyle) return null;
    
    return formatStyleCategoryResponse(matchingStyle);
  }, [styleCategories]);

  // Navigate to booking
  const navigateToBooking = useCallback(() => {
    setIsOpen(false);
    navigate('/booking');
  }, [navigate]);

  // Format services for display
  const formatServicesResponse = useCallback(() => {
    if (services.length === 0) return "I'm sorry, we couldn't load our service information right now.";
    
    return `💇‍♂️ Our Services:\n\n${services
      .map(service => `• **${service.name}** - $${service.price} (${service.duration_minutes} mins)\n  ${service.description || 'No description available.'}`)
      .join('\n\n')}`;
  }, [services]);

  // Get barber information by ID or name
  const getBarberInfo = useCallback((barberId?: string, barberName?: string) => {
    if (barbers.length === 0) return null;
    
    let barber: DbBarber | undefined;
    
    if (barberId) {
      barber = barbers.find(b => b.id === barberId);
    } else if (barberName) {
      // Case-insensitive partial name matching
      const normalizedName = barberName.toLowerCase();
      barber = barbers.find(b => 
        b.name.toLowerCase().includes(normalizedName)
      );
    }
    
    if (!barber) return null;
    
    return barber;
  }, [barbers]);

  // Format barbers for display
  const formatBarbersResponse = useCallback(() => {
    if (barbers.length === 0) return "I'm sorry, we couldn't load our barber information right now.";
    
    return `👨‍💼 Our Talented Barbers:\n\n${barbers
      .map(barber => `• **${barber.name}**\n  ${barber.bio || 'No bio available.'}`)
      .join('\n\n')}`;
  }, [barbers]);

  // Display barber details with specializations (if available)
  const formatBarberDetails = useCallback((barberName: string) => {
    const barber = getBarberInfo(undefined, barberName);
    
    if (!barber) {
      return `I'm sorry, I couldn't find information about a barber named "${barberName}".`;
    }
    
    return `👨‍💼 **${barber.name}**\n\n${barber.bio || 'No bio available.'}\n\n${barber.is_active ? '✅ Currently available for bookings' : '❌ Not currently available for bookings'}`;
  }, [getBarberInfo]);

  // Format location information
  const formatLocationResponse = useCallback(() => {
    if (locations.length === 0) return "I'm sorry, we couldn't load our location information right now.";
    
    const location = locations[0]; // Assuming the first location is the primary one
    return `📍 Location Information:\n\n**${location.name}**\n${location.address}\n${location.city}\n\n📱 Phone: ${location.phone || 'Not available'}\n📧 Email: ${location.email || 'Not available'}\n\nFeel free to visit us or book an appointment!`;
  }, [locations]);

  // Format working hours
  const formatHoursResponse = useCallback(() => {
    if (workingHours.length === 0) return "I'm sorry, we couldn't load our hours information right now.";
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const sortedHours = [...workingHours].sort((a, b) => {
      // Ensure day_of_week is treated as a number for comparison
      const dayA = typeof a.day_of_week === 'number' ? a.day_of_week : parseInt(String(a.day_of_week), 10);
      const dayB = typeof b.day_of_week === 'number' ? b.day_of_week : parseInt(String(b.day_of_week), 10);
      return dayA - dayB;
    });
    
    return `⏰ Business Hours:\n\n${sortedHours
      .map(hour => {
        const dayIndex = typeof hour.day_of_week === 'number' ? hour.day_of_week : parseInt(String(hour.day_of_week), 10);
        if (hour.is_closed) {
          return `• **${dayNames[dayIndex]}**: Closed`;
        }
        return `• **${dayNames[dayIndex]}**: ${hour.open_time} - ${hour.close_time}`;
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
    
    return `🎉 Current Promotions:\n\n${activePromotions
      .map(promo => {
        const validUntil = promo.valid_until ? `Valid until: ${new Date(promo.valid_until).toLocaleDateString()}` : 'No expiration date';
        return `• **${promo.title}**\n  ${promo.details || 'No details available.'}\n  ${validUntil}`;
      })
      .join('\n\n')}`;
  }, [promotions]);

  // Get today's hours
  const getTodaysHours = useCallback(() => {
    if (workingHours.length === 0) return null;
    
    const today = new Date().getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    const todayHours = workingHours.find(hour => {
      const dayIndex = typeof hour.day_of_week === 'number' ? hour.day_of_week : parseInt(String(hour.day_of_week), 10);
      return dayIndex === today;
    });
    
    if (!todayHours) return null;
    
    if (todayHours.is_closed) {
      return "We're closed today.";
    }
    
    return `We're open today from ${todayHours.open_time} to ${todayHours.close_time}.`;
  }, [workingHours]);

  // Format FAQ response
  const formatFAQResponse = useCallback((query: string) => {
    if (faqs.length === 0) return null;
    
    // Find most relevant FAQ - improved implementation
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    // Calculate relevance score for each FAQ
    const scoredFaqs = faqs.map(faq => {
      const questionWords = faq.question.toLowerCase().split(/\s+/);
      const answerWords = faq.answer.toLowerCase().split(/\s+/);
      const allWords = [...new Set([...questionWords, ...answerWords])];
      
      let score = 0;
      // Score for exact phrase matches
      if (faq.question.toLowerCase().includes(query.toLowerCase())) {
        score += 10;
      }
      if (faq.answer.toLowerCase().includes(query.toLowerCase())) {
        score += 5;
      }
      
      // Score for individual word matches
      for (const word of queryWords) {
        if (allWords.includes(word)) score += 1;
      }
      
      return { faq, score };
    });
    
    // Sort by score and get the best match
    scoredFaqs.sort((a, b) => b.score - a.score);
    const bestMatch = scoredFaqs[0];
    
    // Only return if we have a decent match
    if (bestMatch && bestMatch.score >= 2) {
      return `❓ ${bestMatch.faq.answer}`;
    }
    
    return null;
  }, [faqs]);

  // Format barber specializations response
  const formatBarberSpecializationsResponse = useCallback(() => {
    if (barbers.length === 0) return "I'm sorry, we couldn't load our barber information right now.";
    
    // Group specializations by barber
    const barberSpecs = barbers.map(barber => {
      const specialties = barberSpecializations.filter(spec => spec.barber_id === barber.id);
      return {
        name: barber.name,
        specialties: specialties.map(spec => spec.specialization).filter(Boolean)
      };
    });

    return `👨‍💼 Our Barbers' Specializations:\n\n${barberSpecs
      .map(barber => 
        `• **${barber.name}**\n  ${barber.specialties.length > 0 
          ? barber.specialties.join('\n  ')
          : 'No specific specializations listed'}`
      )
      .join('\n\n')}`;
  }, [barbers, barberSpecializations]);

  // Handle booking flow
  const handleBookingFlow = useCallback(async (userInput: string) => {
    const normalizedInput = userInput.toLowerCase().trim();
    
    switch (bookingState.step) {
      case 'idle':
        // Start booking flow
        setBookingState({ step: 'service', data: {} });
        setMessages(prev => [...prev, {
        id: uuidv4(),
        sender: 'bot',
          text: "I'll help you book an appointment. Which service would you like?\n\n" + formatServicesResponse(),
        timestamp: new Date()
      }]);
        break;

      case 'service':
        // Find matching service
        const matchingService = services.find(s => 
          s.name.toLowerCase().includes(normalizedInput) || 
          s.id === normalizedInput
        );
        
        if (matchingService) {
          setBookingState(prev => ({
            step: 'barber',
            data: { ...prev.data, service: matchingService.id }
          }));

          // Find the most suitable barbers based on service type and specializations
          const suitableBarbers = barbers.filter(barber => {
            const barberSpecs = barberSpecializations.filter(spec => spec.barber_id === barber.id);
            
            // Check if barber specializes in this type of service
            const isSpecialized = barberSpecs.some(spec => 
              spec.specialization.toLowerCase().includes(matchingService.name.toLowerCase()) ||
              (matchingService.name.toLowerCase().includes('senior') && spec.specialization.toLowerCase().includes('senior')) ||
              (matchingService.name.toLowerCase().includes('kid') && spec.specialization.toLowerCase().includes('kid')) ||
              (matchingService.name.toLowerCase().includes('color') && spec.specialization.toLowerCase().includes('color'))
            );

            return isSpecialized;
          });

          let recommendationMessage = '';
          if (suitableBarbers.length > 0) {
            const topBarbers = suitableBarbers.slice(0, 2); // Get top 2 specialized barbers
            recommendationMessage = `Based on your selected service (${matchingService.name}), I recommend:\n\n` +
              topBarbers.map(barber => 
                `• **${barber.name}** - ${barberSpecializations
                  .filter(spec => spec.barber_id === barber.id)
                  .map(spec => spec.specialization)
                  .join(', ')}`
              ).join('\n\n') +
              '\n\nWould you like to book with any of these barbers? Or would you like to see all our barbers?';
          } else {
            recommendationMessage = formatBarbersResponse() + "\n\nPlease choose a barber from the list above.";
          }

          setMessages(prev => [...prev, {
            id: uuidv4(),
            sender: 'bot',
            text: recommendationMessage,
            timestamp: new Date()
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: uuidv4(),
            sender: 'bot',
            text: "I couldn't find that service. Please select from the list above.",
            timestamp: new Date()
          }]);
        }
        break;

      case 'barber':
        // Handle direct barber selection or recommendation acceptance
        let chosenBarber = null;
        
        // Check if user accepted a recommendation
        if (normalizedInput === 'yes' && messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          const barberMatch = lastMessage.text.match(/\*\*(.*?)\*\*/);
          if (barberMatch) {
            const recommendedBarberName = barberMatch[1];
            chosenBarber = barbers.find(b => b.name === recommendedBarberName);
          }
        } else {
          // Direct barber selection
          chosenBarber = barbers.find(b => 
            b.name.toLowerCase().includes(normalizedInput) || 
            b.id === normalizedInput
          );
        }
      
        if (chosenBarber) {
          setBookingState(prev => ({
            step: 'date',
            data: { ...prev.data, barber: chosenBarber.id }
          }));
          setMessages(prev => [...prev, {
            id: uuidv4(),
            sender: 'bot',
            text: "Great! Please select a date for your appointment",
            timestamp: new Date()
          }]);
        } else if (normalizedInput.includes('see all') || normalizedInput.includes('show all')) {
          // Show all barbers if requested
          setMessages(prev => [...prev, {
            id: uuidv4(),
            sender: 'bot',
            text: formatBarbersResponse(),
            timestamp: new Date()
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: uuidv4(),
            sender: 'bot',
            text: "I couldn't find that barber. Please select from the list above or type 'show all barbers' to see everyone.",
            timestamp: new Date()
          }]);
        }
        break;

      case 'date':
        // Process date input directly - removed barber switching logic
        handleDateSelection(normalizedInput, bookingState.data.barber!);
        break;

      case 'time':
        // Validate time format
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(normalizedInput)) {
          setMessages(prev => [...prev, {
            id: uuidv4(),
            sender: 'bot',
            text: "Please enter a valid time in 24-hour format (e.g., '14:30').",
            timestamp: new Date()
          }]);
          return;
        }

        setBookingState(prev => ({
          step: 'name',
          data: { ...prev.data, time: normalizedInput }
        }));

        setMessages(prev => [...prev, {
          id: uuidv4(),
          sender: 'bot',
          text: "Perfect! What's your full name?",
          timestamp: new Date()
        }]);
        break;

      case 'name':
        setBookingState(prev => ({
          step: 'email',
          data: { ...prev.data, name: userInput }
        }));

        setMessages(prev => [...prev, {
          id: uuidv4(),
          sender: 'bot',
          text: "Thanks! What's your email address?",
          timestamp: new Date()
        }]);
        break;

      case 'email':
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedInput)) {
          setMessages(prev => [...prev, {
            id: uuidv4(),
            sender: 'bot',
            text: "Please enter a valid email address.",
            timestamp: new Date()
          }]);
          return;
        }

        setBookingState(prev => ({
          step: 'phone',
          data: { ...prev.data, email: userInput }
        }));

        setMessages(prev => [...prev, {
          id: uuidv4(),
          sender: 'bot',
          text: "Great! What's your phone number?",
          timestamp: new Date()
        }]);
        break;

      case 'phone':
        // Validate phone number
        const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        if (!phoneRegex.test(normalizedInput)) {
          setMessages(prev => [...prev, {
            id: uuidv4(),
            sender: 'bot',
            text: "Please enter a valid phone number (e.g., +90 555 123 4567).",
            timestamp: new Date()
          }]);
          return;
        }

        setBookingState(prev => ({
          step: 'notes',
          data: { ...prev.data, phone: userInput }
        }));

        setMessages(prev => [...prev, {
          id: uuidv4(),
          sender: 'bot',
          text: "Any special requests or notes for your appointment? (Type 'none' if not applicable)",
          timestamp: new Date()
        }]);
        break;

      case 'notes':
        const notes = normalizedInput === 'none' ? '' : userInput;
        setBookingState(prev => ({
          step: 'confirm',
          data: { 
            ...prev.data, 
            notes
          }
        }));

        // Get service and barber details for confirmation
        const selectedService = services.find(s => s.id === bookingState.data.service);
        const selectedBarber = barbers.find(b => b.id === bookingState.data.barber);

        setMessages(prev => [...prev, {
          id: uuidv4(),
          sender: 'bot',
          text: `Please confirm your appointment details:\n\n` +
                `Service: ${selectedService?.name}\n` +
                `Barber: ${selectedBarber?.name}\n` +
                `Date: ${bookingState.data.date}\n` +
                `Time: ${bookingState.data.time}\n` +
                `Notes: ${bookingState.data.notes || 'None'}\n\n` +
                `Is this correct? (Type 'yes' to confirm or 'no' to start over)`,
          timestamp: new Date()
        }]);
        break;

      case 'confirm':
        if (normalizedInput === 'yes') {
          // Get service details for duration
          const selectedService = services.find(s => s.id === bookingState.data.service);
          if (!selectedService) {
            console.error('Service not found');
            setMessages(prev => [...prev, {
              id: uuidv4(),
              sender: 'bot',
              text: "I'm sorry, there was an error with your booking. Please try again.",
              timestamp: new Date()
            }]);
            setBookingState({ step: 'idle', data: {} });
            return;
          }

          // Create appointment date/time
          const appointmentDate = new Date(`${bookingState.data.date}T${bookingState.data.time}`);
          const startTime = appointmentDate.toISOString();
          
          // Calculate end time based on service duration
          const endDate = new Date(appointmentDate.getTime() + selectedService.duration_minutes * 60000);
          
          // Create the appointment
          const appointment = {
            service_id: bookingState.data.service,
            barber_id: bookingState.data.barber,
            date: bookingState.data.date,
            appointment_time: startTime,
            start_time: startTime,
            duration_minutes: selectedService.duration_minutes,
            customer_name: bookingState.data.name,
            customer_email: bookingState.data.email,
            customer_phone: bookingState.data.phone,
            notes: bookingState.data.notes || ''
          };

          try {
            await createAppointment(appointment);
            setMessages(prev => [...prev, {
              id: uuidv4(),
              sender: 'bot',
              text: "✅ Your appointment has been confirmed! You'll receive a confirmation email shortly with the details.\n\nIs there anything else I can help you with?",
              timestamp: new Date()
            }]);
            // Reset booking state
            setBookingState({ step: 'idle', data: {} });
          } catch (error) {
            console.error('Error creating appointment:', error);
            setMessages(prev => [...prev, {
              id: uuidv4(),
              sender: 'bot',
              text: "I'm sorry, there was an error booking your appointment. Please try again or contact us directly.",
              timestamp: new Date()
            }]);
            setBookingState({ step: 'idle', data: {} });
          }
        } else if (normalizedInput === 'no') {
          setMessages(prev => [...prev, {
            id: uuidv4(),
            sender: 'bot',
            text: "No problem! Let's start over. Which service would you like?\n\n" + formatServicesResponse(),
            timestamp: new Date()
          }]);
          setBookingState({ step: 'service', data: {} });
        } else {
          setMessages(prev => [...prev, {
            id: uuidv4(),
            sender: 'bot',
            text: "Please type 'yes' to confirm or 'no' to start over.",
            timestamp: new Date()
          }]);
        }
        break;
    }
  }, [services, barbers, bookingState, setMessages, navigate, formatServicesResponse, formatBarbersResponse, getBarberInfo, formatLocationResponse, formatHoursResponse, formatPromotionsResponse, getTodaysHours, formatFAQResponse, getBarberRecommendation, formatBookingResponse]);

  // Process user input and generate response
  const processUserInput = useCallback((userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    const normalizedInput = lowerInput.trim();

    // Fast path for style queries - check this first
    const styleKeywords = ['modern fade', 'classic cut', 'textured crop', 'pompadour'];
    const isStyleQuery = normalizedInput.includes('tell me about') || 
                        normalizedInput.includes('what is') || 
                        normalizedInput.includes('how is');

    if (isStyleQuery) {
      for (const style of styleKeywords) {
        if (normalizedInput.includes(style.toLowerCase())) {
          const response = getStyleResponse(style);
          setMessages(prev => [...prev, {
            id: uuidv4(),
            sender: 'bot',
            text: response,
            timestamp: new Date()
          }]);
          setIsTyping(false);
          return;
        }
      }
    }

    // Handle booking state if active
    if (bookingState.step !== 'idle') {
      // Special handling for final confirmation
      if (bookingState.step === 'confirm' && normalizedInput === 'yes') {
        // Get service details for duration
        const selectedService = services.find(s => s.id === bookingState.data.service);
        if (!selectedService) {
          console.error('Service not found');
          return;
        }

        // Create appointment date/time
        const appointmentDate = new Date(bookingState.data.date + 'T' + bookingState.data.time);
        const startTime = appointmentDate.toISOString();
        
        // Calculate end time
        const endDate = new Date(appointmentDate.getTime() + selectedService.duration_minutes * 60000);
        
        // Create the appointment with required fields
        const appointment = {
          service_id: bookingState.data.service,
          barber_id: bookingState.data.barber,
          date: bookingState.data.date,
          appointment_time: startTime,
          start_time: startTime,
          duration_minutes: selectedService.duration_minutes,
          customer_name: bookingState.data.name,
          customer_email: bookingState.data.email,
          customer_phone: bookingState.data.phone,
          notes: bookingState.data.notes || ''
        };

        // Create appointment in database
        createAppointment(appointment)
          .then(() => {
            setMessages(prev => [...prev, {
              id: uuidv4(),
              sender: 'bot',
              text: "✅ Your appointment has been confirmed! You'll receive a confirmation email shortly with the details.\n\nIs there anything else I can help you with?",
              timestamp: new Date()
            }]);
            // Reset booking state
            setBookingState({
              step: 'idle',
              data: {}
            });
          })
          .catch(error => {
            console.error('Error creating appointment:', error);
            setMessages(prev => [...prev, {
              id: uuidv4(),
              sender: 'bot',
              text: "I'm sorry, there was an error booking your appointment. Please try again or contact us directly.",
              timestamp: new Date()
            }]);
            // Reset booking state
            setBookingState({
              step: 'idle',
              data: {}
            });
          });
        setIsTyping(false);
        return;
      }
      
      // Special handling for barber confirmation
      if (bookingState.step === 'barber' && normalizedInput === 'yes') {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.sender === 'bot' && lastMessage.text.includes('Would you like to book with')) {
          // Extract barber name from the recommendation message
          const match = lastMessage.text.match(/\*\*(.*?)\*\*/);
          if (match) {
            const recommendedBarberName = match[1];
            const chosenBarber = barbers.find(b => b.name === recommendedBarberName);
            
            if (chosenBarber) {
              setBookingState(prev => ({
                step: 'date',
                data: { ...prev.data, barber: chosenBarber.id }
              }));
              
              setMessages(prev => [...prev, {
        id: uuidv4(),
        sender: 'bot',
                text: "Great! Please select a date for your appointment",
        timestamp: new Date()
      }]);
      setIsTyping(false);
      return;
    }
          }
        }
      }

      // Handle other booking steps
      handleBookingFlow(userInput);
      setIsTyping(false);
      return;
    }

    // Check for "yes" response to style booking question
    if (normalizedInput === 'yes' && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'bot' && lastMessage.text.includes('Would you like to book an appointment for this style?')) {
        // Start booking flow with service selection
        setBookingState({ step: 'service', data: {} });
        setMessages(prev => [...prev, {
          id: uuidv4(),
          sender: 'bot',
          text: "I'll help you book an appointment. Which service would you like?\n\n" + formatServicesResponse(),
          timestamp: new Date()
        }]);
        setIsTyping(false);
        return;
      }
    }

    // Check for "yes" response to service booking question
    if (normalizedInput === 'yes' && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'bot' && lastMessage.text.includes('Would you like to book this service?')) {
        // Find the service from the last message
        const serviceInfo = lastMessage.text.split('\n')[0]; // Gets the first line with service name
        const serviceName = serviceInfo.match(/\*\*(.*?)\*\*/)?.[1]; // Extract name between **
        
        const selectedService = services.find(s => s.name === serviceName);
        if (selectedService) {
          // Set the service in booking state and move to barber selection
          setBookingState({
            step: 'barber',
            data: { service: selectedService.id }
          });
          
          setMessages(prev => [...prev, {
            id: uuidv4(),
            sender: 'bot',
            text: formatBookingResponse('service_selected', { service: selectedService }),
            timestamp: new Date()
          }]);
          setIsTyping(false);
          return;
        }
      }
    }
      
    // Handle booking intent
    if (normalizedInput.includes('book') || normalizedInput.includes('appointment') || normalizedInput.includes('schedule')) {
      setBookingState({ step: 'service', data: {} });
      setMessages(prev => [...prev, {
        id: uuidv4(),
        sender: 'bot',
        text: "I'll help you book an appointment. Which service would you like?\n\n" + formatServicesResponse(),
        timestamp: new Date()
      }]);
      setIsTyping(false);
      return;
    }

    // Handle style category inquiries
    if (normalizedInput.includes('style') || normalizedInput.includes('cut') || normalizedInput.includes('look')) {
      const styleInfo = findStyleCategoryInfo(normalizedInput);
      if (styleInfo) {
        setMessages(prev => [...prev, {
          id: uuidv4(),
          sender: 'bot',
          text: styleInfo,
          timestamp: new Date()
        }]);
        setIsTyping(false);
        return;
      }
    }

    // Handle service inquiries
    if (normalizedInput.includes('service') || 
        normalizedInput.includes('offer') || 
        normalizedInput.includes('shave') || 
        normalizedInput.includes('included')) {
      const serviceInfo = findServiceInfo(normalizedInput);
      if (serviceInfo) {
        setMessages(prev => [...prev, {
          id: uuidv4(),
          sender: 'bot',
          text: serviceInfo,
          timestamp: new Date()
        }]);
        // Set context for next response
        setConversationContext('service_info');
        setIsTyping(false);
        return;
      }
      
      setMessages(prev => [...prev, {
        id: uuidv4(),
        sender: 'bot',
        text: formatServicesResponse(),
        timestamp: new Date()
      }]);
      setIsTyping(false);
      return;
    }

    // Handle barber specialization inquiries
    if (normalizedInput.includes('special') && (normalizedInput.includes('barber') || normalizedInput.includes('stylist'))) {
      setMessages(prev => [...prev, {
        id: uuidv4(),
        sender: 'bot',
        text: formatBarberSpecializationsResponse(),
        timestamp: new Date()
      }]);
      setIsTyping(false);
      return;
    }
    
    // Handle general barber inquiries
    if (normalizedInput.includes('barber') || normalizedInput.includes('stylist')) {
      // Check if asking about a specific barber
      const specificBarberMatch = normalizedInput.match(/(?:about|who is|tell me about)\s+([^?.,]+)(?:\?|$|\.)/);
      if (specificBarberMatch && !normalizedInput.includes('your barbers')) {
        const barberName = specificBarberMatch[1].trim();
        if (barberName && !['barber', 'barbers', 'stylist', 'stylists'].includes(barberName)) {
          const barberDetails = formatBarberDetails(barberName);
          setMessages(prev => [...prev, {
        id: uuidv4(),
        sender: 'bot',
            text: barberDetails,
        timestamp: new Date()
      }]);
        } else {
          setMessages(prev => [...prev, {
            id: uuidv4(),
            sender: 'bot',
            text: formatBarbersResponse(),
            timestamp: new Date()
          }]);
    } 
      } else {
        // General barber inquiry
        setMessages(prev => [...prev, {
        id: uuidv4(),
        sender: 'bot',
        text: formatBarbersResponse(),
        timestamp: new Date()
      }]);
      }
      setIsTyping(false);
      return;
    }

    // Handle location inquiries
    if (normalizedInput.includes('location') || normalizedInput.includes('address') || normalizedInput.includes('where')) {
      setMessages(prev => [...prev, {
        id: uuidv4(),
        sender: 'bot',
        text: formatLocationResponse(),
        timestamp: new Date()
      }]);
      setIsTyping(false);
      return;
    }

    // Handle hours inquiries
    if (normalizedInput.includes('hour') || normalizedInput.includes('open') || normalizedInput.includes('close')) {
      if (normalizedInput.includes('today')) {
        const todaysHours = getTodaysHours();
        setMessages(prev => [...prev, {
          id: uuidv4(),
          sender: 'bot',
          text: todaysHours || "I'm sorry, I couldn't get today's hours.",
          timestamp: new Date()
        }]);
      } else {
        setMessages(prev => [...prev, {
        id: uuidv4(),
        sender: 'bot',
        text: formatHoursResponse(),
        timestamp: new Date()
      }]);
      }
      setIsTyping(false);
      return;
    }

    // Handle promotion inquiries
    if (normalizedInput.includes('promotion') || normalizedInput.includes('deal') || normalizedInput.includes('special') || normalizedInput.includes('discount')) {
      setMessages(prev => [...prev, {
        id: uuidv4(),
        sender: 'bot',
        text: formatPromotionsResponse(),
        timestamp: new Date()
      }]);
      setIsTyping(false);
      return;
    }

    // Handle "yes" responses based on context
    if (normalizedInput === 'yes') {
      if (conversationContext === 'service_info') {
        // Start booking flow
        setBookingState({ step: 'service', data: {} });
        setMessages(prev => [...prev, {
          id: uuidv4(),
          sender: 'bot',
          text: "I'll help you book an appointment. Which service would you like?\n\n" + formatServicesResponse(),
          timestamp: new Date()
        }]);
        setConversationContext(null);
        setIsTyping(false);
        return;
      }
    }

    // Check FAQs (only if no other context matches)
    const faqResponse = formatFAQResponse(normalizedInput);
    if (faqResponse && !conversationContext) {
      setMessages(prev => [...prev, {
        id: uuidv4(),
        sender: 'bot',
        text: faqResponse,
        timestamp: new Date()
      }]);
      setIsTyping(false);
      return;
    }

    // Default response
    setMessages(prev => [...prev, {
        id: uuidv4(),
        sender: 'bot',
      text: "I can help you with:\n\n" +
            "• Booking appointments\n" +
            "• Information about our services\n" +
            "• Our barbers and their specializations\n" +
            "• Different hairstyles and recommendations\n" +
            "• Location and hours\n" +
            "• Current promotions\n" +
            "• Frequently asked questions\n\n" +
            "How can I assist you today?",
        timestamp: new Date()
      }]);
    setIsTyping(false);
  }, [
    bookingState,
    messages,
    services,
    barbers,
    styleCategories,
    handleBookingFlow,
    setMessages,
    setBookingState,
    formatBookingResponse,
    formatServicesResponse,
    findServiceInfo,
    findStyleCategoryInfo,
    formatBarbersResponse,
    formatBarberDetails,
    formatBarberSpecializationsResponse,
    formatLocationResponse,
    formatHoursResponse,
    formatPromotionsResponse,
    getTodaysHours,
    formatFAQResponse,
    setIsTyping,
    conversationContext
  ]);

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
    
    // Process the message after a short delay
    setTimeout(() => {
      processUserInput(userMessage.text);
    }, 1000);
  }, [input, processUserInput, setMessages, setInput, setIsTyping]);

  // Add this new helper function near the top of the file, after the imports
  const handleDateSelection = async (dateInput: string, barberId: string) => {
    const normalizedDateInput = dateInput.trim().toLowerCase();
    let selectedDate: string;

    try {
      let parsedDate: Date | null = null;

      // Handle relative dates
      if (normalizedDateInput === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        parsedDate = new Date(Date.UTC(
          tomorrow.getFullYear(),
          tomorrow.getMonth(),
          tomorrow.getDate()
        ));
      } 
      else if (normalizedDateInput === 'today') {
        const today = new Date();
        parsedDate = new Date(Date.UTC(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        ));
      }
      else if (normalizedDateInput.includes('next')) {
        const dayMatch = normalizedDateInput.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
        if (dayMatch) {
          const targetDay = dayMatch[1].toLowerCase();
          const daysMap: { [key: string]: number } = {
            'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
            'thursday': 4, 'friday': 5, 'saturday': 6
          };
          const targetDayNum = daysMap[targetDay];
          const today = new Date();
          const currentDay = today.getDay();
          let daysToAdd = targetDayNum - currentDay;
          if (daysToAdd <= 0) daysToAdd += 7;
          today.setDate(today.getDate() + daysToAdd);
          parsedDate = new Date(Date.UTC(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          ));
        }
      }
      else if (normalizedDateInput.match(/^in\s+(\d+)\s+days?$/)) {
        const daysMatch = normalizedDateInput.match(/^in\s+(\d+)\s+days?$/);
        const daysToAdd = parseInt(daysMatch![1]);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysToAdd);
        parsedDate = new Date(Date.UTC(
          futureDate.getFullYear(),
          futureDate.getMonth(),
          futureDate.getDate()
        ));
      }
      else if (normalizedDateInput.match(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/)) {
        const targetDay = normalizedDateInput;
        const daysMap: { [key: string]: number } = {
          'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
          'thursday': 4, 'friday': 5, 'saturday': 6
        };
        const targetDayNum = daysMap[targetDay];
        const today = new Date();
        const currentDay = today.getDay();
        let daysToAdd = targetDayNum - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7;
        today.setDate(today.getDate() + daysToAdd);
        parsedDate = new Date(Date.UTC(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        ));
      }
      // Handle numeric formats (25/5, 25-5, etc.)
      else {
        const cleanInput = normalizedDateInput.replace(/[^\d/-]/g, '');
        
        if (cleanInput.match(/^\d{1,2}[-/]\d{1,2}$/)) {
          const parts = cleanInput.split(/[-/]/);
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          const currentYear = new Date().getFullYear();
          
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            parsedDate = new Date(Date.UTC(currentYear, month - 1, day));
            
            if (parsedDate.getUTCMonth() !== month - 1 || parsedDate.getUTCDate() !== day) {
              throw new Error('Invalid date for the specified month');
            }
          } else {
            throw new Error('Invalid day or month');
          }
        }
      }

      if (!parsedDate || isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date format');
      }

      // Check if date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsedDate < today) {
        throw new Error('Cannot book appointments in the past');
      }

      selectedDate = parsedDate.toISOString().split('T')[0];

      // First check if the barber is working on this day
      const barberSchedule = await checkBarberWorkingDay(barberId, selectedDate);
      if (!barberSchedule.isWorking) {
        setMessages(prev => [...prev, {
          id: uuidv4(),
          sender: 'bot',
          text: `I'm sorry, but the selected barber is not available on ${barberSchedule.dayName}s. Please choose another date.`,
          timestamp: new Date()
        }]);
        return;
      }

      // Check barber availability
      const timeSlots = await checkBarberAvailability(barberId, selectedDate);
      if (!timeSlots || timeSlots.length === 0) {
        setMessages(prev => [...prev, {
          id: uuidv4(),
          sender: 'bot',
          text: "I'm sorry, but there are no available slots for that date. Please choose another date.",
          timestamp: new Date()
        }]);
        return;
      }

      setBookingState(prev => ({
        step: 'time',
        data: { ...prev.data, date: selectedDate }
      }));

      const availableTimes = timeSlots
        .filter(slot => slot.available)
        .map(slot => slot.time)
        .join('\n');

      const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
      });

      setMessages(prev => [...prev, {
        id: uuidv4(),
        sender: 'bot',
        text: `Great! Here are the available times for ${formattedDate}:\n\n${availableTimes}\n\nPlease choose a time from the list above.`,
        timestamp: new Date()
      }]);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: uuidv4(),
        sender: 'bot',
        text: "I couldn't understand that date. You can use:\n" +
              "• Month and day like 'may 25' or 'may 25th'\n" +
              "• Simple dates like '25/5' or '25-5'\n" +
              "• Days like 'monday' or 'next tuesday'\n" +
              "• Quick options like 'tomorrow' or 'in 3 days'",
        timestamp: new Date()
      }]);
    }
  };

  return {
    // State and setters
    isOpen,
    setIsOpen,
    input,
    setInput,
    messages,
    setMessages,
    isTyping,
    setIsTyping,
    isLoading,
    dataInitialized,

    // Actions
    handleSend,
    navigateToBooking,

    // Data
    services,
    barbers,
    barberSpecializations,
    faqs,
    promotions,
    locations,
    workingHours,
    styleCategories,

    // Context and booking state
    conversationContext,
    bookingState,

    // Formatters
    formatServicesResponse,
    formatBarbersResponse,
    formatBarberDetails,
    formatLocationResponse,
    formatHoursResponse,
    formatPromotionsResponse,
    getTodaysHours,
    formatFAQResponse,
    formatBarberSpecializationsResponse
  };
}