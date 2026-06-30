import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { label: 'Головна', icon: '🏠', path: '/' },
  { label: 'Каталог', icon: '📋', path: '/catalog' },
  { label: 'Покупки', icon: '📄', path: '/purchases' },
  { label: 'Профіль', icon: '👤', path: '/profile' },
];

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-pwa-black/95 backdrop-blur-sm border-t border-pwa-border safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[64px] ${
                isActive ? 'text-pwa-yellow' : 'text-pwa-gray'
              }`}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'text-pwa-yellow' : 'text-pwa-gray'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
