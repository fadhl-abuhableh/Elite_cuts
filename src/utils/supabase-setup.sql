
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Services Table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  duration_minutes INT,
  created_at TIMESTAMP DEFAULT now()
);

-- Barbers Table
CREATE TABLE IF NOT EXISTS barbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now()
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  service_id UUID REFERENCES services(id),
  barber_id UUID REFERENCES barbers(id),
  appointment_time TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT
);

-- Promotions Table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  details TEXT,
  valid_until DATE
);

-- Insert sample data for Services
INSERT INTO services (name, description, price, duration_minutes) VALUES
('Classic Haircut', 'Our signature haircut includes a consultation, shampoo, cut, and style.', 35.00, 45),
('Beard Trim', 'Professional beard shaping and maintenance.', 20.00, 20),
('Hot Towel Shave', 'Traditional straight razor shave with hot towel treatment.', 45.00, 40),
('Haircut & Beard Combo', 'Full haircut service combined with beard shaping and detailing.', 50.00, 60),
('Kid''s Haircut', 'Haircut for children under 12.', 25.00, 30),
('Hair Coloring', 'Professional hair coloring service.', 65.00, 90),
('Hair & Scalp Treatment', 'Revitalizing scalp treatment with premium products.', 40.00, 35);

-- Insert sample data for Barbers
INSERT INTO barbers (name, bio, image_url, is_active) VALUES
('James Wilson', 'Master barber with over 15 years of experience specializing in classic cuts.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80', TRUE),
('Michael Rodriguez', 'Style expert who excels in modern trends and precision fades.', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80', TRUE),
('David Thompson', 'Beard specialist with a passion for traditional barbering techniques.', 'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-1.2.1&auto=format&fit=crop&w=344&q=80', TRUE),
('Robert Jackson', 'Expert in hair coloring and contemporary styles.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80', TRUE);

-- Insert sample data for FAQs
INSERT INTO faqs (question, answer, category) VALUES
('What are your operating hours?', 'We are open Monday to Friday from 9:00 AM to 7:00 PM, Saturday from 10:00 AM to 6:00 PM, and Sunday from 10:00 AM to 4:00 PM.', 'General'),
('Do I need to make an appointment?', 'While we welcome walk-ins, we recommend booking an appointment to ensure you get your preferred time and barber.', 'Booking'),
('What forms of payment do you accept?', 'We accept all major credit cards, cash, Apple Pay, and Google Pay.', 'Payment'),
('How early should I arrive for my appointment?', 'We recommend arriving 5-10 minutes before your scheduled appointment time to ensure a smooth check-in process.', 'Booking'),
('Do you offer gift cards?', 'Yes, we offer gift cards in various denominations which can be purchased in-store or online.', 'Services'),
('What''s your cancellation policy?', 'We request at least 24 hours notice for cancellations. Late cancellations or no-shows may be subject to a fee.', 'Booking'),
('Do you sell grooming products?', 'Yes, we carry a selection of premium grooming products that our barbers use and recommend.', 'Products'),
('Is parking available?', 'Yes, we have free parking available in front of our shop and additional street parking nearby.', 'Location');

-- Insert sample data for Promotions
INSERT INTO promotions (title, details, valid_until) VALUES
('New Client Special', 'First-time clients receive 20% off any service.', '2025-12-31'),
('Refer a Friend', 'Refer a friend and you both receive $10 off your next service.', '2025-12-31'),
('Tuesday Senior Discount', 'Clients over 65 receive 15% off any service every Tuesday.', '2025-12-31'),
('Father-Son Package', 'Book a haircut for you and your son and save 10% on the total.', '2025-09-30');

-- Enable Row Level Security (RLS)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read-only)
CREATE POLICY "Allow public read access for services" ON services 
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access for barbers" ON barbers 
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access for faqs" ON faqs 
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access for promotions" ON promotions 
  FOR SELECT USING (true);

-- Create policies for appointments
CREATE POLICY "Allow anonymous insert to appointments" ON appointments 
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Allow users to view their own appointments" ON appointments 
  FOR SELECT USING (true);
