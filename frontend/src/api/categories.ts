import client from './client';
import type { Category } from '../types';

export async function getCategories(): Promise<Category[]> {
  const response = await client.get<Category[]>('/categories');
  return response.data;
}
