import { useEffect, useState } from 'react';
import { getReferralStats, withdrawReferralBalance } from '../api/referrals';
import type { ReferralStats } from '../types';
import Loading from '../components/Loading';
import { PartnersIcon, WalletIcon, ProfileIcon } from '../icons';

export default function Partners() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [copied, setCopied] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);

  useEffect(() => {
    getReferralStats()
      .then((data) => setStats(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = async () => {
    if (!stats) return;
    try {
      await navigator.clipboard.writeText(stats.referral_link);
    } catch {
      // Fallback for environments without the async clipboard API.
      const el = document.createElement('textarea');
      el.value = stats.referral_link;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async () => {
    if (!stats || stats.referral_balance <= 0 || withdrawing) return;
    setWithdrawing(true);
    setWithdrawMsg(null);
    try {
      const { referral_balance } = await withdrawReferralBalance();
      setStats((prev) =>
        prev ? { ...prev, referral_balance } : prev,
      );
      // Let the Header (and anything else) re-read the main balance.
      window.dispatchEvent(new Event('balance-updated'));
      setWithdrawMsg('Кошти переведено на основний баланс');
    } catch {
      setWithdrawMsg('Не вдалося вивести кошти. Спробуйте пізніше.');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <Loading text="Завантаження..." />;

  if (error || !stats) {
    return (
      <div className="px-6 py-10 animate-fade-in">
        <div className="bg-pwa-dark rounded-2xl border border-pwa-border p-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pwa-light/60 border border-pwa-border text-pwa-gray">
            <PartnersIcon size={26} />
          </div>
          <h3 className="text-white text-base font-semibold mb-2">
            Не вдалося завантажити
          </h3>
          <p className="text-pwa-gray text-sm leading-relaxed">
            Відкрийте партнерську програму через застосунок, щоб побачити свою
            статистику.
          </p>
        </div>
      </div>
    );
  }

  const canWithdraw = stats.referral_balance > 0 && !withdrawing;

  return (
    <div className="px-6 py-6 pb-10 animate-fade-in">
      {/* 1. Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pwa-yellow/15 text-pwa-yellow">
            <PartnersIcon size={20} />
          </span>
          <h1 className="text-xl font-bold text-white leading-tight">
            Партнерська програма
          </h1>
        </div>
        <p className="text-pwa-gray text-sm leading-relaxed">
          Запрошуйте друзів і заробляйте з кожної їх покупки.
        </p>
      </div>

      {/* 2. Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-pwa-dark rounded-2xl border border-pwa-border p-4">
          <p className="text-pwa-gray text-xs mb-1.5">Запрошено</p>
          <p className="text-white text-2xl font-bold leading-none">
            {stats.invited_count}
          </p>
        </div>
        <div className="bg-pwa-dark rounded-2xl border border-pwa-border p-4">
          <p className="text-pwa-gray text-xs mb-1.5">Зароблено</p>
          <p className="text-pwa-yellow text-2xl font-bold leading-none">
            ${stats.total_earned.toFixed(2)}
          </p>
        </div>
      </div>

      {/* 3. Referral balance card */}
      <div className="bg-pwa-dark rounded-2xl border border-pwa-border p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <WalletIcon size={16} className="text-pwa-gray" />
          <p className="text-pwa-gray text-xs uppercase tracking-wider">
            Реферальний баланс
          </p>
        </div>
        <p className="text-white text-3xl font-bold leading-none mb-4">
          ${stats.referral_balance.toFixed(2)}
        </p>
        <button
          onClick={handleWithdraw}
          disabled={!canWithdraw}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all
            enabled:bg-pwa-yellow enabled:text-pwa-black enabled:hover:brightness-110
            enabled:active:scale-[0.98]
            disabled:bg-pwa-light/50 disabled:text-pwa-gray disabled:cursor-not-allowed"
        >
          {withdrawing ? 'Виведення...' : 'Вивести на баланс'}
        </button>
        {withdrawMsg && (
          <p className="text-pwa-gray text-xs mt-3 text-center">{withdrawMsg}</p>
        )}
      </div>

      {/* 4. How it works */}
      <div className="bg-pwa-dark rounded-2xl border border-pwa-border p-5 mb-4">
        <h3 className="text-white text-sm font-semibold mb-2">Як це працює</h3>
        <p className="text-pwa-gray text-sm leading-relaxed">
          Поділіться своїм посиланням. Коли запрошений користувач робить покупку,
          ви миттєво отримуєте{' '}
          <span className="text-pwa-yellow font-semibold">3% кешбек</span> від її
          суми на реферальний баланс. Виводьте кошти на основний баланс у будь-який
          момент.
        </p>
      </div>

      {/* 5. Referral link */}
      <div className="bg-pwa-dark rounded-2xl border border-pwa-border p-5 mb-4">
        <h3 className="text-white text-sm font-semibold mb-3">
          Ваше реферальне посилання
        </h3>
        <div className="bg-pwa-black rounded-xl border border-pwa-border p-3 flex items-center gap-3">
          <p className="text-pwa-gray text-xs flex-1 break-all leading-relaxed">
            {stats.referral_link}
          </p>
          <button
            onClick={handleCopy}
            className={`shrink-0 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all active:scale-95 ${
              copied
                ? 'bg-pwa-yellow text-pwa-black'
                : 'bg-pwa-yellow/20 text-pwa-yellow hover:bg-pwa-yellow/30'
            }`}
          >
            {copied ? 'Скопійовано' : 'Копіювати'}
          </button>
        </div>
      </div>

      {/* 6. Referred users */}
      {stats.referred_users.length > 0 && (
        <div className="bg-pwa-dark rounded-2xl border border-pwa-border p-5">
          <h3 className="text-white text-sm font-semibold mb-3">
            Запрошені користувачі
          </h3>
          <div className="space-y-2.5">
            {stats.referred_users.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 bg-pwa-black rounded-xl border border-pwa-border p-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pwa-light/60 text-pwa-gray">
                  <ProfileIcon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-medium truncate">
                    {u.first_name || (u.username ? `@${u.username}` : `Користувач #${u.id}`)}
                  </p>
                  {u.username && u.first_name && (
                    <p className="text-pwa-gray text-xs truncate">@{u.username}</p>
                  )}
                </div>
                <span className="text-pwa-gray text-xs shrink-0">
                  {new Date(u.created_at).toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
