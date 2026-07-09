import { useState, useEffect, useCallback } from 'react';
import { getAdminWithdrawals, updateWithdrawalStatus } from '../api/admin';
import Loading from '../components/Loading';
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

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<'completed' | 'rejected' | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getAdminWithdrawals();
      setWithdrawals(list);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = async (id: number, status: 'completed' | 'rejected') => {
    setActionLoading(id);
    try {
      await updateWithdrawalStatus(id, status);
      setConfirmId(null);
      setConfirmAction(null);
      load();
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-lg font-bold text-white mb-1">Виведення коштів</h2>
      <p className="text-sm font-medium text-pwa-gray/70 mb-5">Управління запитами на виведення</p>

      {loading ? (
        <Loading text="Завантаження..." />
      ) : withdrawals.length === 0 ? (
        <div className="rounded-2xl border border-pwa-border/50 bg-pwa-dark p-8 text-center">
          <p className="text-sm text-pwa-gray">Немає запитів на виведення</p>
        </div>
      ) : (
        <div className="space-y-3">
          {withdrawals.map((w) => (
            <div
              key={w.id}
              className="rounded-2xl border border-pwa-border/50 bg-pwa-dark p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-base font-bold text-white">
                    ${w.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-pwa-gray/70 mt-0.5">
                    Комісія: ${w.fee.toFixed(2)} · До отримання: ${w.net_amount.toFixed(2)}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${statusBadge(w.status)}`}
                >
                  {statusLabel[w.status] || w.status}
                </span>
              </div>

              <div className="bg-pwa-black rounded-xl p-3 space-y-2 mb-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-pwa-gray/70">ID користувача</span>
                  <span className="text-white font-mono">{w.user_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pwa-gray/70">Гаманець</span>
                  <span className="text-white font-mono text-[11px] break-all max-w-[200px] text-right">
                    {w.wallet_address}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pwa-gray/70">Дата</span>
                  <span className="text-white">
                    {new Date(w.created_at).toLocaleDateString('uk-UA', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Pending actions */}
              {w.status === 'pending' && (
                <>
                  {confirmId === w.id ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAction(w.id, confirmAction!)}
                        disabled={actionLoading === w.id}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98] ${
                          confirmAction === 'completed'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                        }`}
                      >
                        {actionLoading === w.id ? '...' : `Так, ${confirmAction === 'completed' ? 'підтвердити' : 'відхилити'}`}
                      </button>
                      <button
                        onClick={() => { setConfirmId(null); setConfirmAction(null); }}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-pwa-border/50 text-pwa-gray hover:text-white transition-colors"
                      >
                        Скасувати
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setConfirmId(w.id); setConfirmAction('completed'); }}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all active:scale-[0.98]"
                      >
                        Підтвердити
                      </button>
                      <button
                        onClick={() => { setConfirmId(w.id); setConfirmAction('rejected'); }}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all active:scale-[0.98]"
                      >
                        Відхилити
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
