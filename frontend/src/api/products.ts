import client from './client';
import type { Product } from '../types';

export interface ProductsParams {
  category_id?: number;
  search?: string;
  tag?: string;
}

export async function getProducts(params?: ProductsParams): Promise<Product[]> {
  const response = await client.get<Product[]>('/products', { params });
  return response.data;
}

export async function getProduct(id: number): Promise<Product> {
  const response = await client.get<Product>(`/products/${id}`);
  return response.data;
}

export async function purchaseProduct(productId: number): Promise<{ purchase_id: number; product_data: string }> {
  const response = await client.post(`/purchase/${productId}`);
  return response.data;
}

export async function getPurchaseData(id: number): Promise<{ product_data: string }> {
  const response = await client.get(`/purchase/${id}/data`);
  return response.data;
}
