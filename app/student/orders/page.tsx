'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, ChevronRight, RotateCcw } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { Order } from '@/lib/types';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'status-pending', ACCEPTED: 'status-accepted',
  PREPARING: 'status-preparing', READY: 'status-ready',
  COMPLETED: 'status-completed', CANCELLED: 'status-cancelled',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    orderApi.getMyOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  const reorder = async (order: Order) => {
    try {
      for (const item of order.items) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/food/${item.foodItemId}`);
        const food = await response.json();
        if (food.available) addItem(food, item.quantity);
      }
      toast.success('Items added to cart!');
    } catch {
      toast.error('Some items may be unavailable');
    }
  };

  if (loading) return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />
      ))}
    </div>
  );

  if (orders.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ClipboardList className="w-10 h-10 text-gray-300" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
      <p className="text-gray-500 text-sm mb-6">Your order history will appear here</p>
      <Link href="/student/menu" className="px-6 py-3 bg-[#16a34a] text-white font-semibold rounded-xl text-sm">
        Browse Menu
      </Link>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Orders</h1>

      <div className="space-y-3">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {format(new Date(order.createdAt), 'dd MMM yyyy, h:mm a')}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || ''}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-1">
              {order.items.map(i => `${i.foodItemName} ×${i.quantity}`).join(', ')}
            </p>

            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">₹{order.totalAmount}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => reorder(order)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-700 font-medium transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> Reorder
                </button>
                <Link href={`/student/orders/${order.id}`}
                  className="flex items-center gap-1 text-xs text-green-700 font-semibold">
                  Details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
