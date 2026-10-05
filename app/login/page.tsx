'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UtensilsCrossed } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login(form);
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'ADMIN') router.push('/admin');
      else if (data.user.role === 'STAFF') router.push('/staff');
      else router.push('/student');
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'admin' | 'staff' | 'student') => {
    const creds = {
      admin: { email: 'admin@canteen.edu', password: 'admin123' },
      staff: { email: 'staff1@canteen.edu', password: 'staff123' },
      student: { email: 'aaron@college.edu', password: 'student123' },
    };
    setForm(creds[role]);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-[#14532d] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Canteen</span>
        </div>
        <div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Your campus<br />food, simplified.
          </h1>
          <p className="text-green-200 text-lg">
            Order ahead, skip the queue, and enjoy fresh food from your college canteen.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[['20+', 'Menu Items'], ['5 min', 'Avg. Wait'], ['₹50', 'Avg. Order']].map(([val, label]) => (
            <div key={label} className="bg-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{val}</div>
              <div className="text-green-200 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <UtensilsCrossed className="w-6 h-6 text-green-700" />
            <span className="font-bold text-xl text-green-700">Canteen</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h2>
          <p className="text-gray-500 mb-8">Enter your credentials to continue</p>

          {/* Quick demo buttons */}
          <div className="flex gap-2 mb-6">
            {(['admin', 'staff', 'student'] as const).map((role) => (
              <button
                key={role}
                onClick={() => fillDemo(role)}
                className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:border-green-600 hover:text-green-700 transition-colors capitalize"
              >
                {role}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mb-6 text-center">Click above to fill demo credentials</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@college.edu"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            No account?{' '}
            <Link href="/register" className="text-green-700 font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
