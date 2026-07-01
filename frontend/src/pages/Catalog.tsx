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

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory && product.category_id !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.description?.toLowerCase().includes(q);
        const matchesTags = product.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesTags) return false;
      }
      return product.is_active;
    });
  }, [products, selectedCategory, searchQuery]);

  if (loading) return <Loading text="Завантаження товарів..." />;

  return (
    <div className="px-5 py-6 animate-fade-in">
      {/* Section title */}
      <h1 className="text-xl font-bold text-white mb-4">Каталог</h1>

      {/* Products grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 pb-4">
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
          action={{ label: 'Скинути фільтри', onClick: () => { setSearchQuery(''); setSelectedCategory(null); } }}
        />
      )}
    </div>
  );
