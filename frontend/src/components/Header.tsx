import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BalanceBadge from './BalanceBadge';
import HamburgerMenu from './HamburgerMenu';
import { BlaLogo, MenuIcon } from '../icons';

interface HeaderProps {
  balance: number;
  onBalanceClick?: () => void;
}

export default function Header({ balance, onBalanceClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-white/5 safe-area-top">
        <div className="flex items-center justify-between px-5 h-14">
          {/* Left: menu + brand */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMenuOpen(true)}
              className="text-pwa-gray hover:text-white active:scale-90 transition-all p-1 -ml-1"
              aria-label="Menu"
            >
              <MenuIcon size={22} />
            </button>

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 active:scale-[0.97] transition-transform"
            >
              <BlaLogo size={28} className="rounded-[9px]" />
              <span className="font-extrabold text-base tracking-tight leading-none">
                <span className="text-white">BLA</span>
                <span className="text-pwa-yellow"> SHOP</span>
              </span>
            </button>
          </div>

          {/* Right: balance */}
          <BalanceBadge balance={balance} onClick={onBalanceClick} />
        </div>
      </header>

      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
