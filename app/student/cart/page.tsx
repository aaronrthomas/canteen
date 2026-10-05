'use client';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, Clock, MapPin } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useState } from 'react';

const TAX_RATE = 0.05;
const PICKUP_TIMES = ['ASAP', '10 minutes', '20 minutes', '30 minutes'];

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore();
  const [pickupTime, setPickupTime] = useState('ASAP');

  const subtotal = items.reduce((sum, i) => sum + i.food.price * i.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  if (items.length === 0) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingBag className="w-10 h-10 text-gray-300" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 text-sm mb-8">Looks like you haven't added anything yet.</p>
      <Link href="/student/menu"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#16a34a] text-white font-semibold rounded-xl hover:bg-[#15803d] transition-colors">
        Explore Menu
      </Link>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

      {/* Items */}
      <div className="space-y-3 mb-6">
        {items.map(({ food, quantity }) => (
          <div key={food.id} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3">
            <img src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
              alt={food.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 leading-tight">{food.name}</h3>
              <p className="text-green-700 font-bold text-sm mt-0.5">₹{food.price} each</p>
              <div className="flex items-center gap-3 mt-2">
                <button onClick={() => updateQuantity(food.id, quantity - 1)}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-red-400 transition-colors">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-sm w-4 text-center">{quantity}</span>
                <button onClick={() => updateQuantity(food.id, quantity + 1)}
                  className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button onClick={() => removeItem(food.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
              <span className="font-bold text-gray-900 text-sm">₹{food.price * quantity}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pickup Location */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-green-700" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Pickup Location</p>
            <p className="font-semibold text-sm text-gray-900">Main College Canteen</p>
          </div>
        </div>
      </div>

      {/* Pickup Time */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-green-700" />
          <span className="font-semibold text-sm text-gray-900">Pickup Time</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PICKUP_TIMES.map(t => (
            <button key={t} onClick={() => setPickupTime(t)}
              className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors
                ${pickupTime === t ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>GST (5%)</span><span>₹{tax.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
            <span>Total</span><span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Link
        href={`/student/checkout?pickup=${encodeURIComponent(pickupTime)}`}
        className="block w-full py-4 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-center rounded-xl transition-colors">
        Proceed to Checkout · ₹{total.toFixed(2)}
      </Link>
    </div>
  );
}
