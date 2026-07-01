import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getAdminStats } from '../api/admin';
import { useAuth } from '../api/auth-context';
import type { AdminStats } from '../types';
import Loading from '../components/Loading';

const adminTabs = [
  { label: 'Дашборд', path: '/admin' },
  { label: 'Товари', path: '/admin/products' },
  { label: 'Користувачі', path: '/admin/users' },
  { label: 'Транзакції', path: '/admin/transactions' },
];

export default function AdminLayout() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // If auth loaded and user is not admin — redirect
  useEffect(() => {
    if (user !== null && !isAdmin) {
      navigate('/', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  // Don't render anything until auth state is known
  if (user === null) {
    return (
      <div className="min-h-screen bg-pwa-black flex items-center justify-center">
        <Loading text="Завантаження..." />
      </div>
    );
  }

  if (!isAdmin) return null;

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-pwa-black">
      {/* Admin header */}
      <header className="sticky top-0 z-40 bg-pwa-black/95 backdrop-blur-sm border-b border-pwa-border">
        <div className="flex items-center justify-between px-4 h-12">
          <button
            onClick={() => navigate('/')}
            className="text-pwa-gray text-sm hover:text-white"
          >
            ← Назад
          </button>
          <h1 className="text-white font-bold text-sm">Адмін панель</h1>
          <div className="w-12" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-2 pb-2 overflow-x-auto scrollbar-none">
          {adminTabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/admin'}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-pwa-yellow text-pwa-black'
                    : 'text-pwa-gray hover:text-white'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </header>

      <div className="px-4 py-4">
        <Outlet context={{ stats, loading }} />
      </div>
    </div>
  );
}
