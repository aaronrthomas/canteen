'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Home, UtensilsCrossed, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/lib/store';

const navItems = [
  { href: '/student', label: 'Home', icon: Home, exact: true },
  { href: '/student/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/student/orders', label: 'Orders', icon: ClipboardList },
  { href: '/student/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/student/profile', label: 'Profile', icon: User },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const cartCount = useCartStore(s => s.totalItems());

  useEffect(() => {
    if (!user || user.role !== 'STUDENT') {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20 md:pb-0">
      {/* Top Header - Desktop */}
      <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-green-700" />
          <span className="font-bold text-lg text-green-700">Canteen</span>
        </div>
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${active ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                <Icon className="w-4 h-4" />
                {label}
                {label === 'Cart' && cartCount > 0 && (
                  <span className="bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Page content */}
      <main>{children}</main>

      {/* Bottom Navigation - Mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-50">
        <div className="flex">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex-1 flex flex-col items-center py-3 gap-1 relative transition-colors
                  ${active ? 'text-green-700' : 'text-gray-400'}`}>
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {label === 'Cart' && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{label}</span>
                {active && <div className="absolute top-0 inset-x-0 h-0.5 bg-green-600" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
