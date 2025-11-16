import { useState } from 'react';
import { supabase, Service } from '../../lib/supabase';
import { Edit2, Trash2, DollarSign, Tag } from 'lucide-react';

interface ServicesListProps {
  services: Service[];
  loading: boolean;
  onUpdate: () => void;
}

export default function ServicesList({ services, loading, onUpdate }: ServicesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_available: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading services...</div>;
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No services added yet</p>
        <p className="text-sm text-gray-500 mt-1">Click "Add Service" to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {services.map((service) => (
        <div
          key={service.id}
          className="p-5 bg-white border border-gray-200 rounded-lg hover:shadow-md transition"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">{service.title}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Tag className="w-4 h-4" />
                <span>{service.category?.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleAvailability(service.id, service.is_available)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  service.is_available
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {service.is_available ? 'Available' : 'Unavailable'}
              </button>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-blue-600 font-semibold">
              <DollarSign className="w-5 h-5" />
              <span>{service.price.toFixed(2)}</span>
              <span className="text-sm text-gray-500 font-normal">/ {service.price_unit}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(service.id)}
                disabled={deletingId === service.id}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                title="Delete service"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Package({ className }: { className?: string }) {
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
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
