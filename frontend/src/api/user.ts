import client, { num } from './client';
import type { Purchase, DepositResponse } from '../types';

export async function getBalance(): Promise<{ balance: number }> {
  const response = await client.get('/user/balance');
  return { balance: num(response.data.balance) };
}

export async function getPurchases(): Promise<Purchase[]> {
  const response = await client.get<Purchase[]>('/user/purchases');
  return response.data.map((p) => ({ ...p, price: num(p.price) }));
}

export async function createDeposit(amount: number): Promise<DepositResponse> {
  const response = await client.post<DepositResponse>('/deposit', { amount });
  const d = response.data;
  return {
    ...d,
    amount: num(d.amount),
    pay_amount: d.pay_amount != null ? num(d.pay_amount) : d.pay_amount,
  };
}
