'use client';
import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { name: 'South Indian', description: 'Dosa, Idli, and more', imageUrl: '🥞' },
  { name: 'Indian Mains', description: 'Authentic Indian curries', imageUrl: '🍛' },
  { name: 'Snacks', description: 'Quick bites and street food', imageUrl: '🥟' },
  { name: 'Drinks', description: 'Beverages and shakes', imageUrl: '🥤' },
  { name: 'Desserts', description: 'Sweet treats', imageUrl: '🍰' },
  { name: 'Breakfast', description: 'Morning meals', imageUrl: '🌅' },
];

const DEMO_USERS = [
  { email: 'admin@canteen.edu', password: 'admin123', name: 'Admin User', role: 'ADMIN', collegeId: 'ADM001', phone: '9000000001' },
  { email: 'staff1@canteen.edu', password: 'staff123', name: 'Staff Member', role: 'STAFF', collegeId: 'STF001', phone: '9000000002' },
  { email: 'aaron@college.edu', password: 'student123', name: 'Aaron Thomas', role: 'STUDENT', collegeId: 'CS2021001', phone: '9876543210' },
];

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string[]>([]);
  const [diagResult, setDiagResult] = useState('');

  const log = (msg: string) => setStatus(prev => [...prev, msg]);

  const runDiagnostics = async () => {
    setDiagResult('Running...');
    try {
      const snap = await getDocs(collection(db, 'test_ping'));
      setDiagResult(`✅ Firestore connected (${snap.size} docs in test_ping). API Key is valid.`);
    } catch (err: any) {
      setDiagResult(`❌ Firestore error: ${err.code} — ${err.message}`);
    }
  };

  const testAuth = async () => {
    try {
      // Try creating a throwaway account (will fail if auth not enabled)
      await createUserWithEmailAndPassword(auth, `test_${Date.now()}@test.com`, 'test123456');
      setDiagResult('✅ Firebase Auth is enabled!');
    } catch (err: any) {
      setDiagResult(`Auth test: ${err.code} — ${err.message}`);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    setStatus([]);
    try {
      // 1. Create Categories
      log('Creating categories...');
      const catRefs: Record<string, string> = {};
      for (const c of CATEGORIES) {
        const newRef = doc(collection(db, 'categories'));
        const cat = { ...c, id: newRef.id };
        await setDoc(newRef, cat);
        catRefs[c.name] = newRef.id;
        log(`✅ Category: ${c.name}`);
      }

      // 2. Create food items
      log('Creating food items...');
      const foods = [
        { name: 'Masala Dosa', description: 'Crispy crepe with spiced potato filling', price: 60, categoryName: 'South Indian', imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600', available: true, vegetarian: true, preparationTime: 10, ingredients: 'Rice, Urad Dal, Potato', allergens: 'None', rating: 4.8, totalRatings: 120 },
        { name: 'Idli (3 pcs)', description: 'Steamed rice cakes with sambar', price: 40, categoryName: 'South Indian', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600', available: true, vegetarian: true, preparationTime: 8, ingredients: 'Rice, Urad Dal', allergens: 'None', rating: 4.6, totalRatings: 90 },
        { name: 'Paneer Butter Masala', description: 'Rich tomato gravy with paneer', price: 120, categoryName: 'Indian Mains', imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600', available: true, vegetarian: true, preparationTime: 15, ingredients: 'Paneer, Tomato, Butter', allergens: 'Dairy', rating: 4.9, totalRatings: 85 },
        { name: 'Dal Tadka', description: 'Yellow lentils with aromatic tempering', price: 80, categoryName: 'Indian Mains', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600', available: true, vegetarian: true, preparationTime: 10, ingredients: 'Dal, Ghee, Spices', allergens: 'None', rating: 4.5, totalRatings: 110 },
        { name: 'Samosa (2 pcs)', description: 'Crispy pastry with spiced potato', price: 30, categoryName: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600', available: true, vegetarian: true, preparationTime: 5, ingredients: 'Flour, Potato, Peas', allergens: 'Gluten', rating: 4.6, totalRatings: 210 },
        { name: 'Vada Pav', description: 'Spiced potato fritter in a bun', price: 25, categoryName: 'Snacks', imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600', available: true, vegetarian: true, preparationTime: 5, ingredients: 'Potato, Bread, Chutney', allergens: 'Gluten', rating: 4.7, totalRatings: 180 },
        { name: 'Cold Coffee', description: 'Thick blended coffee with ice cream', price: 50, categoryName: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1461023058943-0708e526a72e?w=600', available: true, vegetarian: true, preparationTime: 5, ingredients: 'Milk, Coffee, Ice Cream', allergens: 'Dairy', rating: 4.7, totalRatings: 90 },
        { name: 'Mango Lassi', description: 'Refreshing yogurt mango drink', price: 45, categoryName: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600', available: true, vegetarian: true, preparationTime: 5, ingredients: 'Yogurt, Mango, Sugar', allergens: 'Dairy', rating: 4.8, totalRatings: 130 },
        { name: 'Gulab Jamun (2 pcs)', description: 'Deep fried milk balls in sugar syrup', price: 40, categoryName: 'Desserts', imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600', available: true, vegetarian: true, preparationTime: 2, ingredients: 'Khoya, Sugar, Flour', allergens: 'Dairy, Gluten', rating: 4.9, totalRatings: 150 },
        { name: 'Poha', description: 'Flattened rice with vegetables', price: 35, categoryName: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=600', available: true, vegetarian: true, preparationTime: 7, ingredients: 'Flattened Rice, Onion, Spices', allergens: 'None', rating: 4.4, totalRatings: 75 },
      ];

      for (const f of foods) {
        const catId = catRefs[f.categoryName] || '';
        const newRef = doc(collection(db, 'foods'));
        await setDoc(newRef, { ...f, id: newRef.id, categoryId: catId });
        log(`✅ Food: ${f.name}`);
      }

      // 3. Create demo users
      log('Creating demo users...');
      for (const u of DEMO_USERS) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, u.email, u.password);
          await setDoc(doc(db, 'users', cred.user.uid), {
            id: cred.user.uid, name: u.name, email: u.email,
            role: u.role, collegeId: u.collegeId, phone: u.phone,
            createdAt: new Date().toISOString()
          });
          log(`✅ User: ${u.email} (${u.role})`);
        } catch (e: any) {
          log(`⚠️ User ${u.email}: ${e.code} (may already exist — OK)`);
        }
      }

      log('✅ Seeding complete!');
      toast.success('Database seeded successfully!');
    } catch (err: any) {
      const msg = `❌ Error: ${err.code} — ${err.message}`;
      log(msg);
      console.error('Seed error:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto">
        <div className="bg-white p-8 rounded-xl shadow-sm mb-4">
          <h1 className="text-2xl font-bold mb-2">🌱 Database Seeder</h1>
          <p className="text-gray-500 text-sm mb-6">Creates 6 categories, 10 food items, and 3 demo users in Firestore.</p>

          <div className="flex gap-3 mb-6">
            <button onClick={runDiagnostics}
              className="flex-1 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:border-blue-500 transition-colors">
              Test Firestore
            </button>
            <button onClick={testAuth}
              className="flex-1 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:border-blue-500 transition-colors">
              Test Auth
            </button>
          </div>

          {diagResult && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm font-mono break-all">
              {diagResult}
            </div>
          )}

          <button onClick={handleSeed} disabled={loading}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition-colors">
            {loading ? '⏳ Seeding...' : '🚀 Seed All Data'}
          </button>
        </div>

        {status.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="font-bold mb-3 text-sm">Progress:</h2>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {status.map((s, i) => (
                <p key={i} className="text-sm font-mono text-gray-700">{s}</p>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
          <p className="font-bold text-amber-800 mb-2">⚠️ Before seeding, make sure:</p>
          <ul className="text-amber-700 space-y-1 list-disc list-inside">
            <li>Firebase Authentication → Email/Password is <strong>ENABLED</strong></li>
            <li>Firestore Database is created in <strong>Test Mode</strong></li>
          </ul>
          <p className="text-amber-700 mt-2 text-xs">Use the "Test Firestore" and "Test Auth" buttons above to diagnose issues.</p>
        </div>

        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
          <p className="font-bold text-green-800 mb-1">Demo Credentials (after seeding):</p>
          <p className="font-mono text-green-700">admin@canteen.edu / admin123</p>
          <p className="font-mono text-green-700">staff1@canteen.edu / staff123</p>
          <p className="font-mono text-green-700">aaron@college.edu / student123</p>
        </div>
      </div>
    </div>
  );
}
