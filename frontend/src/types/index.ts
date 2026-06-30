export interface User {
  id: number;
  telegram_id: number;
  first_name: string;
  username?: string;
  balance: number;
  role: 'user' | 'admin';
  created_at: string;
  is_banned: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  sort_order: number;
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  tags: string[];
  data?: string;
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: 'deposit' | 'purchase';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_id?: string;
  product_id?: number;
  created_at: string;
}

export interface Purchase {
  id: number;
  user_id: number;
  product_id: number;
  product_name?: string;
  product_data?: string;
  price: number;
  created_at: string;
}

export interface DepositResponse {
  transaction_id: number;
  payment_id: string;
  address: string;
  currency: string;
  amount: number;
  qr_code?: string;
}

export interface AdminStats {
  total_users: number;
  total_products: number;
  total_transactions: number;
  sales_today: number;
  sales_week: number;
  sales_month: number;
  top_products: { id: number; name: string; sales: number }[];
}
