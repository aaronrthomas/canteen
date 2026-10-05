'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Star, Clock, Plus, X, Leaf } from 'lucide-react';
import { foodApi, categoryApi } from '@/lib/api';
import { FoodItem, Category } from '@/lib/types';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function MenuPage() {
  const searchParams = useSearchParams();
  const { addItem } = useCartStore();

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('categoryId') || null
  );
  const [vegOnly, setVegOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(true);
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc'>('rating');

  useEffect(() => {
    categoryApi.getAll().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    foodApi.getAll({
      search: search || undefined,
      categoryId: selectedCategory || undefined,
      vegetarian: vegOnly || undefined,
      available: availableOnly || undefined,
    }).then(data => {
      const sorted = [...data].sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'price_asc') return a.price - b.price;
        return b.price - a.price;
      });
      setFoods(sorted);
    }).finally(() => setLoading(false));
  }, [search, selectedCategory, vegOnly, availableOnly, sortBy]);

  const handleAdd = (food: FoodItem) => {
    addItem(food);
    toast.success(`${food.name} added to cart`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Menu</h1>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search food, drinks or snacks..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-green-600 focus:ring-2 focus:ring-green-100 outline-none text-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        {/* Category chips */}
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
            ${!selectedCategory ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200'}`}>
          All
        </button>
        {categories.map(cat => (
          <button key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
              ${selectedCategory === cat.id ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200'}`}>
            {cat.name}
          </button>
        ))}

        <div className="h-5 w-px bg-gray-200 flex-shrink-0 mx-1" />

        <button
          onClick={() => setVegOnly(!vegOnly)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors
            ${vegOnly ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200'}`}>
          <Leaf className="w-3 h-3" /> Veg
        </button>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 outline-none">
          <option value="rating">Top Rated</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-500 mb-4">
        {loading ? 'Loading...' : `${foods.length} item${foods.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Food Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-32 bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : foods.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🍽️</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No items found</h3>
          <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search term</p>
          <button onClick={() => { setSearch(''); setSelectedCategory(null); setVegOnly(false); }}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {foods.map(food => (
            <div key={food.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden card-hover">
              <Link href={`/student/menu/${food.id}`} className="block">
                <div className="relative h-32 bg-gray-100">
                  <img src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                    alt={food.name} className="w-full h-full object-cover" />
                  {food.vegetarian && (
                    <span className="absolute top-2 left-2 bg-white text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-300">VEG</span>
                  )}
                  {!food.available && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-white text-gray-700 text-xs font-bold px-2 py-1 rounded">Unavailable</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-gray-900 leading-tight mb-1 line-clamp-1">{food.name}</h3>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-1">{food.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{food.rating}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{food.preparationTime}m</span>
                  </div>
                </div>
              </Link>
              <div className="flex items-center justify-between px-3 pb-3">
                <span className="font-bold text-gray-900 text-sm">₹{food.price}</span>
                <button
                  onClick={() => handleAdd(food)}
                  disabled={!food.available}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
