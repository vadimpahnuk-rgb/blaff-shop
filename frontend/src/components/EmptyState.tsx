interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon = '📦', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 animate-fade-in">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-pwa-gray text-sm text-center max-w-xs mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-pwa-yellow text-pwa-black font-semibold rounded-lg text-sm hover:brightness-110 active:scale-95 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
