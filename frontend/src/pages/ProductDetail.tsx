import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, purchaseProduct } from '../api/products';
import type { Product } from '../types';
import Loading from '../components/Loading';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{ purchase_id: number; product_data: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    getProduct(Number(id))
      .then(setProduct)
      .catch(() => navigate('/catalog'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleBuy = async () => {
    if (!product || buying) return;
    setBuying(true);
    try {
      const result = await purchaseProduct(product.id);
      setPurchaseResult(result);
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Помилка покупки');
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <Loading text="Завантаження..." />;
  if (!product) return null;

  if (purchaseResult) {
    return (
      <div className="px-5 py-6 animate-fade-in">
        <div className="rounded-2xl border border-green-500/40 bg-gradient-to-b from-pwa-dark to-[#141414] p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30 shadow-[0_0_24px_-4px_rgba(34,197,94,0.5)]">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-400"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Покупка успішна!</h2>
          <p className="text-pwa-gray text-sm mb-4">ID покупки: #{purchaseResult.purchase_id}</p>
          <div className="bg-pwa-black rounded-xl border border-pwa-border/50 p-4 mb-4 text-left">
            <p className="text-xs font-medium text-pwa-gray/70 mb-2 uppercase tracking-wider">Дані товару:</p>
            <pre className="text-white text-sm whitespace-pre-wrap break-all font-mono">
              {purchaseResult.product_data}
            </pre>
          </div>
          <button
            onClick={() => navigate('/purchases')}
            className="w-full py-4 bg-pwa-yellow text-pwa-black font-bold rounded-xl text-sm hover:brightness-110 active:scale-[0.98] transition-all"
          >
            До моїх покупок
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 animate-fade-in">
      {/* Name */}
      <h1 className="text-xl font-bold text-white mb-4">{product.name}</h1>

      {/* Description */}
      {product.description && (
        <div className="bg-pwa-dark rounded-2xl border border-pwa-border/50 p-6 mb-4">
          <p className="text-sm text-pwa-gray leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-pwa-dark rounded-2xl border border-pwa-border/50 p-6">
          <p className="text-xs font-medium text-pwa-gray/70 mb-1">Ціна</p>
          <p className="text-white text-lg font-bold">${product.price.toFixed(2)}</p>
        </div>
        <div className="bg-pwa-dark rounded-2xl border border-pwa-border/50 p-6">
          <p className="text-xs font-medium text-pwa-gray/70 mb-1">Наявність</p>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {product.stock > 0 ? `${product.stock} шт` : 'Немає в наявності'}
            </p>
          </div>
        </div>
      </div>

      {/* Buy button */}
      <button
        onClick={handleBuy}
        disabled={buying || product.stock === 0}
        className={`w-full py-4 rounded-xl text-base font-bold transition-all active:scale-[0.98] ${
          product.stock > 0
            ? 'bg-pwa-yellow text-pwa-black hover:brightness-110'
            : 'bg-pwa-dark text-pwa-gray cursor-not-allowed'
        }`}
      >
        {buying ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-pwa-black border-t-transparent rounded-full animate-spin" />
            Обробка...
          </span>
        ) : product.stock > 0 ? (
          `Купити за $${product.price.toFixed(2)}`
        ) : (
          'Немає в наявності'
        )}
      </button>
    </div>
  );
}
