import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Service, ServiceRequest, RequestItem } from '../../lib/supabase';
import ServicesList from './ServicesList';
import AddServiceForm from './AddServiceForm';
import RequestsList from './RequestsList';
import { Plus, Package, Inbox, LogOut } from 'lucide-react';

type Tab = 'services' | 'requests';

export default function VendorDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<(ServiceRequest & { items: RequestItem[] })[]>([]);
  const [showAddService, setShowAddService] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
    fetchRequests();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*, category:service_categories(*)')
        .eq('vendor_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data: requestsData, error: requestsError } = await supabase
        .from('service_requests')
        .select(`
          *,
          client:profiles(full_name, email, phone),
          items:request_items(*, category:service_categories(*))
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      const vendorServices = await supabase
        .from('services')
        .select('category_id')
        .eq('vendor_id', profile?.id);

      const vendorCategoryIds = vendorServices.data?.map(s => s.category_id) || [];

      const relevantRequests = (requestsData || []).filter((request: ServiceRequest & { items: RequestItem[] }) =>
        request.items.some(item => vendorCategoryIds.includes(item.category_id))
      );

      setRequests(relevantRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleServiceAdded = () => {
    setShowAddService(false);
    fetchServices();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Vendor Dashboard</h1>
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
                onClick={() => setActiveTab('services')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition ${
                  activeTab === 'services'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className="w-4 h-4" />
                My Services ({services.length})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition ${
                  activeTab === 'requests'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Inbox className="w-4 h-4" />
                Client Requests ({requests.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'services' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Your Services</h2>
                  <button
                    onClick={() => setShowAddService(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Service
                  </button>
                </div>

                {showAddService && (
                  <AddServiceForm
                    onSuccess={handleServiceAdded}
                    onCancel={() => setShowAddService(false)}
                  />
                )}

                <ServicesList
                  services={services}
                  loading={loading}
                  onUpdate={fetchServices}
                />
              </div>
            )}

            {activeTab === 'requests' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Client Requests</h2>
                <RequestsList requests={requests} onUpdate={fetchRequests} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
