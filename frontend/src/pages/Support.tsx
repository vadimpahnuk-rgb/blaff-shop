import { SupportIcon, ChevronRightIcon, TermsIcon } from '../icons';

export default function Support() {
  return (
    <div className="px-5 py-6 animate-fade-in">
      <h1 className="text-xl font-bold text-white mb-4">Підтримка</h1>

      <div className="space-y-4">
        <div className="rounded-2xl border border-pwa-border/50 bg-pwa-dark p-6">
          <h3 className="flex items-center gap-2 text-white text-sm font-semibold mb-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pwa-light text-pwa-yellow">
              <SupportIcon size={18} />
            </span>
            Зв'язатися з нами
          </h3>
          <p className="text-pwa-gray text-sm leading-relaxed">
            Якщо у вас виникли питання, проблеми з покупкою або пропозиції,
            напишіть нам у Telegram:
          </p>
        </div>

        <a
          href="https://t.me/BLA_TL"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-2xl border border-pwa-border/50 bg-pwa-dark p-6 transition-colors hover:border-pwa-yellow/40"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pwa-light text-pwa-yellow">
            <SupportIcon size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-pwa-gray/70">Telegram</p>
            <p className="text-pwa-yellow text-sm font-medium group-hover:underline">@BLA_TL</p>
          </div>
          <ChevronRightIcon size={18} />
        </a>

        <div className="rounded-2xl border border-pwa-border/50 bg-pwa-dark p-6">
          <h3 className="flex items-center gap-2 text-white text-sm font-semibold mb-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pwa-light text-pwa-yellow">
              <TermsIcon size={18} />
            </span>
            FAQ
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-white text-sm font-medium mb-1">Як поповнити баланс?</p>
              <p className="text-pwa-gray text-xs leading-relaxed">
                Перейдіть у розділ "Поповнити", оберіть суму та оплатіть
                за вказаною адресою. Після підтвердження платежу баланс
                буде поповнено автоматично.
              </p>
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-1">Як отримати дані товару?</p>
              <p className="text-pwa-gray text-xs leading-relaxed">
                Після покупки дані з'являються на сторінці товару та в
                історії покупок. Натисніть "Отримати дані", щоб
                переглянути логін/пароль або іншу інформацію.
              </p>
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-1">Товар не працює?</p>
              <p className="text-pwa-gray text-xs leading-relaxed">
                Зверніться в підтримку — ми розглянемо вашу ситуацію
                та запропонуємо заміну або повернення коштів.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
