import client from './client';
import type { Withdrawal } from '../types';

export async function requestWithdrawal(amount: number, walletAddress: string): Promise<Withdrawal> {
  const response = await client.post('/user/withdrawals', { amount, wallet_address: walletAddress });
  return response.data;
}

export async function getWithdrawals(): Promise<Withdrawal[]> {
  const response = await client.get('/user/withdrawals');
  return response.data;
}
