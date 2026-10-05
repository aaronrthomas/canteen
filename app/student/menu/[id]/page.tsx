'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, Clock, Leaf, Plus, Minus, ShoppingCart } from 'lucide-react';
import { foodApi } from '@/lib/api';
import { FoodItem } from '@/lib/types';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function FoodDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem, items } = useCartStore();

  const [food, setFood] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const cartItem = items.find(i => i.food.id === id);

  useEffect(() => {
    foodApi.getById(id)
      .then(setFood)
      .catch(() => toast.error('Food not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-pulse">
      <div className="h-64 bg-gray-200 rounded-2xl mb-6" />
      <div className="space-y-3">
        <div className="h-7 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-20 bg-gray-200 rounded" />
      </div>
    </div>
  );

  if (!food) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addItem(food, 1);
    toast.success(`${quantity}× ${food.name} added to cart!`);
    router.back();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Image */}
      <div className="relative h-72 bg-gray-200">
        <img src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
          alt={food.name} className="w-full h-full object-cover" />
        <button onClick={() => router.back()}
          className="absolute top-4 left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
          <ArrowLeft className="w-5 h-5" />
        </button>
        {food.vegetarian && (
          <span className="absolute top-4 right-4 bg-white text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-300 flex items-center gap-1">
            <Leaf className="w-3 h-3" /> Vegetarian
          </span>
        )}
      </div>

      <div className="px-4 py-6">
        {/* Title & meta */}
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{food.name}</h1>
          <span className="text-2xl font-bold text-green-700">₹{food.price}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-medium text-gray-700">{food.rating}</span>
            <span>({food.totalRatings} ratings)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> {food.preparationTime} min
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${food.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {food.available ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-6">{food.description}</p>

        {/* Ingredients */}
        {food.ingredients && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">Ingredients</h3>
            <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">{food.ingredients}</p>
          </div>
        )}

        {/* Allergens */}
        {food.allergens && food.allergens !== 'None' && (
          <div className="mb-6 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-semibold text-amber-800 mb-1">⚠️ Allergen Information</p>
            <p className="text-xs text-amber-700">Contains: {food.allergens}</p>
          </div>
        )}

        {/* Quantity */}
        <div className="flex items-center justify-between mb-6">
          <span className="font-semibold text-gray-900">Quantity</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-green-600 transition-colors">
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-lg w-6 text-center">{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          disabled={!food.available}
          className="w-full py-4 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2 text-base">
          <ShoppingCart className="w-5 h-5" />
          Add to Cart · ₹{food.price * quantity}
        </button>

        {cartItem && (
          <p className="text-center text-sm text-green-600 mt-3">
            ✓ {cartItem.quantity} already in cart
          </p>
        )}
      </div>
    </div>
  );
}
