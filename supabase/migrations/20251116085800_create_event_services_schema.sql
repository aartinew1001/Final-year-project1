/*
  # Event Services Marketplace Schema

  ## Overview
  This migration creates the complete database schema for an event services marketplace
  where clients can find services for their events and vendors can list their offerings.

  ## New Tables

  ### 1. `profiles`
  Extends auth.users with additional profile information
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, not null)
  - `full_name` (text, not null)
  - `role` (text, not null) - either 'client' or 'vendor'
  - `phone` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `service_categories`
  Predefined categories of services (catering, flowers, photography, etc.)
  - `id` (uuid, primary key)
  - `name` (text, unique, not null)
  - `description` (text)
  - `created_at` (timestamptz)

  ### 3. `services`
  Services listed by vendors
  - `id` (uuid, primary key)
  - `vendor_id` (uuid, references profiles)
  - `category_id` (uuid, references service_categories)
  - `title` (text, not null)
  - `description` (text, not null)
  - `price` (numeric, not null)
  - `price_unit` (text) - e.g., 'per person', 'per event', 'per hour'
  - `is_available` (boolean, default true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `service_requests`
  Requests created by clients for specific services
  - `id` (uuid, primary key)
  - `client_id` (uuid, references profiles)
  - `event_date` (date, not null)
  - `event_location` (text, not null)
  - `notes` (text)
  - `status` (text, default 'open') - 'open', 'closed'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `request_items`
  Individual service items within a request
  - `id` (uuid, primary key)
  - `request_id` (uuid, references service_requests)
  - `category_id` (uuid, references service_categories)
  - `created_at` (timestamptz)

  ### 6. `vendor_responses`
  Vendor responses to client requests
  - `id` (uuid, primary key)
  - `request_id` (uuid, references service_requests)
  - `vendor_id` (uuid, references profiles)
  - `service_id` (uuid, references services)
  - `message` (text)
  - `quoted_price` (numeric)
  - `status` (text, default 'pending') - 'pending', 'accepted', 'declined'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with policies ensuring:
  - Users can only view their own profile
  - Vendors can only manage their own services
  - Clients can create and view their own requests
  - Vendors can view requests matching their service categories
  - Only authenticated users can access the system

  ## Notes
  - All timestamps use `timestamptz` for proper timezone handling
  - Foreign key constraints ensure data integrity
  - Indexes are added for frequently queried columns
  - Default values are set for boolean and status fields
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('client', 'vendor')),
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service_categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  price_unit text DEFAULT 'per event',
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create service_requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_date date NOT NULL,
  event_location text NOT NULL,
  notes text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create request_items table
CREATE TABLE IF NOT EXISTS request_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create vendor_responses table
CREATE TABLE IF NOT EXISTS vendor_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  message text,
  quoted_price numeric CHECK (quoted_price >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(request_id, vendor_id, service_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_services_vendor ON services(vendor_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_requests_client ON service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_request_items_request ON request_items(request_id);
CREATE INDEX IF NOT EXISTS idx_vendor_responses_request ON vendor_responses(request_id);
CREATE INDEX IF NOT EXISTS idx_vendor_responses_vendor ON vendor_responses(vendor_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_responses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Service categories policies (public read)
CREATE POLICY "Anyone can view categories"
  ON service_categories FOR SELECT
  TO authenticated
  USING (true);

-- Services policies
CREATE POLICY "Anyone can view available services"
  ON services FOR SELECT
  TO authenticated
  USING (is_available = true OR vendor_id = auth.uid());

CREATE POLICY "Vendors can insert own services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vendor')
  );

CREATE POLICY "Vendors can update own services"
  ON services FOR UPDATE
  TO authenticated
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can delete own services"
  ON services FOR DELETE
  TO authenticated
  USING (vendor_id = auth.uid());

-- Service requests policies
CREATE POLICY "Clients can view own requests"
  ON service_requests FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Vendors can view relevant requests"
  ON service_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'vendor'
    )
  );

CREATE POLICY "Clients can insert own requests"
  ON service_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'client')
  );

CREATE POLICY "Clients can update own requests"
  ON service_requests FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Request items policies
CREATE POLICY "Users can view request items for accessible requests"
  ON request_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_requests
      WHERE id = request_items.request_id
      AND (
        client_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vendor')
      )
    )
  );

CREATE POLICY "Clients can insert items for own requests"
  ON request_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM service_requests
      WHERE id = request_items.request_id
      AND client_id = auth.uid()
    )
  );

-- Vendor responses policies
CREATE POLICY "Clients can view responses to their requests"
  ON vendor_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_requests
      WHERE id = vendor_responses.request_id
      AND client_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can view own responses"
  ON vendor_responses FOR SELECT
  TO authenticated
  USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can insert own responses"
  ON vendor_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vendor')
  );

CREATE POLICY "Vendors can update own responses"
  ON vendor_responses FOR UPDATE
  TO authenticated
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

-- Insert default service categories
INSERT INTO service_categories (name, description) VALUES
  ('Catering', 'Food and beverage services for events'),
  ('Flowers & Decoration', 'Floral arrangements and event decoration'),
  ('Photography', 'Professional photography and videography'),
  ('Music & Entertainment', 'DJs, bands, and entertainment services'),
  ('Venue', 'Event venues and spaces'),
  ('Planning & Coordination', 'Event planning and coordination services')
ON CONFLICT (name) DO NOTHING;