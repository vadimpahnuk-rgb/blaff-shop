import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../api/categories';
import type { Category } from '../types';
import Loading from '../components/Loading';

const categoryIcons: Record<string, string> = {
  'facebook': '📘',
  'accounts': '👤',
  'proxy': '🌐',
  'bm': '📊',
  'business': '💼',
  'ads': '📢',
  'tools': '🛠️',
  'other': '📦',
};

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Завантаження..." />;

  return (
    <div className="px-4 py-5 animate-fade-in">
      {/* Hero section */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white mb-1">PWA-X Store</h1>
        <p className="text-pwa-gray text-sm">
          Цифрові товари для медіабаєрів
        </p>
      </div>

      {/* Categories grid */}
      {categories.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-pwa-gray uppercase tracking-wider mb-3">
            Категорії
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/catalog?category=${cat.id}`)}
                className="bg-pwa-dark rounded-xl border border-pwa-border p-4 flex flex-col items-center gap-2 hover:border-pwa-yellow/30 active:scale-[0.97] transition-all"
              >
                <span className="text-3xl">
                  {cat.icon || categoryIcons[cat.slug] || '📦'}
                </span>
                <span className="text-white text-sm font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <span className="text-5xl block mb-3">📦</span>
          <p className="text-pwa-gray text-sm">Категорії поки що порожні</p>
        </div>
      )}
    </div>
  );
}
