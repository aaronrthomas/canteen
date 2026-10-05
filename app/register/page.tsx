'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { UtensilsCrossed } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', collegeId: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;
      const data = await authApi.register(submitData);
      setAuth(data.user, data.token);
      toast.success('Account created successfully!');
      router.push('/student');
    } catch (err: any) {
      console.error('Registration error:', err.code, err.message);
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', placeholder: 'Aaron Thomas', type: 'text' },
    { key: 'email', label: 'College Email', placeholder: 'you@college.edu', type: 'email' },
    { key: 'collegeId', label: 'College ID', placeholder: 'CS2021001', type: 'text' },
    { key: 'phone', label: 'Phone Number', placeholder: '9876543210', type: 'tel' },
    { key: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
    { key: 'confirmPassword', label: 'Confirm Password', placeholder: '••••••••', type: 'password' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <UtensilsCrossed className="w-6 h-6 text-green-700" />
          <span className="font-bold text-xl text-green-700">Canteen</span>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create account</h2>
        <p className="text-gray-500 mb-8">Join your college canteen community</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold rounded-lg transition-colors disabled:opacity-60 text-sm mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-green-700 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
