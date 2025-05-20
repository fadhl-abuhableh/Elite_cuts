
# Supabase Database Setup

This directory contains SQL scripts for setting up the Supabase database for the EliteCuts barbershop application.

## Running the SQL Script

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor section
3. Create a new query
4. Copy and paste the contents of `supabase-setup.sql` into the query editor
5. Run the query to create tables and insert initial data

## Tables Created

1. **services** - Contains information about available haircut services
2. **barbers** - Information about barbers working at the shop
3. **appointments** - Customer appointment bookings
4. **faqs** - Frequently asked questions
5. **promotions** - Current promotional offers

## Row Level Security (RLS)

The script sets up appropriate Row Level Security policies:
- Public read access for services, barbers, FAQs, and promotions
- Public write access for appointments (to allow customers to book)
- Public read access for appointments (clients can view their bookings)

## Data Population

The script populates each table with initial sample data:
- 7 haircut services with pricing and duration
- 4 barbers with bios and profile images
- 8 FAQs across various categories
- 4 promotional offers

This data serves as a starting point and can be modified through the Supabase dashboard or via API calls from your application.
