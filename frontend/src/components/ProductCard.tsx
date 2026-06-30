import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onBuy?: () => void;
}

export default function ProductCard({ product, onClick, onBuy }: ProductCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-pwa-dark rounded-xl border border-pwa-border p-4 cursor-pointer active:scale-[0.98] transition-transform animate-fade-in"
    >
      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {product.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2 py-0.5 rounded-full bg-pwa-light text-pwa-yellow font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Name */}
      <h3 className="text-white text-sm font-semibold leading-tight mb-2 line-clamp-2">
        {product.name}
      </h3>

      {/* Description preview */}
      {product.description && (
        <p className="text-pwa-gray text-xs mb-3 line-clamp-2">
          {product.description}
        </p>
      )}

      {/* Bottom row: stock + price */}
      <div className="flex items-center justify-between mt-auto">
        {/* Stock indicator */}
        <div className="flex items-center gap-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              product.stock > 10
                ? 'bg-green-500'
                : product.stock > 0
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
          />
          <span className="text-pwa-gray text-xs">
            {product.stock > 0 ? `${product.stock} шт` : 'Немає'}
          </span>
        </div>

        {/* Price + Buy button */}
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm">
            ${product.price.toFixed(2)}
          </span>
          {onBuy && product.stock > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuy();
              }}
              className="px-3 py-1.5 bg-pwa-yellow text-pwa-black text-xs font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all"
            >
              Купити
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
