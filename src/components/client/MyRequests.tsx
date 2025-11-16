import { ServiceRequest, RequestItem, VendorResponse } from '../../lib/supabase';
import { Calendar, MapPin, Tag, MessageSquare, DollarSign } from 'lucide-react';

interface MyRequestsProps {
  requests: (ServiceRequest & {
    items: RequestItem[];
    responses?: VendorResponse[]
  })[];
  onUpdate: () => void;
}

export default function MyRequests({ requests }: MyRequestsProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-600">No requests yet</p>
        <p className="text-sm text-gray-500 mt-1">Create a request to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Your Service Requests</h2>

      {requests.map((request) => (
        <div key={request.id} className="p-6 bg-white border border-gray-200 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">Event Request</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === 'open'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {request.status}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
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
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Services Requested:</p>
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
              <p className="text-sm text-gray-700">
                <strong>Your Notes:</strong> {request.notes}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Vendor Responses ({request.responses?.length || 0})
              </h4>
            </div>

            {!request.responses || request.responses.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No responses yet. Vendors will be notified of your request.
              </p>
            ) : (
              <div className="space-y-3">
                {request.responses.map((response) => (
                  <div
                    key={response.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {response.vendor?.full_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {response.service?.title}
                        </p>
                      </div>
                      {response.quoted_price && (
                        <div className="flex items-center gap-1 text-blue-600 font-semibold">
                          <DollarSign className="w-4 h-4" />
                          <span>{response.quoted_price.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {response.message && (
                      <p className="text-sm text-gray-700 mt-2 mb-3">
                        {response.message}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        Contact: {response.vendor?.email}
                        {response.vendor?.phone && ` • ${response.vendor.phone}`}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(response.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Created {new Date(request.created_at).toLocaleDateString()} at{' '}
              {new Date(request.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
