'use client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function StaffProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => { logout(); router.push('/login'); };
  if (!user) return null;

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-[#14532d] rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Staff</span>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          {[['Email', user.email], ['College ID', user.collegeId], ['Phone', user.phone || 'N/A']].map(([l, v]) => (
            <div key={l} className="flex justify-between">
              <span className="text-gray-500">{l}</span>
              <span className="font-medium text-gray-900">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <button onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors text-sm">
        <LogOut className="w-4 h-4" /> Sign Out
      </button>
    </div>
  );
}
