import { useState } from 'react';
import { supabase, ServiceRequest, RequestItem, Service, Bid } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, MapPin, Tag, Send, DollarSign, Clock, TrendingDown, TrendingUp } from 'lucide-react';

interface PlaceBidProps {
  request: ServiceRequest & { items: RequestItem[]; client?: { full_name: string; email: string; phone?: string }; bids?: Bid[] };
  vendorServices: Service[];
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PlaceBid({ request, vendorServices, onSuccess, onCancel }: PlaceBidProps) {
  const { profile } = useAuth();
  const [selectedService, setSelectedService] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedServiceData = vendorServices.find(s => s.id === selectedService);
  const existingBid = request.bids?.find(b => b.vendor_id === profile?.id);
  const bidCount = request.bids?.length || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedService) {
      setError('Please select a service');
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    setLoading(true);

    try {
      const { error: bidError } = await supabase.from('bids').insert({
        request_id: request.id,
        vendor_id: profile?.id,
        service_id: selectedService,
        bid_amount: parseFloat(bidAmount),
        delivery_days: deliveryDays ? parseInt(deliveryDays) : null,
        message,
        status: 'pending',
      });

      if (bidError) throw bidError;

      const { error: conversationError } = await supabase
        .from('conversations')
        .upsert({
          request_id: request.id,
          client_id: request.client_id,
          vendor_id: profile?.id,
        }, {
          onConflict: 'request_id,client_id,vendor_id'
        });

      if (conversationError) throw conversationError;

      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to place bid');
      }
    } finally {
      setLoading(false);
    }
  };

  if (existingBid) {
    return (
      <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">You've Already Submitted a Bid</h3>
        <p className="text-blue-700 text-sm mb-4">
          Your bid of ${existingBid.bid_amount.toFixed(2)} is currently {existingBid.status}.
        </p>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Request Details</h3>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">
              {new Date(request.event_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-sm">{request.event_location}</span>
          </div>

          {(request.budget_min || request.budget_max) && (
            <div className="flex items-center gap-2 text-gray-700">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">
                Budget: ${request.budget_min?.toFixed(0) || '0'} - ${request.budget_max?.toFixed(0) || 'Open'}
              </span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Services Needed:</p>
          <div className="flex flex-wrap gap-2">
            {request.items.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                <Tag className="w-3 h-3" />
                {item.category?.name}
              </span>
            ))}
          </div>
        </div>

        {request.notes && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              <strong>Client Notes:</strong> {request.notes}
            </p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-gray-600">
                <strong>{bidCount}</strong> bid{bidCount !== 1 ? 's' : ''} received
              </span>
            </div>
            {request.client && (
              <div className="text-gray-600">
                Client: <strong>{request.client.full_name}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Your Service *
          </label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Choose a service...</option>
            {vendorServices.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title} - ${service.price} / {service.price_unit}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Bid Amount ($) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your bid"
                required
              />
            </div>
            {selectedServiceData && bidAmount && (
              <div className="mt-2">
                {parseFloat(bidAmount) < selectedServiceData.price ? (
                  <p className="text-sm text-orange-600 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    ${(selectedServiceData.price - parseFloat(bidAmount)).toFixed(2)} below your standard price
                  </p>
                ) : parseFloat(bidAmount) > selectedServiceData.price ? (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    ${(parseFloat(bidAmount) - selectedServiceData.price).toFixed(2)} above your standard price
                  </p>
                ) : (
                  <p className="text-sm text-blue-600">Matches your standard price</p>
                )}
              </div>
            )}
            {request.budget_max && bidAmount && parseFloat(bidAmount) > request.budget_max && (
              <p className="text-sm text-red-600 mt-1">
                Your bid exceeds the client's maximum budget
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Time (days)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                min="1"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Estimated days"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              How many days before the event do you need?
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proposal Message *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={5}
            placeholder="Introduce yourself, explain why you're the perfect fit for this event, highlight your experience..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Make your proposal stand out! Be specific about what you'll deliver.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium shadow-sm hover:shadow-md"
          >
            <Send className="w-5 h-5" />
            {loading ? 'Submitting Bid...' : 'Submit Bid'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Be competitive with your pricing while showcasing your unique value.
          After submitting, you can chat with the client to discuss details!
        </p>
      </div>
    </div>
  );
}
