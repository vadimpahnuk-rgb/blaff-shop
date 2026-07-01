import { useEffect, useState } from 'react';
import { getPurchases } from '../api/user';
import type { Purchase } from '../types';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { PurchasesIcon } from '../icons';

export default function Purchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealedData, setRevealedData] = useState<Record<number, string>>({});
  const [revealingId, setRevealingId] = useState<number | null>(null);

  useEffect(() => {
    getPurchases()
      .then(setPurchases)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleReveal = async (purchase: Purchase) => {
    if (revealedData[purchase.id]) return;
    setRevealingId(purchase.id);
    // Data is already included in the purchase response
    if (purchase.product_data) {
      setRevealedData((prev) => ({ ...prev, [purchase.id]: purchase.product_data! }));
    }
    setRevealingId(null);
  };

  if (loading) return <Loading text="Завантаження історії..." />;

  if (purchases.length === 0) {
    return (
      <EmptyState
        icon={<PurchasesIcon size={28} />}
        title="Покупок ще немає"
        description="Придбані товари з'являться тут"
      />
    );
  }

  return (
    <div className="px-5 py-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pwa-yellow/10 text-pwa-yellow">
          <PurchasesIcon size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white leading-tight">Історія покупок</h1>
          <p className="text-xs font-medium text-pwa-gray/70">Ваші придбані товари</p>
        </div>
      </div>

      <div className="space-y-4 pb-4">
        {purchases.map((purchase) => {
          const isRevealed = !!revealedData[purchase.id];
          return (
            <div
              key={purchase.id}
              className="rounded-2xl border border-pwa-border/50 bg-pwa-dark p-6 transition-all hover:border-pwa-yellow/20"
            >
              {/* Purchase header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-white text-[15px] font-semibold leading-snug">
                  {purchase.product_name || `Товар #${purchase.product_id}`}
                </h3>
                <p className="shrink-0 text-pwa-yellow text-base font-extrabold tabular-nums tracking-tight">
                  -${purchase.price.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-xs font-medium text-pwa-gray/70">
                  ID: #{purchase.id}
                </span>
                <span className="text-xs font-medium text-pwa-gray/70">
                  {new Date(purchase.created_at).toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Reveal data button */}
              {purchase.product_data && !isRevealed && (
                <button
                  onClick={() => handleReveal(purchase)}
                  disabled={revealingId === purchase.id}
                  className="w-full py-3 bg-pwa-yellow text-pwa-black text-sm font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  {revealingId === purchase.id ? 'Завантаження...' : 'Отримати дані'}
                </button>
              )}

              {isRevealed && (
                <div className="bg-pwa-black rounded-xl p-4">
                  <p className="text-xs font-medium text-pwa-gray/70 mb-2">Дані товару:</p>
                  <pre className="text-white text-xs whitespace-pre-wrap break-all font-mono leading-relaxed">
                    {revealedData[purchase.id]}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
