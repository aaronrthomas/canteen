'use client';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { DashboardStats } from '@/lib/types';
import { Users, ShoppingBag, IndianRupee, TrendingUp, Clock, CheckCheck, Package } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard().then(setStats).finally(() => setLoading(false));
  }, []);

  const metrics = stats ? [
    { label: 'Total Students', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', suffix: '' },
    { label: "Today's Orders", value: stats.todaysOrders, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50', suffix: '' },
    { label: "Today's Revenue", value: `₹${Number(stats.todaysRevenue).toFixed(0)}`, icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50', suffix: '' },
    { label: 'Avg. Order Value', value: `₹${Number(stats.averageOrderValue).toFixed(0)}`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', suffix: '' },
  ] : [];

  const statusCards = stats ? [
    { label: 'Pending', value: stats.pendingOrders, icon: Clock, color: 'text-amber-600' },
    { label: 'Preparing', value: stats.preparingOrders, icon: Package, color: 'text-orange-600' },
    { label: 'Ready', value: stats.readyOrders, icon: CheckCheck, color: 'text-green-600' },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your canteen operations</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Main metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Status breakdown */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {statusCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <Icon className={`w-5 h-5 ${color}`} />
                <div>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { href: '/admin/users', title: 'Manage Users', desc: 'View and manage student/staff accounts', color: 'bg-blue-600' },
          { href: '/admin/menu', title: 'Manage Menu', desc: 'Add, edit or remove food items', color: 'bg-green-600' },
          { href: '/admin/orders', title: 'All Orders', desc: 'View complete order history', color: 'bg-purple-600' },
          { href: '/admin/categories', title: 'Categories', desc: 'Manage food categories', color: 'bg-amber-600' },
        ].map(({ href, title, desc, color }) => (
          <a key={href} href={href}
            className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow group">
            <div className={`w-10 h-10 ${color} rounded-lg mb-3 flex items-center justify-center`}>
              <div className="w-4 h-4 bg-white/40 rounded" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-green-700 transition-colors">{title}</h3>
            <p className="text-xs text-gray-500">{desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
