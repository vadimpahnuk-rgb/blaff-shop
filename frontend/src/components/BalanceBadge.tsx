import { WalletIcon } from '../icons';

interface BalanceBadgeProps {
  balance: number;
  onClick?: () => void;
}

export default function BalanceBadge({ balance, onClick }: BalanceBadgeProps) {
  const formattedBalance = Number(balance).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-xl border border-pwa-border bg-gradient-to-b from-pwa-light/80 to-pwa-dark active:scale-95 hover:border-pwa-yellow/40 transition-all"
    >
      <WalletIcon size={16} className="text-pwa-yellow" />
      <span className="stock-dot" />
      <span className="text-white font-semibold text-sm tabular-nums">
        ${formattedBalance}
      </span>
    </button>
  );
}
