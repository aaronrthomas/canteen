'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { staffApi } from '@/lib/api';
import { Order } from '@/lib/types';
import { Package, Clock, CheckCheck, ChevronRight, TrendingUp, IndianRupee } from 'lucide-react';

export default function StaffDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    staffApi.getActiveOrders().then(setOrders).finally(() => setLoading(false));
    const interval = setInterval(() => staffApi.getActiveOrders().then(setOrders), 15000);
    return () => clearInterval(interval);
  }, []);

  const pending = orders.filter(o => o.status === 'PENDING').length;
  const preparing = orders.filter(o => o.status === 'PREPARING' || o.status === 'ACCEPTED').length;
  const ready = orders.filter(o => o.status === 'READY').length;
  const todayRevenue = orders.reduce((s, o) => s + Number(o.totalAmount), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Live order management · Auto-refreshes every 15s</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Today's Orders", value: orders.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending', value: pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Preparing', value: preparing, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Ready', value: ready, icon: CheckCheck, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Active Orders</h2>
          <Link href="/staff/orders" className="text-sm text-green-700 font-medium flex items-center gap-1">
            Manage all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No active orders right now</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <p className="font-semibold text-sm text-gray-900">#{order.orderNumber} · {order.userName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.items.map(i => `${i.foodItemName}×${i.quantity}`).join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'PREPARING' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-bold text-gray-900">₹{order.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
