interface BalanceBadgeProps {
  balance: number;
  onClick?: () => void;
}

export default function BalanceBadge({ balance, onClick }: BalanceBadgeProps) {
  const formattedBalance = balance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-pwa-dark rounded-lg border border-pwa-border text-sm"
    >
      <span className="text-pwa-yellow text-xs">$</span>
      <span className="text-white font-medium">{formattedBalance}</span>
    </button>
  );
}
