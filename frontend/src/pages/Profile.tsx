import { useState, useEffect, useCallback } from 'react';
import SEO from '../components/SEO';
import Loading from '../components/Loading';
import { requestWithdrawal, getWithdrawals } from '../api/withdrawals';
import { useAuth } from '../api/auth-context';
import type { Withdrawal } from '../types';

const statusBadge = (s: string) => {
  switch (s) {
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'completed':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'rejected':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-pwa-light text-pwa-gray border-pwa-border/30';
  }
};

const statusLabel: Record<string, string> = {
  pending: 'Очікує',
  completed: 'Виконано',
  rejected: 'Відхилено',
};

export default function Profile() {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const parsedAmount = parseFloat(amount) || 0;
  const fee = parsedAmount * 0.02;
  const netAmount = parsedAmount - fee;

  const loadWithdrawals = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getWithdrawals();
      setWithdrawals(list);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWithdrawals();
  }, [loadWithdrawals]);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!walletAddress || walletAddress.length < 10) {
      setError('Введіть коректну адресу USDT TRC20 гаманця');
      return;
    }
    if (!amount || parsedAmount < 20) {
      setError('Мінімальна сума виведення — $20');
      return;
    }
    if (user && parsedAmount > user.balance) {
      setError('Недостатньо коштів на балансі');
      return;
    }

    setSubmitting(true);
    try {
      await requestWithdrawal(parsedAmount, walletAddress);
      setSuccess('Запит на виведення створено! Очікуйте підтвердження адміністратора.');
      setAmount('');
      setWalletAddress('');
      loadWithdrawals();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Помилка створення запиту');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-5 py-6 animate-fade-in">
      <SEO
        title="Профіль"
        description="Ваш профіль у BLA SHOP — баланс, виведення коштів"
        path="/profile"
        noindex
      />
      <h1 className="text-xl font-bold text-white mb-1">Профіль</h1>
      <p className="text-sm font-medium text-pwa-gray/70 mb-6">Керування акаунтом та виведення коштів</p>

      {/* Balance card */}
      <div className="rounded-2xl border border-pwa-border/50 bg-pwa-dark p-5 mb-4">
        <p className="text-xs font-medium text-pwa-gray/70 mb-2">Ваш баланс</p>
        <p className="text-3xl font-extrabold text-white">
          ${(user?.balance ?? 0).toFixed(2)}
        </p>
      </div>

      {/* Withdrawal form */}
      <div className="rounded-2xl border border-pwa-border/50 bg-pwa-dark p-5 mb-4">
        <h2 className="text-sm font-semibold text-white mb-4">Виведення коштів</h2>

        <div className="mb-4">
          <p className="text-xs font-medium text-pwa-gray/70 mb-2">Адреса USDT TRC20 гаманця</p>
          <input
            type="text"
            placeholder="TВаш_адреса_гаманця"
            value={walletAddress}
            onChange={(e) => { setWalletAddress(e.target.value); setError(''); setSuccess(''); }}
            className="w-full bg-pwa-black border border-pwa-border/50 rounded-xl px-4 py-3 text-white text-sm placeholder-pwa-gray outline-none focus:border-pwa-yellow/50 transition-colors"
          />
        </div>

        <div className="mb-3">
          <p className="text-xs font-medium text-pwa-gray/70 mb-2">Сума виведення (USD)</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pwa-gray font-medium">$</span>
            <input
              type="number"
              min="20"
              step="0.01"
              placeholder="20"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(''); setSuccess(''); }}
              className="w-full bg-pwa-black border border-pwa-border/50 rounded-xl px-4 py-3 pl-8 text-white text-sm placeholder-pwa-gray outline-none focus:border-pwa-yellow/50 transition-colors"
            />
          </div>
        </div>

        {/* Fee calculation */}
        {parsedAmount >= 20 && (
          <div className="bg-pwa-black rounded-xl p-4 mb-4 space-y-1">
            <div className="flex justify-between text-xs text-pwa-gray">
              <span>Комісія 2%</span>
              <span>${fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-white">
              <span>До отримання</span>
              <span>${netAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-xs mb-3">{error}</p>
        )}
        {success && (
          <p className="text-green-400 text-xs mb-3">{success}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || parsedAmount < 20}
          className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${
            submitting || parsedAmount < 20
              ? 'bg-pwa-light/40 text-pwa-gray/50 cursor-not-allowed'
              : 'bg-pwa-yellow text-pwa-black hover:brightness-110'
          }`}
        >
          {submitting ? 'Відправлення...' : 'Запросити виведення'}
        </button>

        <p className="text-xs font-medium text-pwa-gray/70 text-center mt-3">
          Мінімальна сума: $20 · Комісія: 2%
        </p>
      </div>

      {/* Withdrawal history */}
      <div className="rounded-2xl border border-pwa-border/50 bg-pwa-dark p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Історія виведень</h2>

        {loading ? (
          <Loading text="Завантаження..." />
        ) : withdrawals.length === 0 ? (
          <p className="text-xs text-pwa-gray/70 text-center py-6">Ще немає запитів на виведення</p>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div
                key={w.id}
                className="bg-pwa-black rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">
                    ${w.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-pwa-gray truncate mt-0.5">
                    {w.wallet_address}
                  </p>
                  <p className="text-[11px] text-pwa-gray/50 mt-1">
                    {new Date(w.created_at).toLocaleDateString('uk-UA', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${statusBadge(w.status)}`}
                >
                  {statusLabel[w.status] || w.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
