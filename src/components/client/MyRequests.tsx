import { useState, useEffect } from 'react';
import { supabase, ServiceRequest, RequestItem, Bid } from '../../lib/supabase';
import { Calendar, MapPin, Tag, TrendingUp, ChevronDown, ChevronUp, DollarSign, Award } from 'lucide-react';
import ViewBids from './ViewBids';

interface MyRequestsProps {
  requests: (ServiceRequest & {
    items: RequestItem[];
  })[];
  onUpdate: () => void;
}

export default function MyRequests({ requests, onUpdate }: MyRequestsProps) {
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [bidCounts, setBidCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchBidCounts();
  }, [requests]);

  const fetchBidCounts = async () => {
    if (requests.length === 0) return;

    const requestIds = requests.map(r => r.id);
    const { data } = await supabase
      .from('bids')
      .select('request_id')
      .in('request_id', requestIds);

    const counts: Record<string, number> = {};
    data?.forEach(bid => {
      counts[bid.request_id] = (counts[bid.request_id] || 0) + 1;
    });

    setBidCounts(counts);
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-600">No requests yet</p>
        <p className="text-sm text-gray-500 mt-1">Create a request to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-900">Your Service Requests</h2>

      {requests.map((request) => {
        const bidCount = bidCounts[request.id] || 0;
        const isExpanded = expandedRequest === request.id;
        const isAwarded = request.awarded_vendor_id !== null;

        return (
          <div key={request.id} className={`bg-white border rounded-lg overflow-hidden transition ${
            isAwarded ? 'border-green-300 shadow-sm' : 'border-gray-200 hover:shadow-md'
          }`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg">Event Request</h3>
                    {isAwarded ? (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Awarded
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Open
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
                <p className="text-sm font-medium text-gray-700 mb-2">Services Requested:</p>
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
                    <strong>Your Notes:</strong> {request.notes}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => setExpandedRequest(isExpanded ? null : request.id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg transition"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">
                      {bidCount} Bid{bidCount !== 1 ? 's' : ''} Received
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Created {new Date(request.created_at).toLocaleDateString()} at{' '}
                  {new Date(request.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {isExpanded && (
              <div className="px-6 pb-6 pt-2 border-t border-gray-100 bg-gray-50">
                <ViewBids request={request} onUpdate={() => { onUpdate(); fetchBidCounts(); }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
