import SEO from '../components/SEO';

export default function Terms() {
  return (
    <div className="px-5 py-6 animate-fade-in">
      <SEO
        title="Умови використання"
        description="Умови використання BLA SHOP. Опис послуг, оплата та повернення, конфіденційність та відповідальність."
        path="/terms"
      />
      <h1 className="text-xl font-bold text-white mb-6">Умови використання</h1>

      <div className="space-y-4">
        <section className="rounded-2xl border border-pwa-border/50 bg-pwa-dark p-6">
          <h2 className="text-white text-[15px] font-semibold mb-3">1. Загальні положення</h2>
          <p className="text-pwa-gray text-sm leading-relaxed">
            Використовуючи BLA SHOP, ви погоджуєтесь з даними умовами.
            Якщо ви не згодні з якоюсь частиною умов, будь ласка,
            не використовуйте наш сервіс.
          </p>
        </section>

        <section className="rounded-2xl border border-pwa-border/50 bg-pwa-dark p-6">
          <h2 className="text-white text-[15px] font-semibold mb-3">2. Опис послуг</h2>
          <p className="text-pwa-gray text-sm leading-relaxed">
            BLA SHOP надає цифрові товари, включаючи акаунти, проксі
            та інструменти для медіабаєрів. Всі товари продаються "як є".
          </p>
        </section>

        <section className="rounded-2xl border border-pwa-border/50 bg-pwa-dark p-6">
          <h2 className="text-white text-[15px] font-semibold mb-3">3. Оплата та повернення</h2>
          <p className="text-pwa-gray text-sm leading-relaxed">
            Усі платежі обробляються через NowPayments. Після успішної
            оплати товар вважається проданим. Повернення можливе лише
            у випадку технічних проблем з товаром, підтверджених
            службою підтримки.
          </p>
        </section>

        <section className="rounded-2xl border border-pwa-border/50 bg-pwa-dark p-6">
          <h2 className="text-white text-[15px] font-semibold mb-3">4. Конфіденційність</h2>
          <p className="text-pwa-gray text-sm leading-relaxed">
            Ми не збираємо особисту інформацію, окрім даних Telegram
            профілю, необхідних для авторизації. Ваші дані не
            передаються третім особам.
          </p>
        </section>

        <section className="rounded-2xl border border-pwa-border/50 bg-pwa-dark p-6">
          <h2 className="text-white text-[15px] font-semibold mb-3">5. Відповідальність</h2>
          <p className="text-pwa-gray text-sm leading-relaxed">
            BLA SHOP не несе відповідальності за використання
            придбаних товарів. Користувач самостійно відповідає за
            дотримання законодавства своєї країни.
          </p>
        </section>

        <p className="text-pwa-gray/70 text-xs font-medium text-center pt-2">
          Останнє оновлення: Червень 2026
        </p>
      </div>
    </div>
  );
}
