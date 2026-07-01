import { useEffect, useState } from 'react';
import { getAdminUsers, updateUserRole, updateUserBalance } from '../api/admin';
import type { User } from '../types';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBalance, setEditingBalance] = useState<number | null>(null);
  const [balanceValue, setBalanceValue] = useState('');

  useEffect(() => {
    getAdminUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId: number, role: string) => {
    try {
      await updateUserRole(userId, role);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: role as 'user' | 'admin' } : u))
      );
    } catch (err) {
      alert('Помилка зміни ролі');
    }
  };

  const handleBalanceChange = async (userId: number) => {
    const balance = parseFloat(balanceValue);
    if (isNaN(balance)) return;
    try {
      await updateUserBalance(userId, balance);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, balance } : u)));
      setEditingBalance(null);
      setBalanceValue('');
    } catch (err) {
      alert('Помилка зміни балансу');
    }
  };

  if (loading) return <Loading text="Завантаження користувачів..." />;

  if (users.length === 0) {
    return (
      <EmptyState
        icon="👥"
        title="Користувачів немає"
        description="Поки що ніхто не авторизувався"
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-white text-lg font-bold mb-4">
        Користувачі ({users.length})
      </h2>

      <div className="space-y-4 pb-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-pwa-dark rounded-2xl border border-pwa-border/50 p-6"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-white text-sm font-semibold">{user.first_name}</h3>
                <p className="text-pwa-gray text-xs">
                  @{user.username || user.telegram_id}
                </p>
              </div>
              <div className="text-right">
                <p className="text-pwa-yellow text-sm font-bold">
                  ${user.balance.toFixed(2)}
                </p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    user.role === 'admin'
                      ? 'bg-yellow-900/30 text-yellow-400'
                      : 'bg-pwa-light text-pwa-gray'
                  }`}
                >
                  {user.role === 'admin' ? 'Адмін' : 'Користувач'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              {/* Role toggle */}
              <button
                onClick={() =>
                  handleRoleChange(
                    user.id,
                    user.role === 'admin' ? 'user' : 'admin'
                  )
                }
                className="px-3 py-1.5 bg-pwa-light text-white text-xs rounded-lg border border-pwa-border"
              >
                {user.role === 'admin' ? '⬇ Зробити user' : '⬆ Зробити admin'}
              </button>

              {/* Balance edit */}
              {editingBalance === user.id ? (
                <div className="flex gap-1">
                  <input
                    type="number"
                    step="0.01"
                    value={balanceValue}
                    onChange={(e) => setBalanceValue(e.target.value)}
                    className="w-20 bg-pwa-black border border-pwa-border rounded-lg px-2 py-1 text-white text-xs outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleBalanceChange(user.id)}
                    className="px-2 py-1 bg-pwa-yellow text-pwa-black text-xs rounded-lg"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingBalance(user.id);
                    setBalanceValue(user.balance.toString());
                  }}
                  className="px-3 py-1.5 bg-pwa-light text-white text-xs rounded-lg border border-pwa-border"
                >
                  💰 Баланс
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
