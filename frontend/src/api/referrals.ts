import client, { num } from './client';
import type { ReferralStats } from '../types';

export async function getReferralStats(): Promise<ReferralStats> {
  const response = await client.get<ReferralStats>('/user/referrals/stats');
  const d = response.data;
  return {
    ...d,
    referral_balance: num(d.referral_balance),
    total_earned: num(d.total_earned),
  };
}

export async function withdrawReferralBalance(): Promise<{
  balance: number;
  referral_balance: number;
}> {
  const response = await client.post('/user/referrals/withdraw');
  return {
    balance: num(response.data.balance),
    referral_balance: num(response.data.referral_balance),
  };
}
