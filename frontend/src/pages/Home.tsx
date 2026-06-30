import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../api/categories';
import type { Category } from '../types';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import {
  BlaLogo,
  ChevronRightIcon,
  FacebookIcon,
  ProfileIcon,
  ProxiesIcon,
  BmIcon,
  BusinessIcon,
  AdsIcon,
  ToolsIcon,
  OtherIcon,
  type IconProps,
} from '../icons';

const categoryIcons: Record<string, ComponentType<IconProps>> = {
  facebook: FacebookIcon,
  accounts: ProfileIcon,
  proxy: ProxiesIcon,
  bm: BmIcon,
  business: BusinessIcon,
  ads: AdsIcon,
  tools: ToolsIcon,
  other: OtherIcon,
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
    <div className="px-4 pt-6 pb-6">
      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-8 animate-fade-up">
        <div className="hero-glow mb-4">
          <BlaLogo size={76} className="relative z-10 rounded-3xl shadow-2xl" />
        </div>
        <h1 className="text-3xl font-black tracking-tight leading-none">
          <span className="text-white">BLA</span>
          <span className="text-pwa-yellow"> SHOP</span>
        </h1>
        <p className="text-pwa-gray text-sm mt-2 max-w-[15rem]">
          Цифрові товари для медіабаєрів — швидко, надійно, цілодобово
        </p>
      </div>

      {/* Categories */}
      {categories.length > 0 ? (
        <div className="animate-fade-up" style={{ animationDelay: '0.08s' }}>
          <h2 className="text-xs font-semibold text-pwa-gray uppercase tracking-[0.18em] mb-3 px-1">
            Категорії
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.slug] || OtherIcon;
              return (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/catalog?category=${cat.id}`)}
                  className="group relative flex flex-col gap-3 rounded-2xl border border-pwa-border bg-gradient-to-b from-pwa-dark to-[#141414] p-4 text-left overflow-hidden transition-all duration-200 hover:border-pwa-yellow/40 hover:shadow-[0_0_24px_-6px_rgba(245,197,24,0.25)] active:scale-[0.97]"
                >
                  <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-pwa-yellow/10 text-pwa-yellow border border-pwa-yellow/15 group-hover:bg-pwa-yellow/20 transition-colors">
                    <Icon size={22} />
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-semibold leading-tight">
                      {cat.name}
                    </span>
                    <ChevronRightIcon
                      size={16}
                      className="text-pwa-border group-hover:text-pwa-yellow transition-colors shrink-0"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          title="Категорії поки що порожні"
          description="Зовсім скоро тут з'являться товари"
        />
      )}
    </div>
  );
}
