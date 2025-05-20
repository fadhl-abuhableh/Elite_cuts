
import { createClient } from '@supabase/supabase-js';

// These should ideally come from environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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

export const createAppointment = async (appointment: Omit<DbAppointment, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointment])
    .select();
  
  if (error) {
    console.error('Error creating appointment:', error);
    return { success: false, error };
  }
  
  return { success: true, data };
};

export const checkBarberAvailability = async (
  barberId: string,
  date: string
) => {
  // Get the start and end of the day
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  // Get all appointments for the barber on that day
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('barber_id', barberId)
    .gte('appointment_time', startDate.toISOString())
    .lte('appointment_time', endDate.toISOString());
  
  if (error) {
    console.error('Error checking availability:', error);
    return null;
  }
  
  // Generate all possible time slots
  const dayOfWeek = startDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const startHour = isWeekend ? 10 : 9;
  const endHour = isWeekend ? (dayOfWeek === 0 ? 16 : 18) : 19;
  
  const timeSlots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const slotDate = new Date(startDate);
      slotDate.setHours(hour, minute, 0, 0);
      
      // Check if this slot conflicts with any existing appointment
      const isBooked = appointments?.some(apt => {
        const aptTime = new Date(apt.appointment_time);
        // Assuming appointments are 30 minutes
        return Math.abs(aptTime.getTime() - slotDate.getTime()) < 30 * 60 * 1000;
      });
      
      timeSlots.push({
        time: timeString,
        available: !isBooked
      });
    }
  }
  
  return timeSlots;
};
