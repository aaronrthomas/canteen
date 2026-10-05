'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, Smartphone, Banknote, CheckCircle, Loader2 } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { orderApi } from '@/lib/api';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI', desc: 'Pay via UPI / QR Code', icon: Smartphone },
  { id: 'CARD', label: 'Card', desc: 'Credit / Debit Card', icon: CreditCard },
  { id: 'CASH', label: 'Cash at Counter', desc: 'Pay when you pickup', icon: Banknote },
];

const TAX_RATE = 0.05;

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pickupTime = searchParams.get('pickup') || 'ASAP';
  const { items, clearCart } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderData, setOrderData] = useState<{ id: string; orderNumber: string } | null>(null);

  const subtotal = items.reduce((s, i) => s + i.food.price * i.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const order = await orderApi.create({
        items: items.map(i => ({ foodItemId: i.food.id, quantity: i.quantity })),
        paymentMethod,
        pickupTime,
        notes,
      });
      clearCart();
      setOrderData({ id: order.id, orderNumber: order.orderNumber });
      setSuccess(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success && orderData) return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h2>
      <p className="text-gray-500 text-sm mb-2">Your order has been sent to the canteen</p>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
        <p className="text-xs text-green-700 font-medium mb-1">Order Number</p>
        <p className="text-3xl font-bold text-green-800">#{orderData.orderNumber}</p>
      </div>
      <button
        onClick={() => router.push(`/student/orders/${orderData.id}`)}
        className="w-full py-3 bg-[#16a34a] text-white font-bold rounded-xl hover:bg-[#15803d] transition-colors">
        Track Your Order
      </button>
      <button onClick={() => router.push('/student')}
        className="w-full py-3 text-gray-600 font-medium mt-3 text-sm hover:text-gray-900 transition-colors">
        Back to Home
      </button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Order items */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Order Items</h3>
        <div className="space-y-2">
          {items.map(({ food, quantity }) => (
            <div key={food.id} className="flex justify-between text-sm">
              <span className="text-gray-600">{food.name} × {quantity}</span>
              <span className="font-medium">₹{food.price * quantity}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 text-xs text-gray-500 flex justify-between">
            <span>Pickup: {pickupTime}</span>
            <span>Main College Canteen</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Payment Method</h3>
        <div className="space-y-2">
          {PAYMENT_METHODS.map(({ id, label, desc, icon: Icon }) => (
            <label key={id}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                ${paymentMethod === id ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}>
              <input type="radio" name="payment" value={id}
                checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} className="sr-only" />
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                ${paymentMethod === id ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              {paymentMethod === id && <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />}
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="font-semibold text-gray-900 mb-2 text-sm">Special Instructions</h3>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any special requests? (optional)"
          rows={2}
          className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none resize-none"
        />
      </div>

      {/* Total */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-gray-600"><span>GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
          <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
            <span>Total</span><span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={loading || items.length === 0}
        className="w-full py-4 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : `Place Order · ₹${total.toFixed(2)}`}
      </button>

      <p className="text-center text-xs text-gray-400 mt-4">
        🔒 Mock payment — no real charges
      </p>
    </div>
  );
}
