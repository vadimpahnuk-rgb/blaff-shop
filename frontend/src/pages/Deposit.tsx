import { useState } from 'react';
import { createDeposit } from '../api/user';
import Loading from '../components/Loading';
import type { DepositResponse } from '../types';

const depositAmounts = [20, 50, 100, 200, 500, 1000];

export default function Deposit() {
  const [amount, setAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [deposit, setDeposit] = useState<DepositResponse | null>(null);
  const [error, setError] = useState('');

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount('');
    setError('');
  };

  const handleCustomAmount = (val: string) => {
    setCustomAmount(val);
    const num = parseFloat(val);
    if (num >= 20) {
      setAmount(num);
      setError('');
    } else {
      setError('Мінімальна сума: $20');
    }
  };

  const handleDeposit = async () => {
    if (amount < 20) {
      setError('Мінімальна сума поповнення: $20');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await createDeposit(amount);
      setDeposit(result);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Помилка створення платежу');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Створення платежу..." />;

  if (deposit) {
    return (
      <div className="px-5 py-6 animate-fade-in">
        <div className="rounded-2xl border border-pwa-border/50 bg-pwa-dark p-6">
          <h2 className="text-white text-lg font-extrabold mb-1 text-center">Оплата</h2>
          <p className="text-pwa-gray text-sm text-center mb-5">
            Відправте точну суму на вказану адресу
          </p>

          {/* Amount to send */}
          <div className="bg-pwa-black rounded-xl p-4 mb-3 text-center">
            <p className="text-xs font-medium text-pwa-gray/70 mb-2">Відправте точно:</p>
            {deposit.pay_amount != null ? (
              <p className="text-white text-3xl font-extrabold leading-none break-all select-all">
                {deposit.pay_amount} {deposit.currency}
              </p>
            ) : (
              <p className="text-white text-3xl font-extrabold leading-none">{deposit.currency}</p>
            )}
            <p className="text-xs font-medium text-pwa-gray/70 mt-2">≈ ${deposit.amount.toFixed(2)}</p>
          </div>

          {/* Payment ID */}
          <div className="bg-pwa-black rounded-xl p-4 mb-3">
            <p className="text-xs font-medium text-pwa-gray/70 mb-2">ID платежу:</p>
            <p className="text-white text-sm font-mono break-all">{deposit.payment_id}</p>
          </div>

          {/* Address */}
          <div className="bg-pwa-black rounded-xl p-4 mb-3">
            <p className="text-xs font-medium text-pwa-gray/70 mb-2">Адреса для оплати:</p>
            <p className="text-white text-xs font-mono break-all select-all">{deposit.address}</p>
          </div>

          {/* QR placeholder */}
          <div className="flex justify-center mb-4">
            <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center">
              <div className="w-44 h-44 bg-pwa-black rounded-xl flex items-center justify-center">
                {deposit.qr_code ? (
                  <img src={deposit.qr_code} alt="QR Code" className="w-full h-full" />
                ) : (
                  <span className="text-pwa-gray text-xs text-center px-4">
                    QR код буде доступний після налаштування NowPayments
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs font-medium text-pwa-gray/70 text-center">
            Після оплати баланс буде поповнено автоматично
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6 animate-fade-in">
      <h1 className="text-xl font-bold text-white mb-1">Поповнення балансу</h1>
      <p className="text-sm font-medium text-pwa-gray/70 mb-4">Виберіть суму для поповнення</p>

      {/* Preset amounts */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {depositAmounts.map((val) => (
          <button
            key={val}
            onClick={() => handleAmountSelect(val)}
            className={`py-4 rounded-2xl text-sm font-bold border transition-all active:scale-[0.98] ${
              amount === val && !customAmount
                ? 'bg-pwa-yellow text-pwa-black border-pwa-yellow'
                : 'bg-pwa-dark text-white border-pwa-border/50 hover:border-pwa-yellow/30'
            }`}
          >
            ${val}
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="mb-4">
        <p className="text-xs font-medium text-pwa-gray/70 mb-2">Або введіть свою суму:</p>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pwa-gray font-medium">$</span>
          <input
            type="number"
            min="5"
            step="0.01"
            placeholder="5 - 1000"
            value={customAmount}
            onChange={(e) => handleCustomAmount(e.target.value)}
            className="w-full bg-pwa-dark border border-pwa-border/50 rounded-xl px-4 py-3.5 pl-8 text-white text-sm placeholder-pwa-gray outline-none focus:border-pwa-yellow/50 transition-colors"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-xs mb-4">{error}</p>
      )}

      {/* Submit */}
      <button
        onClick={handleDeposit}
        disabled={amount < 5}
        className={`w-full py-4 rounded-xl text-base font-bold transition-all active:scale-[0.98] ${
          amount >= 5
            ? 'bg-pwa-yellow text-pwa-black hover:brightness-110'
            : 'bg-pwa-dark text-pwa-gray cursor-not-allowed'
        }`}
      >
        Поповнити на ${amount.toFixed(2)}
      </button>

      <p className="text-xs font-medium text-pwa-gray/70 text-center mt-4">
        Мінімальна сума: $20 · Максимальна: $1000
      </p>
    </div>
  );
}
