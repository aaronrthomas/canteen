'use client';
import { useEffect, useState } from 'react';
import { categoryApi } from '@/lib/api';
import { Category } from '@/lib/types';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', description: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    categoryApi.getAll().then(setCategories).finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', imageUrl: '' }); setShowForm(true); };
  const openEdit = (cat: Category) => { setEditing(cat); setForm({ name: cat.name, description: cat.description, imageUrl: cat.imageUrl }); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await categoryApi.update(editing.id, form);
        setCategories(prev => prev.map(c => c.id === editing.id ? updated : c));
        toast.success('Category updated!');
      } else {
        const created = await categoryApi.create(form);
        setCategories(prev => [...prev, created]);
        toast.success('Category added!');
      }
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await categoryApi.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#16a34a] text-white font-semibold rounded-lg text-sm hover:bg-[#15803d] transition-colors">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="text-3xl mb-2">{cat.imageUrl?.length <= 4 ? cat.imageUrl : '🍽️'}</div>
              <h3 className="font-bold text-gray-900 mb-0.5">{cat.name}</h3>
              <p className="text-xs text-gray-400 mb-3 line-clamp-1">{cat.description}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(cat)} className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleDelete(cat.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Icon (emoji or URL)</label>
                <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="🍳 or https://..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-green-600" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-[#16a34a] text-white font-semibold rounded-lg text-sm disabled:opacity-60">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
