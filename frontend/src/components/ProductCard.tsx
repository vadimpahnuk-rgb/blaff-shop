import type { Product } from '../types';
import { CartIcon } from '../icons';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onBuy?: () => void;
}

export default function ProductCard({ product, onClick, onBuy }: ProductCardProps) {
  const inStock = product.stock > 0;

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl border border-pwa-border/50 bg-gradient-to-b from-pwa-dark to-[#141414] p-6 cursor-pointer overflow-hidden transition-all duration-200 hover:border-pwa-yellow/30 hover:shadow-[0_0_30px_-12px_rgba(245,197,24,0.12)] active:scale-[0.98] animate-fade-in"
    >
      {/* Name */}
      <h3 className="text-white text-[15px] font-semibold leading-snug mb-2.5">
        {product.name}
      </h3>

      {/* Description preview */}
      {product.description && (
        <p className="text-pwa-gray/70 text-sm leading-relaxed mb-4 line-clamp-2">{product.description}</p>
      )}

      {/* Bottom row: stock + price */}
      <div className="flex items-center justify-between">
        {/* Stock indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            inStock ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'
          }`} />
          <span className="text-pwa-gray/60 text-xs font-medium">
            {inStock ? `${product.stock} шт` : 'Немає'}
          </span>
        </div>

        {/* Price + Buy button */}
        <div className="flex items-center gap-3">
          <span className="text-white font-extrabold text-[16px] tabular-nums tracking-tight">
            ${product.price.toFixed(2)}
          </span>
          {onBuy && inStock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuy();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-pwa-yellow text-pwa-black text-xs font-bold rounded-xl hover:brightness-110 hover:shadow-[0_0_16px_-2px_rgba(245,197,24,0.6)] active:scale-95 transition-all"
            >
              <CartIcon size={14} />
              Купити
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
