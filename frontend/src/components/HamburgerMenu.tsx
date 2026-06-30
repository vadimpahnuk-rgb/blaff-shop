import { useNavigate } from 'react-router-dom';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: 'Головна', icon: '🏠', path: '/' },
  { label: 'Каталог', icon: '📋', path: '/catalog' },
  { label: 'Історія покупок', icon: '📄', path: '/purchases' },
  { label: 'Поповнити баланс', icon: '💳', path: '/deposit' },
  { label: 'Підтримка', icon: '🆘', path: '/support' },
  { label: 'Умови використання', icon: '📜', path: '/terms' },
  { label: 'Партнерам', icon: '🤝', path: '/partners' },
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
      <div
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />

      {/* Menu panel */}
      <div className="fixed top-0 left-0 bottom-0 w-72 bg-pwa-black border-r border-pwa-border z-50 animate-fade-in safe-area-top">
        <div className="flex items-center justify-between px-4 h-12 border-b border-pwa-border">
          <span className="text-white font-bold text-lg">Меню</span>
          <button
            onClick={onClose}
            className="text-pwa-gray text-xl p-1"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-white hover:bg-pwa-dark active:bg-pwa-light transition-colors text-left"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Branding */}
        <div className="absolute bottom-6 left-0 right-0 px-6">
          <div className="flex items-center gap-2 justify-center opacity-40">
            <div className="w-5 h-5 bg-pwa-yellow rounded flex items-center justify-center">
              <span className="text-pwa-black font-black text-[10px]">B</span>
            </div>
            <span className="text-white text-xs font-semibold">
              BLA AFF SHOP
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
