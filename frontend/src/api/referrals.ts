import client from './client';
import type { ReferralStats } from '../types';

export async function getReferralStats(): Promise<ReferralStats> {
  const response = await client.get<ReferralStats>('/user/referrals/stats');
  return response.data;
}

export async function withdrawReferralBalance(): Promise<{
  balance: number;
  referral_balance: number;
}> {
  const response = await client.post('/user/referrals/withdraw');
  return response.data;
}
