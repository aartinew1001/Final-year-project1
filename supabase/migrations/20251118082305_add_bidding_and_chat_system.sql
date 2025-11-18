/*
  # Bidding and Chat System

  ## Overview
  This migration adds a complete bidding system similar to Freelancer.com, where vendors can
  place bids on client requests and engage in real-time chat with clients.

  ## New Tables

  ### 1. `bids`
  Vendor bids on client service requests
  - `id` (uuid, primary key)
  - `request_id` (uuid, references service_requests)
  - `vendor_id` (uuid, references profiles)
  - `service_id` (uuid, references services)
  - `bid_amount` (numeric, not null) - Total bid amount
  - `delivery_days` (integer) - Estimated delivery time
  - `message` (text) - Bid proposal message
  - `status` (text) - 'pending', 'awarded', 'rejected', 'withdrawn'
  - `awarded_at` (timestamptz) - When the bid was awarded
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `conversations`
  Chat conversations between clients and vendors
  - `id` (uuid, primary key)
  - `request_id` (uuid, references service_requests)
  - `client_id` (uuid, references profiles)
  - `vendor_id` (uuid, references profiles)
  - `last_message_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 3. `messages`
  Individual chat messages within conversations
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, references conversations)
  - `sender_id` (uuid, references profiles)
  - `message` (text, not null)
  - `is_read` (boolean, default false)
  - `created_at` (timestamptz)

  ## Changes to Existing Tables
  - Add `awarded_vendor_id` to `service_requests` to track awarded vendor
  - Add `budget_min` and `budget_max` to `service_requests` for client budget range

  ## Security
  - RLS enabled on all new tables
  - Vendors can only manage their own bids
  - Participants can only view their own conversations and messages
  - Clients can award bids to any vendor who submitted a bid on their request

  ## Notes
  - Unique constraint prevents multiple bids from same vendor on same request
  - Real-time subscriptions can be enabled for messages table
  - Indexes added for conversation and bid queries
*/

-- Add budget and awarded vendor to service_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_requests' AND column_name = 'budget_min'
  ) THEN
    ALTER TABLE service_requests ADD COLUMN budget_min numeric CHECK (budget_min >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_requests' AND column_name = 'budget_max'
  ) THEN
    ALTER TABLE service_requests ADD COLUMN budget_max numeric CHECK (budget_max >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'service_requests' AND column_name = 'awarded_vendor_id'
  ) THEN
    ALTER TABLE service_requests ADD COLUMN awarded_vendor_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  bid_amount numeric NOT NULL CHECK (bid_amount >= 0),
  delivery_days integer CHECK (delivery_days > 0),
  message text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'awarded', 'rejected', 'withdrawn')),
  awarded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(request_id, vendor_id)
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vendor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(request_id, client_id, vendor_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bids_request ON bids(request_id);
CREATE INDEX IF NOT EXISTS idx_bids_vendor ON bids(vendor_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_conversations_request ON conversations(request_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_vendor ON conversations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- Enable Row Level Security
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Bids policies
CREATE POLICY "Clients can view bids on their requests"
  ON bids FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_requests
      WHERE id = bids.request_id
      AND client_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can view own bids"
  ON bids FOR SELECT
  TO authenticated
  USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can insert own bids"
  ON bids FOR INSERT
  TO authenticated
  WITH CHECK (
    vendor_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'vendor')
  );

CREATE POLICY "Vendors can update own bids"
  ON bids FOR UPDATE
  TO authenticated
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Clients can update bid status"
  ON bids FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM service_requests
      WHERE id = bids.request_id
      AND client_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM service_requests
      WHERE id = bids.request_id
      AND client_id = auth.uid()
    )
  );

-- Conversations policies
CREATE POLICY "Participants can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (client_id = auth.uid() OR vendor_id = auth.uid());

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid() OR vendor_id = auth.uid());

CREATE POLICY "Participants can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid() OR vendor_id = auth.uid())
  WITH CHECK (client_id = auth.uid() OR vendor_id = auth.uid());

-- Messages policies
CREATE POLICY "Conversation participants can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (client_id = auth.uid() OR vendor_id = auth.uid())
    )
  );

CREATE POLICY "Conversation participants can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (client_id = auth.uid() OR vendor_id = auth.uid())
    )
  );

CREATE POLICY "Message recipients can mark as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (client_id = auth.uid() OR vendor_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (client_id = auth.uid() OR vendor_id = auth.uid())
    )
  );

-- Create function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update conversation timestamp
DROP TRIGGER IF EXISTS update_conversation_timestamp_trigger ON messages;
CREATE TRIGGER update_conversation_timestamp_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();