import { createClient } from '@supabase/supabase-js';

// Hard-coded Supabase credentials as fallback
const SUPABASE_URL = "https://zkdglqmguhyyxcmqvwhr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprZGdscW1ndWh5eXhjbXF2d2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3Nzk3MDIsImV4cCI6MjA2MzM1NTcwMn0.9mzbiLC2zOcN5gSLl_4WC1Fh8kCftAF4Eg0f1PbqvbM";

// Get the Supabase URL and anonymous key from environment variables with fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

// Log information to help debug (only in development)
if (import.meta.env.DEV) {
  console.log('Supabase URL available:', !!supabaseUrl);
  console.log('Supabase Key available:', !!supabaseAnonKey);
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface DbService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  created_at: string;
}

export interface DbBarber {
  id: string;
  name: string;
  bio: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
}

export interface DbAppointment {
  id: string;
  customer_name: string;
  customer_email: string;
  service_id: string;
  barber_id: string;
  appointment_time: string;
  date: string;
  start_time: string;
  duration_minutes: number;
  notes: string;
  created_at: string;
}

export interface DbFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface DbPromotion {
  id: string;
  title: string;
  details: string;
  valid_until: string;
}

// New interfaces for location and working hours
export interface DbLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
}

export interface DbWorkingHours {
  id: string;
  day_of_week: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

// New interfaces for the additional tables
export interface DbBarberSpecialization {
  id: string;
  barber_id: string;
  specialization: string;
  expertise_level: 'Beginner' | 'Intermediate' | 'Expert';
  created_at: string;
}

export interface DbBarberAvailability {
  id: string;
  barber_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_emergency_slot: boolean;
  created_at: string;
}

export interface DbCustomerPreference {
  id: string;
  customer_email: string;
  preferred_barber_id: string;
  preferred_style: string;
  preferred_time_slot: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface DbProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  is_available: boolean;
  created_at: string;
}

export interface DbGiftCard {
  id: string;
  card_number: string;
  amount: number;
  is_active: boolean;
  issued_date: string;
  expiry_date: string;
  redeemed_amount: number;
  created_at: string;
}

export interface DbGroupBooking {
  id: string;
  group_leader_email: string;
  group_size: number;
  preferred_date: string;
  preferred_time_slot: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  special_requests: string;
  created_at: string;
}

export interface DbWaitlist {
  id: string;
  customer_name: string;
  customer_phone: string;
  service_id: string;
  preferred_barber_id: string;
  waitlist_time: string;
  estimated_wait_time: number;
  status: 'Waiting' | 'Notified' | 'Seated' | 'Cancelled';
  created_at: string;
}

export interface DbBarberRating {
  id: string;
  barber_id: string;
  customer_email: string;
  rating: number;
  review: string;
  style_category: string;
  created_at: string;
}

export interface DbStyleCategory {
  id: string;
  name: string;
  description: string;
  difficulty_level: 'Easy' | 'Medium' | 'Hard';
  maintenance_level: 'Low' | 'Medium' | 'High';
  created_at: string;
}

export interface DbEmergencySlot {
  id: string;
  barber_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  priority_level: number;
  created_at: string;
}

// Helper functions for database operations
export const fetchServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*');
  
  if (error) {
    console.error('Error fetching services:', error);
    return null;
  }
  
  return data as DbService[];
};

export const fetchBarbers = async () => {
  const { data, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching barbers:', error);
    return null;
  }
  
  return data as DbBarber[];
};

export const fetchFAQs = async () => {
  const { data, error } = await supabase
    .from('faqs')
    .select('*');
  
  if (error) {
    console.error('Error fetching FAQs:', error);
    return null;
  }
  
  return data as DbFAQ[];
};

export const fetchPromotions = async () => {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .gte('valid_until', new Date().toISOString());
  
  if (error) {
    console.error('Error fetching promotions:', error);
    return null;
  }
  
  return data as DbPromotion[];
};

