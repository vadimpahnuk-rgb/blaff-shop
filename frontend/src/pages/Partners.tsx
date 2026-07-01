import { useEffect, useState } from 'react';
import { getReferralStats, withdrawReferralBalance } from '../api/referrals';
import type { ReferralStats } from '../types';
import Loading from '../components/Loading';
import { PartnersIcon, WalletIcon, ProfileIcon, ToolsIcon } from '../icons';

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
      <div className="flex h-full items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-2xl border border-pwa-border/50 bg-pwa-dark p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-pwa-yellow/10">
            <PartnersIcon size={30} className="text-pwa-yellow/60" />
          </div>
          <h3 className="mb-2 text-base font-semibold text-white">
            Не вдалося завантажити
          </h3>
          <p className="text-sm leading-relaxed text-pwa-gray">
            Відкрийте сторінку через Telegram, щоб побачити свою статистику.
          </p>
        </div>
      </div>
    );
  }

  const canWithdraw = stats.referral_balance > 0 && !withdrawing;
  const hasReferrals = stats.invited_count > 0;

  return (
    <div className="space-y-3 px-5 py-5 animate-fade-in">
      {/* 1. Header */}
      <div className="pb-2">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pwa-yellow/15 text-pwa-yellow">
            <PartnersIcon size={22} />
          </span>
          <div>
            <h1 className="text-lg font-bold leading-tight text-white">
              Партнерська програма
            </h1>
            <p className="text-xs leading-relaxed text-pwa-gray/70">
              Запрошуйте друзів і заробляйте з кожної їх покупки
            </p>
          </div>
        </div>
      </div>

      {/* 2. Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-pwa-border/50 bg-pwa-dark p-5">
          <p className="mb-2 text-xs font-medium text-pwa-gray/70">Запрошено</p>
          <p className="text-3xl font-extrabold leading-none text-white">
            {stats.invited_count}
          </p>
        </div>
        <div className="rounded-2xl border border-pwa-border/50 bg-pwa-dark p-5">
          <p className="mb-2 text-xs font-medium text-pwa-gray/70">Зароблено</p>
          <p className="text-3xl font-extrabold leading-none text-pwa-yellow">
            ${stats.total_earned.toFixed(2)}
          </p>
        </div>
      </div>

      {/* 3. Referral balance card */}
      <div className="rounded-2xl border border-pwa-border/50 bg-pwa-dark px-5 py-5">
        <div className="mb-3 flex items-center gap-2">
          <WalletIcon size={16} className="text-pwa-yellow/70" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-pwa-gray/60">
            Реферальний баланс
          </span>
        </div>
        <p className="mb-5 text-4xl font-extrabold leading-none tracking-tight text-white">
          ${stats.referral_balance.toFixed(2)}
        </p>
        <button
          onClick={handleWithdraw}
          disabled={!canWithdraw}
          className={`w-full rounded-xl py-3.5 text-sm font-bold transition-all duration-200
            ${
              canWithdraw
                ? 'bg-pwa-yellow text-pwa-black hover:brightness-110 active:scale-[0.98]'
                : 'cursor-not-allowed bg-pwa-light/40 text-pwa-gray/50'
            }`}
        >
          {withdrawing ? 'Виведення…' : 'Вивести на баланс'}
        </button>
        {withdrawMsg && (
          <p
            className={`mt-3 text-center text-xs ${
              withdrawMsg.includes('Не')
                ? 'text-red-400'
                : 'text-pwa-yellow/80'
            }`}
          >
            {withdrawMsg}
          </p>
        )}
        {!hasReferrals && stats.referral_balance === 0 && (
          <p className="mt-3 text-center text-xs text-pwa-gray/50">
            Запросіть першого друга, щоб активувати
          </p>
        )}
      </div>

      {/* 4. How it works */}
      <div className="rounded-2xl border border-pwa-border/50 bg-pwa-dark px-5 py-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-pwa-yellow/15 text-pwa-yellow">
            <ToolsIcon size={14} />
          </span>
          Як це працює
        </h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pwa-yellow/15 text-[11px] font-bold text-pwa-yellow">
              1
            </span>
            <p className="text-sm leading-relaxed text-pwa-gray">
              Скопіюйте своє реферальне посилання та поділіться ним
            </p>
          </div>
          <div className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pwa-yellow/15 text-[11px] font-bold text-pwa-yellow">
              2
            </span>
            <p className="text-sm leading-relaxed text-pwa-gray">
              Користувач реєструється та поповнює баланс
            </p>
          </div>
          <div className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pwa-yellow/15 text-[11px] font-bold text-pwa-yellow">
              3
            </span>
            <p className="text-sm leading-relaxed text-pwa-gray">
              Ви отримуєте{' '}
              <span className="font-semibold text-pwa-yellow">3% кешбек</span>{' '}
              на реферальний баланс — миттєво після поповнення балансу
            </p>
          </div>
        </div>
      </div>

      {/* 5. Referral link */}
      <div className="rounded-2xl border border-pwa-border/50 bg-pwa-dark px-5 py-5">
        <h3 className="mb-3 text-sm font-semibold text-white">
          Ваше реферальне посилання
        </h3>
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-pwa-border/50 bg-pwa-black px-4 py-3.5">
          <PartnersIcon size={16} className="shrink-0 text-pwa-gray/50" />
          <p className="min-w-0 flex-1 truncate font-mono text-xs text-pwa-gray/80">
            {stats.referral_link}
          </p>
        </div>
        <button
          onClick={handleCopy}
          className={`w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]
            ${
              copied
                ? 'bg-pwa-yellow text-pwa-black'
                : 'border border-pwa-border/50 bg-pwa-yellow/10 text-pwa-yellow hover:bg-pwa-yellow/20'
            }`}
        >
          {copied ? '✓ Скопійовано' : 'Копіювати посилання'}
        </button>
      </div>

      {/* 6. Referred users */}
      {stats.referred_users.length > 0 && (
        <div className="rounded-2xl border border-pwa-border/50 bg-pwa-dark px-5 py-5">
          <h3 className="mb-4 text-sm font-semibold text-white">
            Запрошені користувачі
          </h3>
          <div className="space-y-2.5">
            {stats.referred_users.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3.5 rounded-xl border border-pwa-border/30 bg-pwa-black/60 px-4 py-3.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pwa-light/40 text-pwa-gray/60">
                  <ProfileIcon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {u.first_name ||
                      (u.username ? `@${u.username}` : `Користувач #${u.id}`)}
                  </p>
                  {u.username && u.first_name && (
                    <p className="truncate text-xs text-pwa-gray/60">
                      @{u.username}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-pwa-gray/50">
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
