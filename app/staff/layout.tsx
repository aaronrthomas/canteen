'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, ClipboardList, UtensilsCrossed, User } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

const navItems = [
  { href: '/staff', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/staff/orders', label: 'Orders', icon: ClipboardList },
  { href: '/staff/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/staff/profile', label: 'Profile', icon: User },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col fixed inset-y-0">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-green-700" />
            <span className="font-bold text-lg text-green-700">Canteen</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Staff Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-700 text-xs font-bold">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400">Staff</p>
            </div>
          </div>
        </div>
      </aside>
      {/* Main */}
      <main className="ml-60 flex-1 p-8">{children}</main>
    </div>
  );
}