// New function to fetch location data
export const fetchLocations = async () => {
  const { data, error } = await supabase
    .from('barbershop_locations')
    .select('*');
  
  if (error) {
    console.error('Error fetching locations:', error);
    return null;
  }
  
  return data as DbLocation[];
};

// New function to fetch working hours
export const fetchWorkingHours = async () => {
  const { data, error } = await supabase
    .from('working_hours')
    .select('*')
    .order('id');
  
  if (error) {
    console.error('Error fetching working hours:', error);
    return null;
  }
  
  return data as DbWorkingHours[];
};

export const createAppointment = async (appointment: Omit<DbAppointment, 'id' | 'created_at'>) => {
  // Log the appointment data being sent
  if (import.meta.env.DEV) {
    console.log('Creating appointment with data:', appointment);
  }

  // Extract the time from appointment_time for start_time
  const appointmentDate = new Date(appointment.appointment_time);
  const startTime = appointmentDate.toTimeString().split(' ')[0]; // Gets HH:MM:SS

  // Get the service duration
  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', appointment.service_id)
    .single();

  if (!service) {
    console.error('Service not found:', appointment.service_id);
    return { 
      success: false, 
      error: { 
        message: 'Selected service not found',
        code: 'SERVICE_NOT_FOUND'
      } 
    };
  }

  const appointmentData = {
    ...appointment,
    start_time: startTime,
    duration_minutes: service.duration_minutes
  };

  const { data, error } = await supabase
    .from('appointments')
    .insert([appointmentData])
    .select();
  
  if (error) {
    console.error('Error creating appointment:', {
      error,
      errorCode: error.code,
      errorMessage: error.message,
      errorDetails: error.details,
      errorHint: error.hint,
      data: appointmentData
    });
    return { success: false, error };
  }
  
  return { success: true, data };
};

export const checkBarberAvailability = async (
  barberId: string,
  date: string
): Promise<Array<{ time: string; available: boolean }>> => {
  try {
    // Get the start and end of the day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    // Get all appointments for the barber on that day
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('appointment_time, duration_minutes')
      .eq('barber_id', barberId)
      .gte('appointment_time', startDate.toISOString())
      .lte('appointment_time', endDate.toISOString());
    
    if (error) {
      console.error('Error checking availability:', error);
      return [];
    }
    
    // Generate all possible time slots
    const dayOfWeek = startDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const startHour = isWeekend ? 10 : 9;
    const endHour = isWeekend ? (dayOfWeek === 0 ? 16 : 18) : 19;
    
    const timeSlots: Array<{ time: string; available: boolean }> = [];
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDate = new Date(startDate);
        slotDate.setHours(hour, minute, 0, 0);
        
        // Check if this slot conflicts with any existing appointment
        const isBooked = appointments?.some(apt => {
          const aptTime = new Date(apt.appointment_time);
          const aptEnd = new Date(aptTime.getTime() + (apt.duration_minutes || 30) * 60000);
          const slotEnd = new Date(slotDate.getTime() + 30 * 60000); // Assume 30-minute slots
          
          return (
            (slotDate >= aptTime && slotDate < aptEnd) ||
            (slotEnd > aptTime && slotEnd <= aptEnd) ||
            (slotDate <= aptTime && slotEnd >= aptEnd)
          );
        });
        
        timeSlots.push({
          time: timeString,
          available: !isBooked
        });
      }
    }
    
    return timeSlots;
  } catch (error) {
    console.error('Error in checkBarberAvailability:', error);
    return [];
  }
};

