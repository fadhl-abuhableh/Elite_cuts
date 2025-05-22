import express from 'express';
import cors from 'cors';
import { supabase } from '../lib/supabase';
import { 
  DbService, 
  DbBarber, 
  DbAppointment, 
  DbBarberRating,
  DbBarberSpecialization,
  DbBarberAvailability,
  DbCustomerPreference,
  DbProduct,
  DbGiftCard,
  DbGroupBooking,
  DbWaitlist,
  DbStyleCategory,
  DbEmergencySlot
} from '../lib/supabase';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Services endpoints
app.get('/api/services', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*');
    
    if (error) throw error;
    res.json(data as DbService[]);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Barbers endpoints
app.get('/api/barbers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('barbers')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    res.json(data as DbBarber[]);
  } catch (error) {
    console.error('Error fetching barbers:', error);
    res.status(500).json({ error: 'Failed to fetch barbers' });
  }
});

// Appointments endpoints
app.post('/api/appointments', async (req, res) => {
  try {
    const appointment = req.body;
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select();
    
    if (error) throw error;
    res.json(data[0] as DbAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

app.get('/api/appointments/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('customer_email', email);
    
    if (error) throw error;
    res.json(data as DbAppointment[]);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Barber ratings endpoints
app.get('/api/barbers/:barberId/ratings', async (req, res) => {
  try {
    const { barberId } = req.params;
    const { data, error } = await supabase
      .from('barber_ratings')
      .select('*')
      .eq('barber_id', barberId);
    
    if (error) throw error;
    res.json(data as DbBarberRating[]);
  } catch (error) {
    console.error('Error fetching barber ratings:', error);
    res.status(500).json({ error: 'Failed to fetch barber ratings' });
  }
});

app.post('/api/barbers/:barberId/ratings', async (req, res) => {
  try {
    const { barberId } = req.params;
    const rating = { ...req.body, barber_id: barberId };
    const { data, error } = await supabase
      .from('barber_ratings')
      .insert([rating])
      .select();
    
    if (error) throw error;
    res.json(data[0] as DbBarberRating);
  } catch (error) {
    console.error('Error creating barber rating:', error);
    res.status(500).json({ error: 'Failed to create barber rating' });
  }
});

// Barber availability endpoints
app.get('/api/barbers/:barberId/availability', async (req, res) => {
  try {
    const { barberId } = req.params;
    const { date } = req.query;
    
    const { data, error } = await supabase
      .from('barber_availability')
      .select('*')
      .eq('barber_id', barberId)
      .eq('date', date)
      .eq('is_available', true);
    
    if (error) throw error;
    res.json(data as DbBarberAvailability[]);
  } catch (error) {
    console.error('Error fetching barber availability:', error);
    res.status(500).json({ error: 'Failed to fetch barber availability' });
  }
});

// Customer preferences endpoints
app.get('/api/customers/:email/preferences', async (req, res) => {
  try {
    const { email } = req.params;
    const { data, error } = await supabase
      .from('customer_preferences')
      .select('*')
      .eq('customer_email', email)
      .single();
    
    if (error) throw error;
    res.json(data as DbCustomerPreference);
  } catch (error) {
    console.error('Error fetching customer preferences:', error);
    res.status(500).json({ error: 'Failed to fetch customer preferences' });
  }
});

app.post('/api/customers/:email/preferences', async (req, res) => {
  try {
    const { email } = req.params;
    const preferences = { ...req.body, customer_email: email };
    const { data, error } = await supabase
      .from('customer_preferences')
      .upsert(preferences)
      .select();
    
    if (error) throw error;
    res.json(data[0] as DbCustomerPreference);
  } catch (error) {
    console.error('Error updating customer preferences:', error);
    res.status(500).json({ error: 'Failed to update customer preferences' });
  }
});

// Products endpoints
app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    let query = supabase
      .from('product_inventory')
      .select('*')
      .eq('is_available', true);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    res.json(data as DbProduct[]);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Gift cards endpoints
app.post('/api/gift-cards', async (req, res) => {
  try {
    const { amount } = req.body;
    const cardNumber = generateGiftCardNumber();
    
    const { data, error } = await supabase
      .from('gift_cards')
      .insert([{
        card_number: cardNumber,
        amount,
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }])
      .select();
    
    if (error) throw error;
    res.json(data[0] as DbGiftCard);
  } catch (error) {
    console.error('Error creating gift card:', error);
    res.status(500).json({ error: 'Failed to create gift card' });
  }
});

// Group bookings endpoints
app.post('/api/group-bookings', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('group_bookings')
      .insert([req.body])
      .select();
    
    if (error) throw error;
    res.json(data[0] as DbGroupBooking);
  } catch (error) {
    console.error('Error creating group booking:', error);
    res.status(500).json({ error: 'Failed to create group booking' });
  }
});

// Waitlist endpoints
app.post('/api/waitlist', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{
        ...req.body,
        status: 'Waiting',
        waitlist_time: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    res.json(data[0] as DbWaitlist);
  } catch (error) {
    console.error('Error joining waitlist:', error);
    res.status(500).json({ error: 'Failed to join waitlist' });
  }
});

// Emergency slots endpoints
app.post('/api/emergency-slots', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('emergency_slots')
      .insert([req.body])
      .select();
    
    if (error) throw error;
    res.json(data[0] as DbEmergencySlot);
  } catch (error) {
    console.error('Error requesting emergency slot:', error);
    res.status(500).json({ error: 'Failed to request emergency slot' });
  }
});

// Helper function to generate gift card numbers
function generateGiftCardNumber(): string {
  const prefix = 'GC';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
}

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 