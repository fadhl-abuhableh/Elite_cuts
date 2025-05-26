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
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Add new columns to existing appointments table if they don't exist
DO $$ 
BEGIN
  -- Add date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    AND column_name = 'date'
  ) THEN
    ALTER TABLE appointments ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;

  -- Add start_time column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    AND column_name = 'start_time'
  ) THEN
    ALTER TABLE appointments ADD COLUMN start_time TIME NOT NULL DEFAULT '09:00:00';
  END IF;

  -- Add duration_minutes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    AND column_name = 'duration_minutes'
  ) THEN
    ALTER TABLE appointments ADD COLUMN duration_minutes INT NOT NULL DEFAULT 30;
  END IF;
END $$;

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

-- Create barbershop_locations table
CREATE TABLE IF NOT EXISTS public.barbershop_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default location
INSERT INTO public.barbershop_locations (address, city, state, phone, email)
VALUES (
    'Bağdat Cad. No:105/B',
    'Kadıköy',
    'Istanbul',
    '+90 (216) 555-7890',
    'info@elitecuts.com'
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
('Michael Brown', 'Style expert who excels in modern trends and precision fades.', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80', TRUE),
('David Kim', 'Beard specialist with a passion for traditional barbering techniques.', 'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-1.2.1&auto=format&fit=crop&w=344&q=80', TRUE),
('Robert Chen', 'Expert in hair coloring and contemporary styles.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80', TRUE);

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

-- Barber Specializations Table
CREATE TABLE IF NOT EXISTS barber_specializations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barber_id UUID REFERENCES barbers(id),
    specialization TEXT NOT NULL,
    expertise_level TEXT NOT NULL CHECK (expertise_level IN ('Beginner', 'Intermediate', 'Expert')),
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(barber_id, specialization)
);

-- Insert sample specializations
INSERT INTO barber_specializations (barber_id, specialization, expertise_level)
SELECT 
    b.id,
    unnest(ARRAY['Classic Cuts', 'Modern Fades', 'Beard Grooming', 'Traditional Shaves']),
    'Expert'
FROM barbers b
WHERE b.name = 'James Wilson';

INSERT INTO barber_specializations (barber_id, specialization, expertise_level)
SELECT 
    b.id,
    unnest(ARRAY['Modern Fades', 'Textured Styles', 'Hair Coloring']),
    'Expert'
FROM barbers b
WHERE b.name = 'Michael Brown';

-- Insert more barber specializations
INSERT INTO barber_specializations (barber_id, specialization, expertise_level)
SELECT 
    b.id,
    unnest(ARRAY['Beard Styling', 'Traditional Cuts', 'Hair Coloring']),
    'Expert'
FROM barbers b
WHERE b.name = 'David Kim';

INSERT INTO barber_specializations (barber_id, specialization, expertise_level)
SELECT 
    b.id,
    unnest(ARRAY['Hair Coloring', 'Modern Styles', 'Beard Design']),
    'Expert'
FROM barbers b
WHERE b.name = 'Robert Chen';

-- Barber Availability Table
CREATE TABLE IF NOT EXISTS barber_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barber_id UUID REFERENCES barbers(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    is_emergency_slot BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(barber_id, date, start_time)
);

-- Insert barber availability for the next 7 days
INSERT INTO barber_availability (barber_id, date, start_time, end_time, is_available, is_emergency_slot)
SELECT 
    b.id,
    CURRENT_DATE + i,
    '09:00:00',
    '17:00:00',
    true,
    false
FROM barbers b
CROSS JOIN generate_series(0, 6) i
WHERE b.is_active = true;

-- Customer Preferences Table
CREATE TABLE IF NOT EXISTS customer_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_email TEXT NOT NULL,
    preferred_barber_id UUID REFERENCES barbers(id),
    preferred_style TEXT,
    preferred_time_slot TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Insert sample customer preferences
INSERT INTO customer_preferences (customer_email, preferred_barber_id, preferred_style, preferred_time_slot, notes) VALUES
('john.doe@email.com', (SELECT id FROM barbers WHERE name = 'James Wilson'), 'Classic Cut', 'Morning', 'Prefers early appointments'),
('mike.smith@email.com', (SELECT id FROM barbers WHERE name = 'Michael Brown'), 'Modern Fade', 'Afternoon', 'Likes to book 2 weeks in advance'),
('ryan.cooper@email.com', (SELECT id FROM barbers WHERE name = 'David Kim'), 'Beard Styling', 'Evening', 'Prefers last appointment of the day'),
('steve.wilson@email.com', (SELECT id FROM barbers WHERE name = 'Robert Chen'), 'Hair Coloring', 'Morning', 'Allergic to certain hair products'),
('chris.martin@email.com', (SELECT id FROM barbers WHERE name = 'James Wilson'), 'Traditional Shaves', 'Afternoon', 'Regular monthly appointment');

-- Product Inventory Table
CREATE TABLE IF NOT EXISTS product_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category TEXT NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);