export const fetchBarberSpecializations = async (barberId?: string) => {
  let query = supabase
    .from('barber_specializations')
    .select('*');
  
  if (barberId) {
    query = query.eq('barber_id', barberId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching barber specializations:', error);
    return null;
  }
  
  return data as DbBarberSpecialization[];
};

export const fetchBarberAvailability = async (barberId: string, date: string) => {
  const { data, error } = await supabase
    .from('barber_availability')
    .select('*')
    .eq('barber_id', barberId)
    .eq('date', date)
    .eq('is_available', true);
  
  if (error) {
    console.error('Error fetching barber availability:', error);
    return null;
  }
  
  return data as DbBarberAvailability[];
};

export const fetchCustomerPreferences = async (email: string) => {
  const { data, error } = await supabase
    .from('customer_preferences')
    .select('*')
    .eq('customer_email', email)
    .single();
  
  if (error) {
    console.error('Error fetching customer preferences:', error);
    return null;
  }
  
  return data as DbCustomerPreference;
};

export const updateCustomerPreferences = async (preferences: Partial<DbCustomerPreference>) => {
  const { data, error } = await supabase
    .from('customer_preferences')
    .upsert({
      ...preferences,
      updated_at: new Date().toISOString()
    })
    .select();
  
  if (error) {
    console.error('Error updating customer preferences:', error);
    return null;
  }
  
  return data[0] as DbCustomerPreference;
};

export const fetchProducts = async (category?: string) => {
  let query = supabase
    .from('product_inventory')
    .select('*')
    .eq('is_available', true);
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching products:', error);
    return null;
  }
  
  return data as DbProduct[];
};

export const createGiftCard = async (amount: number) => {
  const cardNumber = generateGiftCardNumber();
  
  const { data, error } = await supabase
    .from('gift_cards')
    .insert([{
      card_number: cardNumber,
      amount,
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year expiry
    }])
    .select();
  
  if (error) {
    console.error('Error creating gift card:', error);
    return null;
  }
  
  return data[0] as DbGiftCard;
};

export const createGroupBooking = async (booking: Omit<DbGroupBooking, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('group_bookings')
    .insert([booking])
    .select();
  
  if (error) {
    console.error('Error creating group booking:', error);
    return null;
  }
  
  return data[0] as DbGroupBooking;
};

export const joinWaitlist = async (waitlistEntry: Omit<DbWaitlist, 'id' | 'created_at' | 'waitlist_time' | 'status'>) => {
  const { data, error } = await supabase
    .from('waitlist')
    .insert([{
      ...waitlistEntry,
      status: 'Waiting',
      waitlist_time: new Date().toISOString()
    }])
    .select();
  
  if (error) {
    console.error('Error joining waitlist:', error);
    return null;
  }
  
  return data[0] as DbWaitlist;
};

export const submitBarberRating = async (rating: Omit<DbBarberRating, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('barber_ratings')
    .insert([rating])
    .select();
  
  if (error) {
    console.error('Error submitting barber rating:', error);
    return null;
  }
  
  return data[0] as DbBarberRating;
};

export const fetchStyleCategories = async () => {
  const { data, error } = await supabase
    .from('style_categories')
    .select('*');
  
  if (error) {
    console.error('Error fetching style categories:', error);
    return null;
  }
  
  return data as DbStyleCategory[];
};

export const requestEmergencySlot = async (slot: Omit<DbEmergencySlot, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('emergency_slots')
    .insert([slot])
    .select();
  
  if (error) {
    console.error('Error requesting emergency slot:', error);
    return null;
  }
  
  return data[0] as DbEmergencySlot;
};

// Helper function to generate gift card numbers
const generateGiftCardNumber = () => {
  const prefix = 'GC';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
};

export const checkBarberWorkingDay = async (
  barberId: string,
  date: string
): Promise<{ isWorking: boolean; dayName: string }> => {
  try {
    const dayOfWeek = new Date(date).getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const { data, error } = await supabase
      .from('barber_schedules')
      .select('is_working')
      .eq('barber_id', barberId)
      .eq('day_of_week', dayOfWeek)
      .single();
    
    if (error) {
      console.error('Error checking barber schedule:', error);
      return { isWorking: true, dayName: getDayName(dayOfWeek) }; // Default to true if error
    }
    
    return {
      isWorking: data?.is_working ?? true, // Default to true if no schedule found
      dayName: getDayName(dayOfWeek)
    };
  } catch (error) {
    console.error('Error in checkBarberWorkingDay:', error);
    return { isWorking: true, dayName: getDayName(new Date(date).getDay()) };
  }
};

const getDayName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
};
