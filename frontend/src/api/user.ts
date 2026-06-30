import client from './client';
import type { Purchase, DepositResponse } from '../types';

export async function getBalance(): Promise<{ balance: number }> {
  const response = await client.get('/user/balance');
  return response.data;
}

export async function getPurchases(): Promise<Purchase[]> {
  const response = await client.get<Purchase[]>('/user/purchases');
  return response.data;
}

export async function createDeposit(amount: number): Promise<DepositResponse> {
  const response = await client.post<DepositResponse>('/deposit', { amount });
  return response.data;
}
