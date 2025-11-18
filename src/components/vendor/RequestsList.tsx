import { useState, useEffect } from 'react';
import { supabase, ServiceRequest, RequestItem, Service, Bid } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, MapPin, Tag, DollarSign, TrendingUp, MessageSquare } from 'lucide-react';
import PlaceBid from './PlaceBid';

interface RequestsListProps {
  requests: (ServiceRequest & { items: RequestItem[]; client?: { full_name: string; email: string; phone?: string } })[];
  onUpdate: () => void;
}

export default function RequestsList({ requests, onUpdate }: RequestsListProps) {
  const { profile } = useAuth();
  const [biddingOn, setBiddingOn] = useState<string | null>(null);
  const [vendorServices, setVendorServices] = useState<Service[]>([]);
  const [requestsWithBids, setRequestsWithBids] = useState<(ServiceRequest & { items: RequestItem[]; client?: { full_name: string; email: string; phone?: string }; bids?: Bid[] })[]>([]);

  useEffect(() => {
    fetchVendorServices();
    fetchBids();
  }, [requests]);

  const fetchVendorServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('vendor_id', profile?.id)
      .eq('is_available', true);
    setVendorServices(data || []);
  };

  const fetchBids = async () => {
    const requestIds = requests.map(r => r.id);
    if (requestIds.length === 0) {
      setRequestsWithBids(requests);
      return;
    }

    const { data: bids } = await supabase
      .from('bids')
      .select('*, vendor:profiles(full_name), service:services(title)')
      .in('request_id', requestIds);

    const enriched = requests.map(request => ({
      ...request,
      bids: bids?.filter(b => b.request_id === request.id) || []
    }));

    setRequestsWithBids(enriched);
  };

  const handleBidSuccess = () => {
    setBiddingOn(null);
    fetchBids();
    onUpdate();
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
    <div className="space-y-5">
      {requestsWithBids.map((request) => {
        const myBid = request.bids?.find(b => b.vendor_id === profile?.id);
        const bidCount = request.bids?.length || 0;
        const isAwarded = request.awarded_vendor_id !== null;
        const iWon = request.awarded_vendor_id === profile?.id;

        if (biddingOn === request.id) {
          return (
            <div key={request.id} className="p-6 bg-white border-2 border-blue-200 rounded-lg shadow-sm">
              <PlaceBid
                request={request}
                vendorServices={vendorServices}
                onSuccess={handleBidSuccess}
                onCancel={() => setBiddingOn(null)}
              />
            </div>
          );
        }

        return (
          <div key={request.id} className={`p-6 bg-white border rounded-lg hover:shadow-md transition ${
            myBid ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
          } ${iWon ? 'ring-2 ring-green-500' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg">Event Request</h3>
                  {iWon && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      You Won!
                    </span>
                  )}
                  {myBid && !iWon && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Bid Placed
                    </span>
                  )}
                  {isAwarded && !iWon && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      Awarded to Others
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">
                      {new Date(request.event_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>{request.event_location}</span>
                  </div>
                  {(request.budget_min || request.budget_max) && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium">
                        Budget: ${request.budget_min?.toFixed(0) || '0'} - ${request.budget_max?.toFixed(0) || 'Open'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Services Needed:</p>
              <div className="flex flex-wrap gap-2">
                {request.items.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    {item.category?.name}
                  </span>
                ))}
              </div>
            </div>

            {request.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700">
                  <strong>Client Notes:</strong> {request.notes}
                </p>
              </div>
            )}

            {myBid && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-blue-900">Your Bid</p>
                  <span className="text-2xl font-bold text-blue-600">${myBid.bid_amount.toFixed(2)}</span>
                </div>
                <p className="text-sm text-blue-700 mb-2">{myBid.message}</p>
                <div className="flex items-center gap-4 text-xs text-blue-600">
                  {myBid.delivery_days && (
                    <span>Delivery: {myBid.delivery_days} days</span>
                  )}
                  <span>Status: {myBid.status}</span>
                  {myBid.awarded_at && (
                    <span className="text-green-600 font-medium">Awarded!</span>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>
                      <strong>{bidCount}</strong> bid{bidCount !== 1 ? 's' : ''} received
                    </span>
                  </div>
                  {request.client && (
                    <div className="text-gray-600">
                      by <strong>{request.client.full_name}</strong>
                    </div>
                  )}
                </div>
              </div>

              {!myBid && !isAwarded && (
                <button
                  onClick={() => setBiddingOn(request.id)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm hover:shadow-md"
                >
                  <DollarSign className="w-5 h-5" />
                  Place Your Bid
                </button>
              )}

              {myBid && (
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium">
                    <MessageSquare className="w-4 h-4" />
                    Chat with Client
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Posted {new Date(request.created_at).toLocaleDateString()} at{' '}
                {new Date(request.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
