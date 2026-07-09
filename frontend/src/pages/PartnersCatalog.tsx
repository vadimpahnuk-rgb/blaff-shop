import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../api/categories';
import type { Category } from '../types';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import SEO from '../components/SEO';
import {
  PartnersIcon,
  ProxiesIcon,
  SpyIcon,
  PwaIcon,
  DesignerIcon,
  AntidetectIcon,
  TrackerIcon,
  CloakingIcon,
  ChevronRightIcon,
  type IconProps,
} from '../icons';

const PARTNER_SLUGS = [
  'proxies',
  'spy-services',
  'pwa',
  'designers',
  'antidetect',
  'trackers',
  'cloaking',
] as const;

const CATEGORY_ICONS: Record<string, ComponentType<IconProps>> = {
  proxies: ProxiesIcon,
  'spy-services': SpyIcon,
  pwa: PwaIcon,
  designers: DesignerIcon,
  antidetect: AntidetectIcon,
  trackers: TrackerIcon,
  cloaking: CloakingIcon,
};

const CATEGORY_LABELS: Record<string, string> = {
  proxies: 'Proxies',
  'spy-services': 'Spy-сервіси',
  pwa: 'PWA',
  designers: 'Дизайнери',
  antidetect: 'Антидетект-браузери',
  trackers: 'Трекери',
  cloaking: 'Клоакінг-сервіси',
};

export default function PartnersCatalog() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getCategories()
      .then((data) =>
        setCategories(data.filter((c) => PARTNER_SLUGS.includes(c.slug as any))),
      )
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Завантаження..." />;

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-2xl border border-pwa-border/50 bg-pwa-dark p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-pwa-yellow/10">
            <PartnersIcon size={30} className="text-pwa-yellow/60" />
          </div>
          <h3 className="mb-2 text-base font-semibold text-white">
            Не вдалося завантажити
          </h3>
          <p className="text-sm leading-relaxed text-pwa-gray">
            Спробуйте пізніше
          </p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="px-5 py-6">
        <EmptyState
          icon={<PartnersIcon size={28} />}
          title="Немає категорій"
          description="Сервіси партнерів ще не додані"
          action={{ label: 'На головну', onClick: () => navigate('/') }}
        />
      </div>
    );
  }

  return (
    <div className="px-5 py-6 animate-fade-in">
      <SEO
        title="Партнери"
        description="Сервіси та інструменти для медіабаєрів: проксі, spy-сервіси, PWA, дизайнери, антидетект-браузери, трекери, клоакінг."
        path="/partners"
      />

      {/* Back + Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1.5 text-pwa-gray hover:text-white transition-colors"
        >
          <ChevronRightIcon size={18} className="rotate-180" />
          <span className="text-xs font-medium">Назад</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pwa-yellow/15 text-pwa-yellow">
            <PartnersIcon size={22} />
          </span>
          <div>
            <h1 className="text-xl font-bold leading-tight text-white">
              Партнери
            </h1>
            <p className="text-xs leading-relaxed text-pwa-gray/70">
              Сервіси та інструменти для медіабаєрів
            </p>
          </div>
        </div>
      </div>

      {/* Sub-category tiles */}
      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat) => {
          const Icon =
            CATEGORY_ICONS[cat.slug] ||
            (() => (
              <PartnersIcon size={22} />
            ));
          const label =
            CATEGORY_LABELS[cat.slug] || cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => navigate(`/catalog?category=${cat.id}`)}
              className="group relative flex flex-col items-center gap-3 rounded-2xl border border-pwa-border/50 bg-gradient-to-b from-pwa-dark to-[#141414] p-6 text-center overflow-hidden transition-all duration-200 hover:border-pwa-yellow/40 hover:shadow-[0_0_24px_-6px_rgba(245,197,24,0.25)] active:scale-[0.97]"
            >
              <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-pwa-yellow/10 text-pwa-yellow border border-pwa-yellow/15 group-hover:bg-pwa-yellow/20 transition-colors">
                <Icon size={22} />
              </span>
              <span className="text-white text-sm font-semibold leading-tight">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
