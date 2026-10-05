'use client';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, CreditCard, LogOut, ChevronRight, ClipboardList } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 bg-[#14532d] rounded-full flex items-center justify-center mb-4">
          <span className="text-white text-2xl font-bold">{initials}</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mt-2 capitalize">
          {user.role.toLowerCase()}
        </span>
      </div>

      {/* Info */}
      <div className="bg-white rounded-xl border border-gray-100 mb-4 divide-y divide-gray-50">
        <h3 className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Personal Information</h3>
        {[
          { icon: User, label: 'Full Name', value: user.name },
          { icon: Mail, label: 'Email', value: user.email },
          { icon: CreditCard, label: 'College ID', value: user.collegeId },
          { icon: Phone, label: 'Phone', value: user.phone || 'Not provided' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-medium text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Links */}
      <div className="bg-white rounded-xl border border-gray-100 mb-4">
        <Link href="/student/orders" className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm font-medium text-gray-900">Order History</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </Link>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-white border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors text-sm">
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}