-- Insert more products
INSERT INTO product_inventory (name, description, price, category, stock_quantity) VALUES
('Premium Hair Gel', 'Strong hold gel with natural shine', 18.99, 'Styling Products', 45),
('Beard Balm', 'All-natural beard balm with shea butter', 22.99, 'Beard Care', 25),
('Hair Clay', 'Matte finish clay for textured styles', 26.99, 'Styling Products', 30),
('Shaving Brush', 'Premium badger hair shaving brush', 34.99, 'Shaving', 20),
('Hair Spray', 'Strong hold hair spray for all styles', 16.99, 'Styling Products', 40),
('Beard Shampoo', 'Gentle beard cleansing shampoo', 19.99, 'Beard Care', 35),
('Styling Cream', 'Light hold cream for natural styles', 21.99, 'Styling Products', 30),
('Aftershave Balm', 'Soothing aftershave balm with aloe', 24.99, 'Shaving', 25);

-- Gift Cards Table
CREATE TABLE IF NOT EXISTS gift_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_number TEXT UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    issued_date TIMESTAMP DEFAULT now(),
    expiry_date TIMESTAMP,
    redeemed_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);

-- Insert sample gift cards
INSERT INTO gift_cards (card_number, amount, is_active, issued_date, expiry_date) VALUES
('GC202401010001', 50.00, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year'),
('GC202401010002', 100.00, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year'),
('GC202401010003', 75.00, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year'),
('GC202401010004', 25.00, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year'),
('GC202401010005', 150.00, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year');

-- Group Bookings Table
CREATE TABLE IF NOT EXISTS group_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_leader_email TEXT NOT NULL,
    group_size INT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time_slot TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Confirmed', 'Cancelled')),
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Insert sample group bookings
INSERT INTO group_bookings (group_leader_email, group_size, preferred_date, preferred_time_slot, status, special_requests) VALUES
('wedding.party@email.com', 5, CURRENT_DATE + INTERVAL '2 weeks', 'Morning', 'Confirmed', 'Wedding party preparation'),
('corporate.event@email.com', 8, CURRENT_DATE + INTERVAL '1 month', 'Afternoon', 'Pending', 'Corporate team building event'),
('family.booking@email.com', 4, CURRENT_DATE + INTERVAL '3 weeks', 'Morning', 'Confirmed', 'Family haircut day'),
('team.event@email.com', 6, CURRENT_DATE + INTERVAL '2 months', 'Afternoon', 'Pending', 'Sports team event'),
('graduation.party@email.com', 7, CURRENT_DATE + INTERVAL '1 month', 'Morning', 'Confirmed', 'Graduation celebration');

-- Waitlist Table
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    service_id UUID REFERENCES services(id),
    preferred_barber_id UUID REFERENCES barbers(id),
    waitlist_time TIMESTAMP DEFAULT now(),
    estimated_wait_time INT,
    status TEXT NOT NULL CHECK (status IN ('Waiting', 'Notified', 'Seated', 'Cancelled')),
    created_at TIMESTAMP DEFAULT now()
);

-- Insert sample waitlist entries
INSERT INTO waitlist (customer_name, customer_phone, service_id, preferred_barber_id, estimated_wait_time, status) VALUES
('John Smith', '+1-555-0101', (SELECT id FROM services WHERE name = 'Classic Haircut'), (SELECT id FROM barbers WHERE name = 'James Wilson'), 30, 'Waiting'),
('Mike Johnson', '+1-555-0102', (SELECT id FROM services WHERE name = 'Beard Trim'), (SELECT id FROM barbers WHERE name = 'David Kim'), 20, 'Waiting'),
('Alex Brown', '+1-555-0103', (SELECT id FROM services WHERE name = 'Haircut & Beard Combo'), (SELECT id FROM barbers WHERE name = 'Michael Brown'), 45, 'Waiting'),
('Tom Wilson', '+1-555-0104', (SELECT id FROM services WHERE name = 'Hot Towel Shave'), (SELECT id FROM barbers WHERE name = 'James Wilson'), 25, 'Waiting'),
('Chris Davis', '+1-555-0105', (SELECT id FROM services WHERE name = 'Classic Haircut'), (SELECT id FROM barbers WHERE name = 'Robert Chen'), 35, 'Waiting');

-- Barber Ratings Table
CREATE TABLE IF NOT EXISTS barber_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barber_id UUID REFERENCES barbers(id),
    customer_email TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    style_category TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Insert more barber ratings
INSERT INTO barber_ratings (barber_id, customer_email, rating, review, style_category) VALUES
-- James Wilson ratings
((SELECT id FROM barbers WHERE name = 'James Wilson'), 'john.doe@email.com', 5, 'Best classic cut I''ve ever had! James is a true professional.', 'Classic Cut'),
((SELECT id FROM barbers WHERE name = 'James Wilson'), 'mike.smith@email.com', 5, 'Perfect fade every time. James never disappoints.', 'Modern Fade'),
((SELECT id FROM barbers WHERE name = 'James Wilson'), 'alex.wilson@email.com', 4, 'Great service, very attentive to detail.', 'Classic Cut'),
((SELECT id FROM barbers WHERE name = 'James Wilson'), 'david.brown@email.com', 5, 'Excellent beard trim and styling advice.', 'Beard Grooming'),
((SELECT id FROM barbers WHERE name = 'James Wilson'), 'tom.jones@email.com', 5, 'Traditional shave was amazing. Very skilled barber.', 'Traditional Shaves'),

-- Michael Brown ratings
((SELECT id FROM barbers WHERE name = 'Michael Brown'), 'ryan.cooper@email.com', 5, 'Modern fade master! Always on point.', 'Modern Fade'),
((SELECT id FROM barbers WHERE name = 'Michael Brown'), 'chris.martin@email.com', 5, 'Best textured styles in town.', 'Textured Styles'),
((SELECT id FROM barbers WHERE name = 'Michael Brown'), 'james.taylor@email.com', 4, 'Great color work and style advice.', 'Hair Coloring'),
((SELECT id FROM barbers WHERE name = 'Michael Brown'), 'peter.white@email.com', 5, 'Consistently excellent service.', 'Modern Fade'),
((SELECT id FROM barbers WHERE name = 'Michael Brown'), 'mark.davis@email.com', 5, 'Perfect fade every time.', 'Modern Fade'),

-- David Kim ratings
((SELECT id FROM barbers WHERE name = 'David Kim'), 'steve.wilson@email.com', 5, 'Beard specialist extraordinaire!', 'Beard Styling'),
((SELECT id FROM barbers WHERE name = 'David Kim'), 'paul.miller@email.com', 5, 'Traditional cuts done perfectly.', 'Traditional Cuts'),
((SELECT id FROM barbers WHERE name = 'David Kim'), 'kevin.lee@email.com', 4, 'Great service and attention to detail.', 'Beard Styling'),
((SELECT id FROM barbers WHERE name = 'David Kim'), 'brian.clark@email.com', 5, 'Best beard trim I''ve ever had.', 'Beard Styling'),
((SELECT id FROM barbers WHERE name = 'David Kim'), 'eric.wright@email.com', 5, 'Excellent traditional barbering skills.', 'Traditional Cuts'),

-- Robert Chen ratings
((SELECT id FROM barbers WHERE name = 'Robert Chen'), 'daniel.park@email.com', 5, 'Amazing color work!', 'Hair Coloring'),
((SELECT id FROM barbers WHERE name = 'Robert Chen'), 'jason.kim@email.com', 5, 'Modern styles executed perfectly.', 'Modern Styles'),
((SELECT id FROM barbers WHERE name = 'Robert Chen'), 'ryan.zhang@email.com', 4, 'Great beard design work.', 'Beard Design'),
((SELECT id FROM barbers WHERE name = 'Robert Chen'), 'matt.wong@email.com', 5, 'Excellent color consultation.', 'Hair Coloring'),
((SELECT id FROM barbers WHERE name = 'Robert Chen'), 'andrew.liu@email.com', 5, 'Perfect modern style every time.', 'Modern Styles');

-- Style Categories Table
CREATE TABLE IF NOT EXISTS style_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    difficulty_level TEXT CHECK (difficulty_level IN ('Easy', 'Medium', 'Hard')),
    maintenance_level TEXT CHECK (maintenance_level IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMP DEFAULT now()
);

-- Insert sample style categories
INSERT INTO style_categories (name, description, difficulty_level, maintenance_level) VALUES
('Classic Cut', 'Traditional, timeless haircut style', 'Easy', 'Low'),
('Modern Fade', 'Contemporary fade with clean lines', 'Hard', 'Medium'),
('Textured Crop', 'Modern, textured short haircut', 'Medium', 'Medium'),
('Pompadour', 'Classic voluminous style', 'Hard', 'High'),
('Quiff', 'Modern take on the classic pompadour', 'Medium', 'High');

-- Emergency Slots Table
CREATE TABLE IF NOT EXISTS emergency_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barber_id UUID REFERENCES barbers(id),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    priority_level INT CHECK (priority_level BETWEEN 1 AND 3),
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(barber_id, date, start_time)
);

-- Insert emergency slots for today and tomorrow
INSERT INTO emergency_slots (barber_id, date, start_time, end_time, is_available, priority_level)
SELECT 
    b.id,
    CURRENT_DATE + i,
    '17:00:00',
    '18:00:00',
    true,
    1
FROM barbers b
CROSS JOIN generate_series(0, 1) i
WHERE b.is_active = true;

-- Enable RLS for new tables
ALTER TABLE barber_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_slots ENABLE ROW LEVEL SECURITY;

-- Create policies for new tables
CREATE POLICY "Allow public read access for barber_specializations" 
    ON barber_specializations FOR SELECT USING (true);

CREATE POLICY "Allow public read access for barber_availability" 
    ON barber_availability FOR SELECT USING (true);

CREATE POLICY "Allow public read access for product_inventory" 
    ON product_inventory FOR SELECT USING (true);

CREATE POLICY "Allow public read access for style_categories" 
    ON style_categories FOR SELECT USING (true);

CREATE POLICY "Allow public read access for barber_ratings" 
    ON barber_ratings FOR SELECT USING (true);

-- Allow customers to manage their own preferences
CREATE POLICY "Allow customers to manage their preferences" 
    ON customer_preferences 
    FOR ALL USING (customer_email = current_user);

-- Allow public to create gift cards and group bookings
CREATE POLICY "Allow public to create gift_cards" 
    ON gift_cards FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to create group_bookings" 
    ON group_bookings FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to join waitlist" 
    ON waitlist FOR INSERT WITH CHECK (true);

-- Allow public to create emergency slot requests
CREATE POLICY "Allow public to request emergency slots" 
    ON emergency_slots FOR INSERT WITH CHECK (true);

-- Barber Schedules Table
CREATE TABLE IF NOT EXISTS barber_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barber_id UUID REFERENCES barbers(id),
    day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_working BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);

-- Insert default schedules for barbers (working all days except one day off per barber)
INSERT INTO barber_schedules (barber_id, day_of_week, start_time, end_time, is_working)
SELECT 
    b.id,
    d.day,
    CASE 
        WHEN d.day IN (0, 6) THEN '10:00:00'::TIME  -- Weekend hours
        ELSE '09:00:00'::TIME                       -- Weekday hours
    END as start_time,
    CASE 
        WHEN d.day = 0 THEN '16:00:00'::TIME        -- Sunday closes early
        WHEN d.day = 6 THEN '18:00:00'::TIME        -- Saturday closes early
        ELSE '19:00:00'::TIME                       -- Regular closing time
    END as end_time,
    CASE
        -- Each barber gets a different day off
        WHEN (b.name = 'James Wilson' AND d.day = 1) OR    -- Monday off
             (b.name = 'Michael Brown' AND d.day = 2) OR    -- Tuesday off
             (b.name = 'David Kim' AND d.day = 3) OR        -- Wednesday off
             (b.name = 'Robert Chen' AND d.day = 4)         -- Thursday off
        THEN false
        ELSE true
    END as is_working
FROM barbers b
CROSS JOIN (
    SELECT generate_series(0, 6) as day
) d
WHERE NOT EXISTS (
    SELECT 1 FROM barber_schedules
    WHERE barber_id = b.id AND day_of_week = d.day
);
