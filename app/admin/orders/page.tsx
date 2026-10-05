'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Order } from '@/lib/types';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700', ACCEPTED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-orange-100 text-orange-700', READY: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-gray-100 text-gray-600', CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    adminApi.getAllOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  const statuses = ['ALL', 'PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} total orders</p>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
              ${filter === s ? 'bg-[#14532d] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            {s} {s !== 'ALL' && `(${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order #', 'Student', 'Items', 'Total', 'Payment', 'Status', 'Time'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-gray-900">#{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-700">{order.userName}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[180px] truncate">
                    {order.items.map(i => `${i.foodItemName}×${i.quantity}`).join(', ')}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">₹{order.totalAmount}</td>
                  <td className="px-4 py-3 text-gray-500">{order.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || ''}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {format(new Date(order.createdAt), 'dd MMM, h:mm a')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">No orders found</div>
          )}
        </div>
      )}
    </div>
  );
}
