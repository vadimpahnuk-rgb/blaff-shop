import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BlaLogo,
  CloseIcon,
  ChevronRightIcon,
  HomeIcon,
  CatalogIcon,
  PurchasesIcon,
  WalletIcon,
  SupportIcon,
  TermsIcon,
  PartnersIcon,
  type IconProps,
} from '../icons';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: { label: string; Icon: ComponentType<IconProps>; path: string }[] = [
  { label: 'Головна', Icon: HomeIcon, path: '/' },
  { label: 'Каталог', Icon: CatalogIcon, path: '/catalog' },
  { label: 'Історія покупок', Icon: PurchasesIcon, path: '/purchases' },
  { label: 'Поповнити баланс', Icon: WalletIcon, path: '/deposit' },
  { label: 'Підтримка', Icon: SupportIcon, path: '/support' },
  { label: 'Умови використання', Icon: TermsIcon, path: '/terms' },
  { label: 'Партнерам', Icon: PartnersIcon, path: '/partners' },
];

export default function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-[2px] z-50 animate-fade-in" onClick={onClose} />

      {/* Menu panel */}
      <div className="fixed top-0 left-0 bottom-0 w-[78%] max-w-xs glass border-r border-white/10 z-50 animate-fade-in safe-area-top flex flex-col">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <BlaLogo size={26} className="rounded-lg" />
            <span className="font-extrabold text-base tracking-tight">
              <span className="text-white">BLA</span>
              <span className="text-pwa-yellow"> SHOP</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-pwa-gray hover:text-white active:scale-90 transition-all p-1"
            aria-label="Close menu"
          >
            <CloseIcon size={22} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {menuItems.map(({ label, Icon, path }) => (
            <button
              key={path}
              onClick={() => handleNavigate(path)}
              className="group flex items-center gap-3 w-full px-3 py-3 rounded-xl text-white hover:bg-white/5 active:bg-white/10 transition-colors text-left"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-pwa-light/60 text-pwa-gray group-hover:text-pwa-yellow group-hover:bg-pwa-yellow/10 transition-colors">
                <Icon size={19} />
              </span>
              <span className="flex-1 text-sm font-medium">{label}</span>
              <ChevronRightIcon
                size={16}
                className="text-pwa-border group-hover:text-pwa-gray transition-colors"
              />
            </button>
          ))}
        </nav>

        {/* Footer branding */}
        <div className="px-6 pb-6 pt-2 safe-area-bottom">
          <p className="text-pwa-gray/60 text-[11px] text-center">
            BLA SHOP · цифрові товари для медіабаєрів
          </p>
        </div>
      </div>
    </>
  );
}
