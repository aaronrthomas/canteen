// Shared TypeScript types for the Canteen app

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
  collegeId: string;
  phone?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName: string;
  imageUrl: string;
  available: boolean;
  vegetarian: boolean;
  preparationTime: number;
  rating: number;
  totalRatings: number;
  ingredients: string;
  allergens: string;
}

export interface CartItem {
  food: FoodItem;
  quantity: number;
}

export interface OrderItem {
  id: string;
  foodItemId: string;
  foodItemName: string;
  foodItemImage: string;
  quantity: number;
  price: number;
  total: number;
}

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  pickupTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  todaysOrders: number;
  todaysRevenue: number;
  averageOrderValue: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
}
