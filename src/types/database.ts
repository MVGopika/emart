export type UserRole = 'admin' | 'shopkeeper' | 'user';
export type AccountStatus = 'pending' | 'approved' | 'rejected';
export type ShopType = 'retail' | 'wholesale' | 'service' | 'restaurant' | 'other';
export type OrderType = 'spot_billing' | 'advance_order';
export type OrderStatus = 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'online';
export type PaymentStatus = 'pending' | 'completed' | 'failed';
export type DeliveryType = 'pickup' | 'delivery';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  address?: string;
  role: UserRole;
  status: AccountStatus;
  id_proof_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  shopkeeper_id: string;
  shop_name: string;
  shop_type: ShopType;
  description?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email?: string;
  logo_url?: string;
  opening_hours?: string;
  is_active: boolean;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  shop_id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  discount_percentage: number;
  final_price: number;
  quantity: number;
  unit: string;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  shop_id: string;
  order_type: OrderType;
  status: OrderStatus;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  delivery_type: DeliveryType;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Feedback {
  id: string;
  user_id: string;
  shop_id: string;
  order_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
}
