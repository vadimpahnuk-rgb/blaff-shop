import client from './client';
import type { User } from '../types';

export async function initAuth(): Promise<User> {
  const response = await client.post<User>('/auth/init');
  return response.data;
}
