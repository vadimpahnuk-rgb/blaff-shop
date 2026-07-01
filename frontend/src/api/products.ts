import client, { num } from './client';
import type { Product } from '../types';

export interface ProductsParams {
  category_id?: number;
  search?: string;
  tag?: string;
}

export async function getProducts(params?: ProductsParams): Promise<Product[]> {
  const response = await client.get<Product[]>('/products', { params });
  return response.data.map((p) => ({ ...p, price: num(p.price) }));
}

export async function getProduct(id: number): Promise<Product> {
  const response = await client.get<Product>(`/products/${id}`);
  return { ...response.data, price: num(response.data.price) };
}

export async function purchaseProduct(
  productId: number,
  quantity: number = 1
): Promise<{ purchase_id: number; product_data: string; quantity: number }> {
  const response = await client.post(`/purchase/${productId}`, { quantity });
  // Backend responds { success, purchase: { id, data, quantity, ... } }.
  const purchase = response.data?.purchase ?? {};
  return {
    purchase_id: purchase.id,
    product_data: purchase.data ?? '',
    quantity: purchase.quantity ?? quantity,
  };
}

export async function getPurchaseData(id: number): Promise<{ product_data: string }> {
  const response = await client.get(`/purchase/${id}/data`);
  return response.data;
}
