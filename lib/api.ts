import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { User, FoodItem, Category, Order, DashboardStats } from './types';

// =======================
// AUTH
// =======================
export const authApi = {
  register: async (data: any) => {
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    await updateProfile(cred.user, { displayName: data.name });
    
    const userDoc: User = {
      id: cred.user.uid,
      name: data.name,
      email: data.email,
      role: 'STUDENT',
      collegeId: data.collegeId,
      phone: data.phone || '',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', cred.user.uid), userDoc);
    return { token: await cred.user.getIdToken(), user: userDoc };
  },

  login: async (data: any) => {
    const cred = await signInWithEmailAndPassword(auth, data.email, data.password);
    const userSnap = await getDoc(doc(db, 'users', cred.user.uid));
    if (!userSnap.exists()) throw new Error('User data not found');
    return { token: await cred.user.getIdToken(), user: userSnap.data() as User };
  },

  getMe: async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not logged in');
    const userSnap = await getDoc(doc(db, 'users', user.uid));
    if (!userSnap.exists()) throw new Error('User data not found');
    return userSnap.data() as User;
  },
  
  logout: async () => {
    await signOut(auth);
  }
};

// =======================
// FOOD
// =======================
export const foodApi = {
  getAll: async (params?: any) => {
    let q = query(collection(db, 'foods'));
    const snapshot = await getDocs(q);
    let foods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FoodItem));

    if (params) {
      if (params.search) {
        const s = params.search.toLowerCase();
        foods = foods.filter(f => f.name.toLowerCase().includes(s) || f.description?.toLowerCase().includes(s));
      }
      if (params.categoryId) {
        foods = foods.filter(f => f.categoryId === params.categoryId.toString());
      }
      if (params.vegetarian !== undefined) {
        foods = foods.filter(f => f.vegetarian === params.vegetarian);
      }
      if (params.available !== undefined) {
        foods = foods.filter(f => f.available === params.available);
      }
    }
    return foods;
  },

  getById: async (id: string | number) => {
    const snap = await getDoc(doc(db, 'foods', id.toString()));
    if (!snap.exists()) throw new Error('Food not found');
    return { id: snap.id, ...snap.data() } as FoodItem;
  },

  create: async (data: any) => {
    const newRef = doc(collection(db, 'foods'));
    const food = { ...data, id: newRef.id };
    await setDoc(newRef, food);
    return food;
  },

  update: async (id: string | number, data: any) => {
    await updateDoc(doc(db, 'foods', id.toString()), data);
    const snap = await getDoc(doc(db, 'foods', id.toString()));
    return { id: snap.id, ...snap.data() } as FoodItem;
  },

  delete: async (id: string | number) => {
    await deleteDoc(doc(db, 'foods', id.toString()));
  },

  toggleAvailability: async (id: string | number) => {
    const snap = await getDoc(doc(db, 'foods', id.toString()));
    const current = snap.data()?.available || false;
    await updateDoc(doc(db, 'foods', id.toString()), { available: !current });
    const newSnap = await getDoc(doc(db, 'foods', id.toString()));
    return { id: newSnap.id, ...newSnap.data() } as FoodItem;
  }
};

// =======================
// CATEGORIES
// =======================
export const categoryApi = {
  getAll: async () => {
    const snapshot = await getDocs(query(collection(db, 'categories')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  },
  
  create: async (data: any) => {
    const newRef = doc(collection(db, 'categories'));
    const cat = { ...data, id: newRef.id };
    await setDoc(newRef, cat);
    return cat;
  },
  
  update: async (id: string | number, data: any) => {
    await updateDoc(doc(db, 'categories', id.toString()), data);
    const snap = await getDoc(doc(db, 'categories', id.toString()));
    return { id: snap.id, ...snap.data() } as Category;
  },
  
  delete: async (id: string | number) => {
    await deleteDoc(doc(db, 'categories', id.toString()));
  }
};

// =======================
// ORDERS
// =======================
export const orderApi = {
  create: async (data: any) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not logged in');
    const userSnap = await getDoc(doc(db, 'users', user.uid));
    const userData = userSnap.data() as User;

    // Calculate totals server-side (in this case, client-side since it's firebase client SDK)
    let subtotal = 0;
    const items = await Promise.all(data.items.map(async (i: any) => {
      const foodSnap = await getDoc(doc(db, 'foods', i.foodItemId.toString()));
      const food = foodSnap.data() as FoodItem;
      const total = food.price * i.quantity;
      subtotal += total;
      return {
        id: food.id,
        foodItemId: food.id,
        foodItemName: food.name,
        foodItemImage: food.imageUrl,
        quantity: i.quantity,
        price: food.price,
        total: total
      };
    }));

    const tax = subtotal * 0.05;
    const totalAmount = subtotal + tax;
    const orderNumber = 'CN' + Math.floor(1000 + Math.random() * 9000);

    const newRef = doc(collection(db, 'orders'));
    const order = {
      id: newRef.id,
      orderNumber,
      userId: user.uid,
      userName: userData.name,
      userEmail: userData.email,
      items,
      subtotal,
      tax,
      totalAmount,
      status: 'PENDING',
      paymentMethod: data.paymentMethod,
      pickupTime: data.pickupTime,
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(newRef, order);
    return order as Order;
  },

  getMyOrders: async () => {
    const user = auth.currentUser;
    if (!user) return [];
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  },

  getById: async (id: string | number) => {
    const snap = await getDoc(doc(db, 'orders', id.toString()));
    if (!snap.exists()) throw new Error('Order not found');
    return { id: snap.id, ...snap.data() } as Order;
  }
};

// =======================
// STAFF
// =======================
export const staffApi = {
  getActiveOrders: async () => {
    const q = query(collection(db, 'orders'), where('status', 'in', ['PENDING', 'ACCEPTED', 'PREPARING', 'READY']));
    const snapshot = await getDocs(q);
    let orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  updateStatus: async (orderId: string | number, status: string) => {
    await updateDoc(doc(db, 'orders', orderId.toString()), { 
      status, 
      updatedAt: new Date().toISOString() 
    });
    const snap = await getDoc(doc(db, 'orders', orderId.toString()));
    return { id: snap.id, ...snap.data() } as Order;
  }
};

// =======================
// ADMIN
// =======================
export const adminApi = {
  getDashboard: async () => {
    // Note: Doing this client-side for Firebase isn't ideal for large apps, 
    // but works for this scale. In production, use Cloud Functions.
    const usersSnap = await getDocs(collection(db, 'users'));
    const ordersSnap = await getDocs(collection(db, 'orders'));
    
    const orders = ordersSnap.docs.map(d => d.data() as Order);
    
    // Simplistic "today" logic
    const todayStr = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.createdAt.startsWith(todayStr));
    
    const todaysRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const averageOrderValue = todayOrders.length > 0 ? todaysRevenue / todayOrders.length : 0;
    
    return {
      totalUsers: usersSnap.size,
      todaysOrders: todayOrders.length,
      todaysRevenue,
      averageOrderValue,
      pendingOrders: orders.filter(o => o.status === 'PENDING').length,
      preparingOrders: orders.filter(o => o.status === 'PREPARING' || o.status === 'ACCEPTED').length,
      readyOrders: orders.filter(o => o.status === 'READY').length,
    } as DashboardStats;
  },

  getUsers: async () => {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  updateUserRole: async (id: string | number, role: string) => {
    await updateDoc(doc(db, 'users', id.toString()), { role });
    const snap = await getDoc(doc(db, 'users', id.toString()));
    return { id: snap.id, ...snap.data() };
  },

  getAllOrders: async () => {
    const snapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  }
};
