'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Clock, Star, Plus, ChevronRight, MapPin } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/lib/store';
import { foodApi, categoryApi, orderApi } from '@/lib/api';
import { FoodItem, Category, Order } from '@/lib/types';
import toast from 'react-hot-toast';

const CATEGORY_ICONS: Record<string, string> = {
  Breakfast: '🍳', Meals: '🍱', Snacks: '🥪', 'Fast Food': '🍔', Beverages: '☕', Desserts: '🍰',
};

export default function StudentHome() {
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [popular, setPopular] = useState<FoodItem[]>([]);
  const [quick, setQuick] = useState<FoodItem[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(() => {});
    foodApi.getAll({ available: true }).then(data => {
      setPopular(data.sort((a, b) => b.rating - a.rating).slice(0, 6));
      setQuick(data.filter(f => f.preparationTime <= 10).slice(0, 4));
    }).catch(() => {});
    orderApi.getMyOrders().then(orders => {
      const active = orders.find(o => ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status));
      if (active) setActiveOrder(active);
    }).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) window.location.href = `/student/menu?search=${encodeURIComponent(searchQuery)}`;
  };

  const handleAdd = (food: FoodItem) => {
    addItem(food);
    toast.success(`${food.name} added to cart`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">What's on your mind?</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search food, drinks or snacks..."
          className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white shadow-sm focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none text-sm"
        />
      </form>

      {/* Active Order Card */}
      {activeOrder && (
        <div className="bg-[#14532d] rounded-2xl p-4 mb-6 text-white">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-green-200 text-xs font-medium mb-1">Active Order</p>
              <p className="font-bold text-lg">#{activeOrder.orderNumber}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white`}>
              {activeOrder.status.replace('_', ' ')}
            </span>
          </div>
          <div className="text-sm text-green-100 mb-3">
            {activeOrder.items.slice(0, 2).map(i => `${i.foodItemName} × ${i.quantity}`).join(', ')}
            {activeOrder.items.length > 2 && ` +${activeOrder.items.length - 2} more`}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">₹{activeOrder.totalAmount}</span>
            <Link href={`/student/orders/${activeOrder.id}`}
              className="bg-white text-green-800 text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-50 transition-colors">
              Track Order →
            </Link>
          </div>
        </div>
      )}

      {/* Categories */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Categories</h2>
          <Link href="/student/menu" className="text-green-700 text-sm font-medium flex items-center gap-1">
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {categories.map(cat => (
            <Link key={cat.id} href={`/student/menu?categoryId=${cat.id}`}
              className="bg-white rounded-xl p-3 text-center border border-gray-100 hover:border-green-300 hover:shadow-sm transition-all">
              <div className="text-2xl mb-1">{CATEGORY_ICONS[cat.name] || '🍽️'}</div>
              <p className="text-xs font-medium text-gray-700 leading-tight">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Today */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Popular Today</h2>
          <Link href="/student/menu" className="text-green-700 text-sm font-medium flex items-center gap-1">
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {popular.map(food => (
            <FoodCard key={food.id} food={food} onAdd={() => handleAdd(food)} />
          ))}
        </div>
      </section>

      {/* Quick Bites */}
      {quick.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">⚡ Quick Bites</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {quick.map(food => (
              <FoodCard key={food.id} food={food} onAdd={() => handleAdd(food)} />
            ))}
          </div>
        </section>
      )}

      {/* Canteen info */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
          <MapPin className="w-5 h-5 text-green-700" />
        </div>
        <div>
          <p className="font-semibold text-sm text-gray-900">Main College Canteen</p>
          <p className="text-xs text-gray-500">Ground Floor, Main Block · Open 8 AM – 8 PM</p>
        </div>
      </div>
    </div>
  );
}

function FoodCard({ food, onAdd }: { food: FoodItem; onAdd: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden card-hover">
      <Link href={`/student/menu/${food.id}`} className="block">
        <div className="relative h-32 bg-gray-100">
          <img
            src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
            alt={food.name}
            className="w-full h-full object-cover"
          />
          {food.vegetarian && (
            <span className="absolute top-2 left-2 bg-white text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-300">
              VEG
            </span>
          )}
          {!food.available && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-700 text-xs font-bold px-2 py-1 rounded">Unavailable</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm text-gray-900 leading-tight mb-1">{food.name}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{food.rating}</span>
            <span>·</span>
            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{food.preparationTime}m</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900">₹{food.price}</span>
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <button
          onClick={onAdd}
          disabled={!food.available}
          className="w-full py-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
    </div>
  );
}
