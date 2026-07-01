import type { ComponentType } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HomeIcon, CatalogIcon, PurchasesIcon, ProfileIcon, type IconProps } from '../icons';

const tabs: { label: string; Icon: ComponentType<IconProps>; path: string }[] = [
  { label: 'Головна', Icon: HomeIcon, path: '/' },
  { label: 'Каталог', Icon: CatalogIcon, path: '/catalog' },
  { label: 'Покупки', Icon: PurchasesIcon, path: '/purchases' },
  { label: 'Профіль', Icon: ProfileIcon, path: '/profile' },
];

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 mx-auto w-full max-w-[480px] glass border-t border-white/5 safe-area-bottom safe-area-left safe-area-right">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(({ label, Icon, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="relative flex flex-col items-center justify-center gap-1 px-3 py-1.5 min-w-[64px] active:scale-90 transition-transform"
            >
              <Icon
                size={23}
                className={`transition-all duration-200 ${
                  isActive
                    ? 'text-pwa-yellow drop-shadow-[0_0_8px_rgba(245,197,24,0.55)]'
                    : 'text-pwa-gray'
                }`}
              />
              <span
                className={`text-[10px] font-medium tracking-tight transition-colors ${
                  isActive ? 'text-pwa-yellow' : 'text-pwa-gray'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
