export default function Partners() {
  return (
    <div className="px-4 py-5 animate-fade-in">
      <h1 className="text-xl font-bold text-white mb-1">Партнерська програма</h1>
      <p className="text-pwa-gray text-sm mb-5">Заробляйте з BLA SHOP</p>

      <div className="space-y-4">
        <div className="bg-pwa-dark rounded-xl border border-pwa-border p-4">
          <h3 className="text-white text-sm font-semibold mb-2">💰 Як це працює</h3>
          <p className="text-pwa-gray text-sm leading-relaxed">
            Запрошуйте нових користувачів та отримуйте відсоток від 
            їх покупок. Виплати проводяться щотижня на ваш баланс.
          </p>
        </div>

        <div className="bg-pwa-dark rounded-xl border border-pwa-border p-4">
          <h3 className="text-white text-sm font-semibold mb-2">📊 Ваша статистика</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-pwa-black rounded-lg p-3 text-center">
              <p className="text-pwa-gray text-xs mb-1">Запрошено</p>
              <p className="text-white text-lg font-bold">0</p>
            </div>
            <div className="bg-pwa-black rounded-lg p-3 text-center">
              <p className="text-pwa-gray text-xs mb-1">Зароблено</p>
              <p className="text-pwa-yellow text-lg font-bold">$0.00</p>
            </div>
          </div>
        </div>

        <div className="bg-pwa-dark rounded-xl border border-pwa-border p-4">
          <h3 className="text-white text-sm font-semibold mb-2">🔗 Ваше реферальне посилання</h3>
          <div className="bg-pwa-black rounded-lg p-3 flex items-center gap-2">
            <p className="text-pwa-gray text-xs flex-1 break-all">
              Буде доступно після запуску
            </p>
            <button
              disabled
              className="px-3 py-1.5 bg-pwa-yellow/20 text-pwa-yellow text-xs font-medium rounded-lg"
            >
              Копіювати
            </button>
          </div>
          <p className="text-pwa-gray text-xs mt-2">
            Реферальна програма буде активована після повного запуску магазину
          </p>
        </div>
      </div>
    </div>
  );
}
