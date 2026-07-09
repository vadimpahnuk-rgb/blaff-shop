import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../api/categories';
import type { Category } from '../types';
import Loading from '../components/Loading';
import SEO from '../components/SEO';
import {
  BlaLogo,
  FacebookIcon,
  BusinessIcon,
  AgencyIcon,
  PartnersIcon,
  type IconProps,
} from '../icons';

type HomeTile = {
  label: string;
  Icon: ComponentType<IconProps>;
  slug?: string; // resolves to /catalog?category=<id>
  to?: string; // direct route
};

const HOME_TILES: HomeTile[] = [
  { label: 'Facebook Accounts', Icon: FacebookIcon, slug: 'facebook-accounts' },
  { label: 'Business Manager', Icon: BusinessIcon, slug: 'business-managers' },
  { label: 'Агентські кабінети', Icon: AgencyIcon, slug: 'agency-cabinets' },
  { label: 'Партнери', Icon: PartnersIcon, slug: 'partners' },
];

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

  const goTo = (tile: HomeTile) => {
    if (tile.to) return navigate(tile.to);
    const cat = categories.find((c) => c.slug === tile.slug);
    navigate(cat ? `/catalog?category=${cat.id}` : '/catalog');
  };

  return (
    <div className="px-5 py-6 animate-fade-in">
      <SEO
        title="Головна"
        description="Цифрові товари для медіабаєрів: акаунти Facebook, Business Manager, проксі та інструменти. Швидко, надійно, цілодобово."
      />
      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-10 animate-fade-up">
        <div className="hero-glow mb-4">
          <BlaLogo size={76} className="relative z-10 rounded-3xl shadow-2xl" />
        </div>
        <h1 className="text-3xl font-black tracking-tight leading-none">
          <span className="text-white">BLA</span>
          <span className="text-pwa-yellow"> SHOP</span>
        </h1>
        <p className="text-pwa-gray text-sm mt-2 max-w-xs">
          Цифрові товари для медіабаєрів — швидко, надійно, цілодобово
        </p>
      </div>

      {/* Categories */}
      <div className="animate-fade-up" style={{ animationDelay: '0.08s' }}>
        <h2 className="text-xs font-semibold text-pwa-gray uppercase tracking-[0.18em] mb-3 px-1">
          Категорії
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {HOME_TILES.map((tile) => {
            const { Icon } = tile;
            return (
              <button
                key={tile.label}
                onClick={() => goTo(tile)}
                className="group relative flex flex-col items-center gap-3 rounded-2xl border border-pwa-border/50 bg-gradient-to-b from-pwa-dark to-[#141414] p-6 text-center overflow-hidden transition-all duration-200 hover:border-pwa-yellow/40 hover:shadow-[0_0_24px_-6px_rgba(245,197,24,0.25)] active:scale-[0.97]"
              >
                <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-pwa-yellow/10 text-pwa-yellow border border-pwa-yellow/15 group-hover:bg-pwa-yellow/20 transition-colors">
                  <Icon size={22} />
                </span>
                <span className="text-white text-sm font-semibold leading-tight">
                  {tile.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
