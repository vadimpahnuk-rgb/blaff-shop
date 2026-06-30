import client from './client';
import type { Product, User, Transaction, AdminStats } from '../types';

export async function getAdminProducts(): Promise<Product[]> {
  const response = await client.get<Product[]>('/admin/products');
  return response.data;
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const response = await client.post<Product>('/admin/products', data);
  return response.data;
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<Product> {
  const response = await client.put<Product>(`/admin/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await client.delete(`/admin/products/${id}`);
}

export async function restockProduct(id: number, quantity: number): Promise<Product> {
  const response = await client.post<Product>(`/admin/products/${id}/restock`, { quantity });
  return response.data;
}

export async function giveProduct(productId: number, userId: number): Promise<void> {
  await client.post(`/admin/products/${productId}/give`, { user_id: userId });
}

export async function getAdminUsers(): Promise<User[]> {
  const response = await client.get<User[]>('/admin/users');
  return response.data;
}

export async function updateUserRole(id: number, role: string): Promise<User> {
  const response = await client.put<User>(`/admin/users/${id}/role`, { role });
  return response.data;
}

export async function updateUserBalance(id: number, balance: number): Promise<User> {
  const response = await client.put<User>(`/admin/users/${id}/balance`, { balance });
  return response.data;
}

export async function getAdminTransactions(): Promise<Transaction[]> {
  const response = await client.get<Transaction[]>('/admin/transactions');
  return response.data;
}

export async function getAdminStats(): Promise<AdminStats> {
  const response = await client.get<AdminStats>('/admin/stats');
  return response.data;
}
