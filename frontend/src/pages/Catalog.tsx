import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import type { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { SearchIcon, CloseIcon } from '../icons';

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(Number(categoryParam));
    }
  }, [searchParams]);

  useEffect(() => {
    Promise.all([
      getProducts(),
      getCategories(),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
      })
      .catch(() => {
        setProducts([]);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Extract unique tags from products
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    products.forEach((p) => p.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory && product.category_id !== selectedCategory) return false;
      if (selectedTag && !product.tags?.includes(selectedTag)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.description?.toLowerCase().includes(q);
        const matchesTags = product.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesTags) return false;
      }
      return product.is_active;
    });
  }, [products, selectedCategory, selectedTag, searchQuery]);

  if (loading) return <Loading text="Завантаження товарів..." />;

  return (
    <div className="px-6 py-5 animate-fade-in">
      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Пошук товарів..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-pwa-dark border border-pwa-border rounded-xl px-4 py-3 pl-10 text-white text-sm placeholder-pwa-gray outline-none focus:border-pwa-yellow/50 transition-colors"
        />
        <SearchIcon
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-pwa-gray pointer-events-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-pwa-gray hover:text-white transition-colors"
            aria-label="Очистити"
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      {/* Category filters */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? 'bg-pwa-yellow text-pwa-black'
                : 'bg-pwa-dark text-pwa-gray border border-pwa-border'
            }`}
          >
            Всі
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-pwa-yellow text-pwa-black'
                  : 'bg-pwa-dark text-pwa-gray border border-pwa-border'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-none">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-pwa-yellow/20 text-pwa-yellow border border-pwa-yellow/40'
                  : 'bg-pwa-dark text-pwa-gray border border-pwa-border'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Products count */}
      <p className="text-pwa-gray text-xs mb-3">
        Знайдено: {filteredProducts.length} товарів
      </p>

      {/* Products grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 pb-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => navigate(`/product/${product.id}`)}
              onBuy={() => navigate(`/product/${product.id}`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<SearchIcon size={28} />}
          title="Товарів не знайдено"
          description="Спробуйте змінити параметри пошуку або фільтри"
          action={{ label: 'Скинути фільтри', onClick: () => { setSearchQuery(''); setSelectedCategory(null); setSelectedTag(null); } }}
        />
      )}
    </div>
  );
}
