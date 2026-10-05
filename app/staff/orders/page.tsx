'use client';
import { useEffect, useState, useCallback } from 'react';
import { staffApi } from '@/lib/api';
import { Order } from '@/lib/types';
import toast from 'react-hot-toast';
import { Clock, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const COLUMNS = [
  { status: 'PENDING', label: 'New Orders', next: 'ACCEPTED', nextLabel: 'Accept Order', color: 'border-t-amber-400' },
  { status: 'ACCEPTED', label: 'Accepted', next: 'PREPARING', nextLabel: 'Start Preparing', color: 'border-t-blue-400' },
  { status: 'PREPARING', label: 'Preparing', next: 'READY', nextLabel: 'Mark Ready', color: 'border-t-orange-400' },
  { status: 'READY', label: 'Ready for Pickup', next: 'COMPLETED', nextLabel: 'Complete Order', color: 'border-t-green-500' },
];

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetch = useCallback(() => {
    staffApi.getActiveOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch();
    const i = setInterval(fetch, 15000);
    return () => clearInterval(i);
  }, [fetch]);

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      const updated = await staffApi.updateStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      toast.success(`Order updated to ${status}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h1>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-96 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-500 text-sm mt-1">Kanban board · Auto-refreshes every 15s</p>
        </div>
        <button onClick={fetch} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map(({ status, label, next, nextLabel, color }) => {
          const colOrders = orders.filter(o => o.status === status);
          return (
            <div key={status} className="min-h-[500px]">
              <div className={`bg-white rounded-xl border border-gray-100 border-t-4 ${color} overflow-hidden`}>
                <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-gray-900">{label}</h3>
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {colOrders.length}
                  </span>
                </div>

                <div className="p-3 space-y-3">
                  {colOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-300">
                      <p className="text-xs">No orders</p>
                    </div>
                  )}
                  {colOrders.map(order => (
                    <div key={order.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-sm text-gray-900">#{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">{order.userName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-green-700">₹{order.totalAmount}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            {format(new Date(order.createdAt), 'h:mm a')}
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 mb-3 space-y-0.5">
                        {order.items.map(item => (
                          <p key={item.id}>{item.foodItemName} ×{item.quantity}</p>
                        ))}
                      </div>

                      {order.pickupTime && (
                        <p className="text-xs text-gray-400 mb-2">Pickup: {order.pickupTime}</p>
                      )}

                      <button
                        onClick={() => updateStatus(order.id, next)}
                        disabled={updating === order.id}
                        className="w-full py-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60">
                        {updating === order.id ? 'Updating...' : nextLabel}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
