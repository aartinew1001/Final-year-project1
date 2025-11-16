import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Service, ServiceRequest, RequestItem, VendorResponse } from '../../lib/supabase';
import BrowseServices from './BrowseServices';
import CreateRequest from './CreateRequest';
import MyRequests from './MyRequests';
import { Search, PlusCircle, List, LogOut } from 'lucide-react';

type Tab = 'browse' | 'create' | 'requests';

export default function ClientDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('browse');
  const [services, setServices] = useState<Service[]>([]);
  const [myRequests, setMyRequests] = useState<(ServiceRequest & { items: RequestItem[]; responses?: VendorResponse[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
    fetchMyRequests();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*, category:service_categories(*), vendor:profiles(full_name, email, phone)')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
          items:request_items(*, category:service_categories(*)),
          responses:vendor_responses(*, vendor:profiles(full_name, email, phone), service:services(title, price, price_unit))
        `)
        .eq('client_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleRequestCreated = () => {
    setActiveTab('requests');
    fetchMyRequests();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Search className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Client Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{profile?.full_name}</span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('browse')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition ${
                  activeTab === 'browse'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Search className="w-4 h-4" />
                Browse Services
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition ${
                  activeTab === 'create'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Create Request
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition ${
                  activeTab === 'requests'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
                My Requests ({myRequests.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'browse' && (
              <BrowseServices services={services} loading={loading} />
            )}
            {activeTab === 'create' && (
              <CreateRequest onSuccess={handleRequestCreated} />
            )}
            {activeTab === 'requests' && (
              <MyRequests requests={myRequests} onUpdate={fetchMyRequests} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
