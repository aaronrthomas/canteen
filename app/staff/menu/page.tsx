'use client';
import { useEffect, useState } from 'react';
import { foodApi, categoryApi } from '@/lib/api';
import { FoodItem, Category } from '@/lib/types';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';

export default function StaffMenuPage() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FoodItem | null>(null);

  const emptyForm = { name: '', description: '', price: 0, categoryId: '', imageUrl: '', preparationTime: 10, available: true, vegetarian: false, ingredients: '', allergens: '' };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([foodApi.getAll(), categoryApi.getAll()])
      .then(([f, c]) => { setFoods(f); setCategories(c); })
      .finally(() => setLoading(false));
  }, []);

  const openEdit = (food: FoodItem) => {
    setEditing(food);
    setForm({ name: food.name, description: food.description, price: food.price, categoryId: food.categoryId, imageUrl: food.imageUrl, preparationTime: food.preparationTime, available: food.available, vegetarian: food.vegetarian, ingredients: food.ingredients, allergens: food.allergens });
    setShowForm(true);
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await foodApi.update(editing.id, form as any);
        setFoods(prev => prev.map(f => f.id === editing.id ? updated : f));
        toast.success('Food item updated!');
      } else {
        const created = await foodApi.create(form as any);
        setFoods(prev => [...prev, created]);
        toast.success('Food item added!');
      }
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await foodApi.delete(id);
      setFoods(prev => prev.filter(f => f.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await foodApi.toggleAvailability(id);
      setFoods(prev => prev.map(f => f.id === id ? updated : f));
    } catch { toast.error('Failed to toggle'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#16a34a] text-white font-semibold rounded-lg text-sm hover:bg-[#15803d] transition-colors">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Item', 'Category', 'Price', 'Prep Time', 'Type', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {foods.map(food => (
                <tr key={food.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={food.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60'} alt={food.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold text-gray-900">{food.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[150px]">{food.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{food.categoryName}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">₹{food.price}</td>
                  <td className="px-4 py-3 text-gray-600">{food.preparationTime} min</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${food.vegetarian ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {food.vegetarian ? 'Veg' : 'Non-Veg'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(food.id)} className="flex items-center gap-1.5 text-xs font-medium">
                      {food.available
                        ? <><ToggleRight className="w-5 h-5 text-green-600" /><span className="text-green-600">Available</span></>
                        : <><ToggleLeft className="w-5 h-5 text-gray-400" /><span className="text-gray-400">Unavailable</span></>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(food)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(food.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-bold text-lg text-gray-900">{editing ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Price (₹) *</label>
                  <input type="number" min="1" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-600" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Prep Time (min)</label>
                  <input type="number" min="1" value={form.preparationTime} onChange={e => setForm({...form, preparationTime: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-600" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                  <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-600">
                    <option value="">Select category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
                  <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-600" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-600 resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Ingredients</label>
                  <input value={form.ingredients} onChange={e => setForm({...form, ingredients: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-600" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Allergens</label>
                  <input value={form.allergens} onChange={e => setForm({...form, allergens: e.target.value})} placeholder="e.g. Gluten, Dairy"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-600" />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="veg" checked={form.vegetarian} onChange={e => setForm({...form, vegetarian: e.target.checked})} className="accent-green-600" />
                  <label htmlFor="veg" className="text-sm text-gray-700">Vegetarian</label>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="avail" checked={form.available} onChange={e => setForm({...form, available: e.target.checked})} className="accent-green-600" />
                  <label htmlFor="avail" className="text-sm text-gray-700">Available</label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-[#16a34a] text-white font-semibold rounded-lg text-sm hover:bg-[#15803d] transition-colors disabled:opacity-60">
                  {saving ? 'Saving...' : editing ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
