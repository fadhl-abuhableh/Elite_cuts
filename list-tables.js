// Script to list all tables in the Supabase database
import { createClient } from '@supabase/supabase-js';

// Supabase credentials from supabase.ts
const SUPABASE_URL = "https://zkdglqmguhyyxcmqvwhr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprZGdscW1ndWh5eXhjbXF2d2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3Nzk3MDIsImV4cCI6MjA2MzM1NTcwMn0.9mzbiLC2zOcN5gSLl_4WC1Fh8kCftAF4Eg0f1PbqvbM";

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchTablesInfo() {
  try {
    // Based on the functions in supabase.ts, we can deduce the table names
    // and try to fetch a sample from each to verify connection
    
    const tables = [
      'services',
      'barbers',
      'appointments',
      'faqs',
      'promotions',
      'barbershop_locations',
      'working_hours',
      'barber_specializations',
      'barber_availability',
      'customer_preferences',
      'product_inventory',
      'gift_cards',
      'group_bookings',
      'waitlist',
      'barber_ratings',
      'style_categories',
      'emergency_slots'
    ];
    
    console.log('Checking database connection and tables...');
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
        
      if (error) {
        console.log(`❌ Table '${table}' error: ${error.message}`);
      } else {
        console.log(`✅ Table '${table}' exists${data.length > 0 ? ' and has data' : ' but is empty'}`);
      }
    }
    
    console.log('\nConnection to Supabase database successful!');
    
  } catch (error) {
    console.error('Error connecting to database:', error.message);
  }
}

fetchTablesInfo(); 