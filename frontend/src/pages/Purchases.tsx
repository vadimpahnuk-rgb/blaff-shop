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
    <div className="px-6 py-5 animate-fade-in">
      <h1 className="text-xl font-bold text-white mb-4">Історія покупок</h1>

      <div className="space-y-3 pb-4">
        {purchases.map((purchase) => {
          const isRevealed = !!revealedData[purchase.id];
          return (
            <div
              key={purchase.id}
              className="bg-pwa-dark rounded-xl border border-pwa-border p-4"
            >
              {/* Purchase header */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white text-sm font-semibold">
                  {purchase.product_name || `Товар #${purchase.product_id}`}
                </h3>
                <div className="text-right">
                  <p className="text-pwa-yellow text-sm font-bold">
                    -${purchase.price.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-pwa-gray text-xs">
                  ID: #{purchase.id}
                </span>
                <span className="text-pwa-gray text-xs">
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
                  className="w-full py-2.5 bg-pwa-yellow text-pwa-black text-sm font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  {revealingId === purchase.id ? 'Завантаження...' : 'Отримати дані'}
                </button>
              )}

              {isRevealed && (
                <div className="bg-pwa-black rounded-lg p-3 mt-2">
                  <p className="text-pwa-gray text-xs mb-1 uppercase tracking-wider">Дані товару:</p>
                  <pre className="text-white text-xs whitespace-pre-wrap break-all font-mono">
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
