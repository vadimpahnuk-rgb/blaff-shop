export default function Terms() {
  return (
    <div className="px-4 py-5 animate-fade-in">
      <h1 className="text-xl font-bold text-white mb-4">Умови використання</h1>

      <div className="space-y-4 text-sm text-pwa-gray leading-relaxed">
        <section className="bg-pwa-dark rounded-xl border border-pwa-border p-4">
          <h2 className="text-white font-semibold mb-2">1. Загальні положення</h2>
          <p>
            Використовуючи PWA-X Store, ви погоджуєтесь з даними умовами. 
            Якщо ви не згодні з якоюсь частиною умов, будь ласка, 
            не використовуйте наш сервіс.
          </p>
        </section>

        <section className="bg-pwa-dark rounded-xl border border-pwa-border p-4">
          <h2 className="text-white font-semibold mb-2">2. Опис послуг</h2>
          <p>
            PWA-X Store надає цифрові товари, включаючи акаунти, проксі 
            та інструменти для медіабаєрів. Всі товари продаються "як є".
          </p>
        </section>

        <section className="bg-pwa-dark rounded-xl border border-pwa-border p-4">
          <h2 className="text-white font-semibold mb-2">3. Оплата та повернення</h2>
          <p>
            Усі платежі обробляються через NowPayments. Після успішної 
            оплати товар вважається проданим. Повернення можливе лише 
            у випадку технічних проблем з товаром, підтверджених 
            службою підтримки.
          </p>
        </section>

        <section className="bg-pwa-dark rounded-xl border border-pwa-border p-4">
          <h2 className="text-white font-semibold mb-2">4. Конфіденційність</h2>
          <p>
            Ми не збираємо особисту інформацію, окрім даних Telegram 
            профілю, необхідних для авторизації. Ваші дані не 
            передаються третім особам.
          </p>
        </section>

        <section className="bg-pwa-dark rounded-xl border border-pwa-border p-4">
          <h2 className="text-white font-semibold mb-2">5. Відповідальність</h2>
          <p>
            PWA-X Store не несе відповідальності за використання 
            придбаних товарів. Користувач самостійно відповідає за 
            дотримання законодавства своєї країни.
          </p>
        </section>

        <p className="text-pwa-gray text-xs text-center pt-4">
          Останнє оновлення: Червень 2026
        </p>
      </div>
    </div>
  );
}
