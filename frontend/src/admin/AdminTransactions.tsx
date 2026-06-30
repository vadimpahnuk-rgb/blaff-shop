import { useEffect, useState } from 'react';
import { getAdminTransactions } from '../api/admin';
import type { Transaction } from '../types';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

const statusColors: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-900/20',
  completed: 'text-green-400 bg-green-900/20',
  failed: 'text-red-400 bg-red-900/20',
};

const typeLabels: Record<string, string> = {
  deposit: 'Поповнення',
  purchase: 'Покупка',
};

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminTransactions()
      .then(setTransactions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Завантаження транзакцій..." />;

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon="💳"
        title="Транзакцій немає"
        description="Транзакції з'являться після перших дій користувачів"
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-white text-lg font-bold mb-4">
        Транзакції ({transactions.length})
      </h2>

      <div className="space-y-2 pb-4">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="bg-pwa-dark rounded-xl border border-pwa-border p-3"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-white text-xs font-semibold">
                #{tx.id} · {typeLabels[tx.type] || tx.type}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  statusColors[tx.status] || 'text-pwa-gray bg-pwa-light'
                }`}
              >
                {tx.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-pwa-gray text-xs">
                {new Date(tx.created_at).toLocaleDateString('uk-UA', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span
                className={`text-sm font-bold ${
                  tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
              </span>
            </div>

            {tx.payment_id && (
              <p className="text-pwa-gray text-[10px] mt-1 truncate">
                Payment: {tx.payment_id}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
