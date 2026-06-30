export default function Support() {
  return (
    <div className="px-6 py-5 animate-fade-in">
      <h1 className="text-xl font-bold text-white mb-4">Підтримка</h1>

      <div className="space-y-4">
        <div className="bg-pwa-dark rounded-xl border border-pwa-border p-4">
          <h3 className="text-white text-sm font-semibold mb-2">📧 Зв'язатися з нами</h3>
          <p className="text-pwa-gray text-sm leading-relaxed">
            Якщо у вас виникли питання, проблеми з покупкою або пропозиції, 
            напишіть нам у Telegram:
          </p>
        </div>

        <div className="bg-pwa-dark rounded-xl border border-pwa-border p-4">
          <h3 className="text-white text-sm font-semibold mb-2">📱 Telegram</h3>
          <a
            href="https://t.me/BLA_TL"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pwa-yellow text-sm font-medium hover:underline"
          >
            @BLA_TL
          </a>
        </div>

        <div className="bg-pwa-dark rounded-xl border border-pwa-border p-4">
          <h3 className="text-white text-sm font-semibold mb-2">❓ FAQ</h3>
          <div className="space-y-3">
            <div>
              <p className="text-white text-sm font-medium mb-1">Як поповнити баланс?</p>
              <p className="text-pwa-gray text-xs">
                Перейдіть у розділ "Поповнити", оберіть суму та оплатіть 
                за вказаною адресою. Після підтвердження платежу баланс 
                буде поповнено автоматично.
              </p>
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-1">Як отримати дані товару?</p>
              <p className="text-pwa-gray text-xs">
                Після покупки дані з'являються на сторінці товару та в 
                історії покупок. Натисніть "Отримати дані", щоб 
                переглянути логін/пароль або іншу інформацію.
              </p>
            </div>
            <div>
              <p className="text-white text-sm font-medium mb-1">Товар не працює?</p>
              <p className="text-pwa-gray text-xs">
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
