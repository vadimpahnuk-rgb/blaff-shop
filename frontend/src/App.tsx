import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { initAuth } from './api/auth';
import { getBalance } from './api/user';
import { useTelegram } from './hooks/useTelegram';
import type { User } from './types';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Deposit from './pages/Deposit';
import Purchases from './pages/Purchases';
import Support from './pages/Support';
import Terms from './pages/Terms';
import Partners from './pages/Partners';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminUsers from './admin/AdminUsers';
import AdminTransactions from './admin/AdminTransactions';
import Loading from './components/Loading';

const PUBLIC_PATHS = ['/support', '/terms', '/partners'];

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const { isReady, isDark } = useTelegram();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const showNavigation = !isAdminRoute && location.pathname !== '/product/';

  const refreshBalance = useCallback(async () => {
    try {
      const data = await getBalance();
      setBalance(data.balance);
    } catch {}
  }, []);

  useEffect(() => {
    if (!isReady) return;

    initAuth()
      .then((userData) => {
        setUser(userData);
        setBalance(userData.balance);
      })
      .catch(() => {
        // Still render the UI even without auth
        console.warn('Auth failed, running in guest mode');
      })
      .finally(() => setLoading(false));
  }, [isReady]);

  // Refresh balance periodically
  useEffect(() => {
    const interval = setInterval(refreshBalance, 30000);
    return () => clearInterval(interval);
  }, [refreshBalance]);

  // Apply theme params
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty('--bg', '#0a0a0a');
      root.style.setProperty('--text', '#ffffff');
    } else {
      root.style.setProperty('--bg', '#ffffff');
      root.style.setProperty('--text', '#0a0a0a');
    }
  }, [isDark]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-pwa-black">
        <Loading size="lg" text="PWA-X Store" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-pwa-black text-white">
      {/* Header - hidden on admin routes */}
      {!isAdminRoute && (
        <Header
          balance={balance}
          onBalanceClick={() => navigate('/deposit')}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {isAdmin && isAdminRoute && (
          <Routes>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="transactions" element={<AdminTransactions />} />
            </Route>
          </Routes>
        )}

        {/* User routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/support" element={<Support />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/partners" element={<Partners />} />
          <Route path="/profile" element={<Home />} />
        </Routes>
      </main>

      {/* Bottom navigation - hidden on admin routes */}
      {!isAdminRoute && <Navigation />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
