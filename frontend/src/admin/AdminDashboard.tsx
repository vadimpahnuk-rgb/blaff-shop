import { useOutletContext } from 'react-router-dom';
import type { AdminStats } from '../types';
import Loading from '../components/Loading';

export default function AdminDashboard() {
  const { stats, loading } = useOutletContext<{ stats: AdminStats | null; loading: boolean }>();

  if (loading) return <Loading text="Завантаження статистики..." />;

  if (!stats) {
    return (
      <div className="text-center py-12">
        <span className="text-5xl block mb-3">📊</span>
        <p className="text-pwa-gray text-sm">Не вдалося завантажити статистику</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Продажів сьогодні', value: `$${stats.sales_today.toFixed(2)}`, icon: '📈' },
    { label: 'За тиждень', value: `$${stats.sales_week.toFixed(2)}`, icon: '📊' },
    { label: 'За місяць', value: `$${stats.sales_month.toFixed(2)}`, icon: '📅' },
    { label: 'Користувачів', value: stats.total_users.toString(), icon: '👥' },
    { label: 'Товарів', value: stats.total_products.toString(), icon: '📦' },
    { label: 'Транзакцій', value: stats.total_transactions.toString(), icon: '💳' },
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="text-white text-lg font-bold mb-4">Дашборд</h2>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-pwa-dark rounded-xl border border-pwa-border p-4"
          >
            <span className="text-2xl block mb-2">{card.icon}</span>
            <p className="text-pwa-gray text-xs mb-1">{card.label}</p>
            <p className="text-white text-lg font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Top products */}
      {stats.top_products && stats.top_products.length > 0 && (
        <div className="bg-pwa-dark rounded-xl border border-pwa-border p-4">
          <h3 className="text-white text-sm font-semibold mb-3">🏆 Топ товари</h3>
          <div className="space-y-2">
            {stats.top_products.map((product, idx) => (
              <div
                key={product.id}
                className="flex items-center justify-between bg-pwa-black rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-pwa-gray text-xs font-mono w-5">
                    {idx + 1}.
                  </span>
                  <span className="text-white text-xs">{product.name}</span>
                </div>
                <span className="text-pwa-yellow text-xs font-bold">
                  {product.sales} продажів
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
