import { useState } from 'react';
import { supabase, ServiceRequest, RequestItem, Service } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, MapPin, Tag, Send } from 'lucide-react';

interface RequestsListProps {
  requests: (ServiceRequest & { items: RequestItem[]; client?: { full_name: string; email: string; phone?: string } })[];
  onUpdate: () => void;
}

export default function RequestsList({ requests, onUpdate }: RequestsListProps) {
  const { profile } = useAuth();
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState('');
  const [message, setMessage] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [vendorServices, setVendorServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRespond = async (requestId: string) => {
    setRespondingTo(requestId);
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('vendor_id', profile?.id)
      .eq('is_available', true);
    setVendorServices(data || []);
  };

  const submitResponse = async (requestId: string) => {
    if (!selectedService) {
      alert('Please select a service');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('vendor_responses').insert({
        request_id: requestId,
        vendor_id: profile?.id,
        service_id: selectedService,
        message,
        quoted_price: quotedPrice ? parseFloat(quotedPrice) : null,
      });

      if (error) throw error;

      setRespondingTo(null);
      setSelectedService('');
      setMessage('');
      setQuotedPrice('');
      alert('Response sent successfully!');
      onUpdate();
    } catch (error) {
      console.error('Error sending response:', error);
      alert('Failed to send response');
    } finally {
      setLoading(false);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-600">No client requests at the moment</p>
        <p className="text-sm text-gray-500 mt-1">Requests matching your service categories will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="p-5 bg-white border border-gray-200 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Event Request</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(request.event_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{request.event_location}</span>
                </div>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              Open
            </span>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Services Needed:</p>
            <div className="flex flex-wrap gap-2">
              {request.items.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  <Tag className="w-3 h-3" />
                  {item.category?.name}
                </span>
              ))}
            </div>
          </div>

          {request.notes && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700"><strong>Notes:</strong> {request.notes}</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-3">
              <strong>Client:</strong> {request.client?.full_name} ({request.client?.email})
              {request.client?.phone && ` • ${request.client.phone}`}
            </p>

            {respondingTo === request.id ? (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Your Service
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a service...</option>
                    {vendorServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.title} - ${service.price} / {service.price_unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quoted Price (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Custom price for this request"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message to Client
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Introduce your service and why you're a great fit..."
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => submitResponse(request.id)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {loading ? 'Sending...' : 'Send Response'}
                  </button>
                  <button
                    onClick={() => setRespondingTo(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleRespond(request.id)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Send className="w-4 h-4" />
                Respond to Request
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
