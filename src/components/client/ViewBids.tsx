import { useState, useEffect } from 'react';
import { supabase, ServiceRequest, RequestItem, Bid } from '../../lib/supabase';
import { DollarSign, Clock, Award, MessageSquare, Star, CheckCircle } from 'lucide-react';

interface ViewBidsProps {
  request: ServiceRequest & { items: RequestItem[] };
  onUpdate: () => void;
}

export default function ViewBids({ request, onUpdate }: ViewBidsProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [awarding, setAwarding] = useState<string | null>(null);

  useEffect(() => {
    fetchBids();
  }, [request.id]);

  const fetchBids = async () => {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*, vendor:profiles(full_name, email, phone), service:services(title, category:service_categories(name))')
        .eq('request_id', request.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBids(data || []);
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAwardBid = async (bidId: string, vendorId: string) => {
    if (!confirm('Are you sure you want to award this bid? This will notify the vendor.')) {
      return;
    }

    setAwarding(bidId);

    try {
      const { error: bidError } = await supabase
        .from('bids')
        .update({ status: 'awarded', awarded_at: new Date().toISOString() })
        .eq('id', bidId);

      if (bidError) throw bidError;

      const { error: requestError } = await supabase
        .from('service_requests')
        .update({ awarded_vendor_id: vendorId, status: 'closed' })
        .eq('id', request.id);

      if (requestError) throw requestError;

      const { error: otherBidsError } = await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('request_id', request.id)
        .neq('id', bidId);

      if (otherBidsError) throw otherBidsError;

      fetchBids();
      onUpdate();
    } catch (error) {
      console.error('Error awarding bid:', error);
      alert('Failed to award bid. Please try again.');
    } finally {
      setAwarding(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-600">No bids received yet</p>
        <p className="text-sm text-gray-500 mt-1">Vendors will be notified of your request</p>
      </div>
    );
  }

  const sortedBids = [...bids].sort((a, b) => a.bid_amount - b.bid_amount);
  const lowestBid = sortedBids[0];
  const awardedBid = bids.find(b => b.status === 'awarded');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {bids.length} Bid{bids.length !== 1 ? 's' : ''} Received
        </h3>
        {awardedBid && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Bid Awarded
          </span>
        )}
      </div>

      {bids.map((bid) => {
        const isLowest = bid.id === lowestBid.id && !awardedBid;
        const isAwarded = bid.status === 'awarded';
        const isRejected = bid.status === 'rejected';

        return (
          <div
            key={bid.id}
            className={`p-5 rounded-lg border-2 transition ${
              isAwarded
                ? 'bg-green-50 border-green-300'
                : isRejected
                ? 'bg-gray-50 border-gray-200 opacity-60'
                : isLowest
                ? 'bg-blue-50 border-blue-300'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {bid.vendor?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{bid.vendor?.full_name}</h4>
                    <p className="text-sm text-gray-600">{bid.service?.title}</p>
                    <p className="text-xs text-gray-500">{bid.service?.category?.name}</p>
                  </div>
                </div>

                {isLowest && !awardedBid && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-medium mb-2">
                    <TrendingDown className="w-3 h-3" />
                    Lowest Bid
                  </div>
                )}

                {isAwarded && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-full text-xs font-medium mb-2">
                    <Award className="w-3 h-3" />
                    Awarded
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  ${bid.bid_amount.toFixed(2)}
                </div>
                {bid.delivery_days && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{bid.delivery_days} days</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4 p-3 bg-white/50 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed">{bid.message}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <div>{bid.vendor?.email}</div>
                {bid.vendor?.phone && <div>{bid.vendor.phone}</div>}
              </div>

              <div className="flex gap-2">
                {!awardedBid && !isRejected && (
                  <>
                    <button
                      onClick={() => handleAwardBid(bid.id, bid.vendor_id)}
                      disabled={awarding === bid.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium"
                    >
                      <Award className="w-4 h-4" />
                      {awarding === bid.id ? 'Awarding...' : 'Award Bid'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                      <MessageSquare className="w-4 h-4" />
                      Chat
                    </button>
                  </>
                )}

                {isAwarded && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                    <MessageSquare className="w-4 h-4" />
                    Chat with Vendor
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
              Submitted {new Date(bid.created_at).toLocaleDateString()} at{' '}
              {new Date(bid.created_at).toLocaleTimeString()}
            </div>
          </div>
        );
      })}

      {!awardedBid && bids.length > 1 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Compare bids carefully. The lowest price isn't always the best choice.
            Consider delivery time, vendor experience, and proposal quality.
          </p>
        </div>
      )}
    </div>
  );
}

function TrendingDown({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}
