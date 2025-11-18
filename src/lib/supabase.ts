import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'client' | 'vendor';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Service {
  id: string;
  vendor_id: string;
  category_id: string;
  title: string;
  description: string;
  price: number;
  price_unit: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  category?: ServiceCategory;
  vendor?: Profile;
}

export interface ServiceRequest {
  id: string;
  client_id: string;
  event_date: string;
  event_location: string;
  notes?: string;
  budget_min?: number;
  budget_max?: number;
  status: 'open' | 'closed';
  awarded_vendor_id?: string;
  created_at: string;
  updated_at: string;
  client?: Profile;
}

export interface RequestItem {
  id: string;
  request_id: string;
  category_id: string;
  created_at: string;
  category?: ServiceCategory;
}

export interface VendorResponse {
  id: string;
  request_id: string;
  vendor_id: string;
  service_id: string;
  message?: string;
  quoted_price?: number;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  vendor?: Profile;
  service?: Service;
}

export interface Bid {
  id: string;
  request_id: string;
  vendor_id: string;
  service_id: string;
  bid_amount: number;
  delivery_days?: number;
  message: string;
  status: 'pending' | 'awarded' | 'rejected' | 'withdrawn';
  awarded_at?: string;
  created_at: string;
  updated_at: string;
  vendor?: Profile;
  service?: Service;
}

export interface Conversation {
  id: string;
  request_id: string;
  client_id: string;
  vendor_id: string;
  last_message_at: string;
  created_at: string;
  client?: Profile;
  vendor?: Profile;
  request?: ServiceRequest;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}
