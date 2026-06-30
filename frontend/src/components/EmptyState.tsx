import type { ReactNode } from 'react';
import { OtherIcon } from '../icons';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-pwa-light/60 border border-pwa-border mb-4 text-2xl text-pwa-gray">
        {icon ?? <OtherIcon size={28} />}
      </div>
      <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-pwa-gray text-sm text-center max-w-xs mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-pwa-yellow text-pwa-black font-semibold rounded-xl text-sm hover:brightness-110 hover:shadow-[0_0_16px_-2px_rgba(245,197,24,0.6)] active:scale-95 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
