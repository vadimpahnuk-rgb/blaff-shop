import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BalanceBadge from './BalanceBadge';
import HamburgerMenu from './HamburgerMenu';

interface HeaderProps {
  balance: number;
  onBalanceClick?: () => void;
}

export default function Header({ balance, onBalanceClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-40 bg-pwa-black/95 backdrop-blur-sm border-b border-pwa-border safe-area-top">
        <div className="flex items-center justify-between px-4 h-12">
          {/* Left: Hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col gap-1 p-1.5 -ml-1.5"
            aria-label="Menu"
          >
            <span className="block w-5 h-[2px] bg-white rounded-full" />
            <span className="block w-5 h-[2px] bg-white rounded-full" />
            <span className="block w-5 h-[2px] bg-white rounded-full" />
          </button>

          {/* Center: Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-7 h-7 bg-pwa-yellow rounded-lg flex items-center justify-center">
              <span className="text-pwa-black font-black text-sm">B</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              BLA<span className="text-pwa-yellow"> AFF</span>
            </span>
          </div>

          {/* Right: Balance */}
          <BalanceBadge
            balance={balance}
            onClick={onBalanceClick}
          />
        </div>
      </header>

      <HamburgerMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}
