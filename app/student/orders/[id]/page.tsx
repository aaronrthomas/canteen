'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, MapPin, CheckCircle, Circle } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { Order } from '@/lib/types';
import { format } from 'date-fns';

const TIMELINE = [
  { status: 'PENDING', label: 'Order Placed', desc: 'Your order has been received' },
  { status: 'ACCEPTED', label: 'Order Accepted', desc: 'Canteen accepted your order' },
  { status: 'PREPARING', label: 'Preparing', desc: 'Being freshly prepared for you' },
  { status: 'READY', label: 'Ready for Pickup', desc: 'Your order is ready!' },
  { status: 'COMPLETED', label: 'Completed', desc: 'Enjoy your meal!' },
];

const STATUS_ORDER = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(() => {
    orderApi.getById(Number(id)).then(setOrder).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchOrder();
    // Poll every 10 seconds for active orders
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (loading) return (
    <div className="max-w-lg mx-auto px-4 py-6 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/2" />
      <div className="h-32 bg-gray-200 rounded-xl" />
      <div className="h-48 bg-gray-200 rounded-xl" />
    </div>
  );

  if (!order) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <p className="text-gray-500">Order not found.</p>
    </div>
  );

  const currentIdx = STATUS_ORDER.indexOf(order.status);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-xs text-gray-400">{format(new Date(order.createdAt), 'dd MMM yyyy · h:mm a')}</p>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-xl p-4 mb-6 ${
        order.status === 'READY' ? 'bg-green-600 text-white' :
        order.status === 'COMPLETED' ? 'bg-gray-800 text-white' :
        'bg-[#14532d] text-white'
      }`}>
        <p className="text-sm opacity-80 mb-1">Current Status</p>
        <p className="text-2xl font-bold">{order.status.replace('_', ' ')}</p>
        {order.status === 'READY' && (
          <p className="text-green-100 text-sm mt-1">🎉 Head to the counter to pick up your order!</p>
        )}
        {['PENDING', 'ACCEPTED', 'PREPARING'].includes(order.status) && (
          <p className="text-green-200 text-xs mt-2">Auto-refreshing every 10 seconds...</p>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">Order Timeline</h3>
        <div className="space-y-0">
          {TIMELINE.map((step, idx) => {
            const isDone = STATUS_ORDER.indexOf(step.status) <= currentIdx;
            const isCurrent = step.status === order.status;
            const isLast = idx === TIMELINE.length - 1;

            return (
              <div key={step.status} className="flex gap-3">
                {/* Icon & line */}
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                    ${isDone ? 'bg-green-600' : 'bg-gray-100'}`}>
                    {isDone
                      ? <CheckCircle className="w-4 h-4 text-white" />
                      : <Circle className="w-4 h-4 text-gray-300" />
                    }
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 h-8 mt-1 ${isDone ? 'bg-green-600' : 'bg-gray-100'}`} />
                  )}
                </div>
                {/* Content */}
                <div className="pb-5 pt-0.5">
                  <p className={`text-sm font-semibold ${isDone ? 'text-gray-900' : 'text-gray-300'} ${isCurrent ? 'text-green-700' : ''}`}>
                    {step.label}
                  </p>
                  {(isDone || isCurrent) && (
                    <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Items</h3>
        <div className="space-y-2">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <img src={item.foodItemImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60'}
                alt={item.foodItemName} className="w-10 h-10 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.foodItemName}</p>
                <p className="text-xs text-gray-400">×{item.quantity} · ₹{item.price} each</p>
              </div>
              <span className="font-semibold text-sm text-gray-900">₹{item.total}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-3 pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span><span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>GST (5%)</span><span>₹{order.tax}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total</span><span>₹{order.totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Pickup info */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
        <MapPin className="w-4 h-4 text-green-700 flex-shrink-0" />
        <div>
          <p className="text-xs text-gray-500">Pickup at</p>
          <p className="text-sm font-semibold text-gray-900">Main College Canteen · Counter 1</p>
        </div>
        {order.pickupTime && (
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-500 flex items-center gap-1 justify-end"><Clock className="w-3 h-3" /> Pickup</p>
            <p className="text-sm font-semibold text-gray-900">{order.pickupTime}</p>
          </div>
        )}
      </div>
    </div>
  );
}
