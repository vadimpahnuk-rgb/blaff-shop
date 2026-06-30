import { useEffect, useState } from 'react';
import { getAdminProducts, createProduct, updateProduct, deleteProduct, restockProduct } from '../api/admin';
import type { Product } from '../types';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  tags: string;
  category_id: string;
  data: string;
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  stock: '0',
  tags: '',
  category_id: '1',
  data: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [restockId, setRestockId] = useState<number | null>(null);
  const [restockQty, setRestockQty] = useState('1');
  const [saving, setSaving] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    getAdminProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        category_id: parseInt(form.category_id),
        data: form.data,
      };

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      loadProducts();
    } catch (err) {
      alert('Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      tags: product.tags?.join(', ') || '',
      category_id: product.category_id.toString(),
      data: product.data || '',
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити товар?')) return;
    try {
      await deleteProduct(id);
      loadProducts();
    } catch (err) {
      alert('Помилка видалення');
    }
  };

  const handleRestock = async (id: number) => {
    try {
      await restockProduct(id, parseInt(restockQty));
      setRestockId(null);
      setRestockQty('1');
      loadProducts();
    } catch (err) {
      alert('Помилка поповнення');
    }
  };

  if (loading) return <Loading text="Завантаження товарів..." />;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-lg font-bold">Товари</h2>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
          className="px-4 py-2 bg-pwa-yellow text-pwa-black text-xs font-bold rounded-lg"
        >
          + Додати
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-pwa-dark rounded-xl border border-pwa-border p-5 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-sm font-bold">
                {editingId ? 'Редагувати товар' : 'Новий товар'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-pwa-gray">✕</button>
            </div>

            <div className="space-y-3">
              <input
                placeholder="Назва"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-pwa-black border border-pwa-border rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-pwa-yellow/50"
              />
              <textarea
                placeholder="Опис"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-pwa-black border border-pwa-border rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-pwa-yellow/50 resize-none h-20"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ціна $"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full bg-pwa-black border border-pwa-border rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-pwa-yellow/50"
                />
                <input
                  type="number"
                  placeholder="Кількість"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full bg-pwa-black border border-pwa-border rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-pwa-yellow/50"
                />
              </div>
              <input
                type="number"
                placeholder="ID категорії"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full bg-pwa-black border border-pwa-border rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-pwa-yellow/50"
              />
              <input
                placeholder="Теги (через кому)"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full bg-pwa-black border border-pwa-border rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-pwa-yellow/50"
              />
              <textarea
                placeholder="Дані товару (логін:пароль або JSON)"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="w-full bg-pwa-black border border-pwa-border rounded-lg px-3 py-2 text-white text-xs font-mono outline-none focus:border-pwa-yellow/50 resize-none h-24"
              />

              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="w-full py-3 bg-pwa-yellow text-pwa-black text-sm font-bold rounded-lg disabled:opacity-50"
              >
                {saving ? 'Збереження...' : 'Зберегти'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products list */}
      {products.length > 0 ? (
        <div className="space-y-3 pb-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-pwa-dark rounded-xl border border-pwa-border p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-white text-sm font-semibold">{product.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-pwa-yellow text-xs font-bold">${product.price.toFixed(2)}</span>
                    <span className={`text-xs ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {product.stock} шт
                    </span>
                    {product.tags?.length > 0 && (
                      <span className="text-pwa-gray text-xs">
                        {product.tags.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="px-2 py-1 bg-pwa-light text-white text-xs rounded-lg"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-2 py-1 bg-red-900/50 text-red-400 text-xs rounded-lg"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Restock */}
              {restockId === product.id ? (
                <div className="flex gap-2 mt-2">
                  <input
                    type="number"
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    className="flex-1 bg-pwa-black border border-pwa-border rounded-lg px-3 py-1.5 text-white text-xs outline-none"
                    min="1"
                  />
                  <button
                    onClick={() => handleRestock(product.id)}
                    className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg"
                  >
                    Додати
                  </button>
                  <button
                    onClick={() => setRestockId(null)}
                    className="px-3 py-1.5 bg-pwa-dark text-pwa-gray text-xs rounded-lg border border-pwa-border"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setRestockId(product.id)}
                  className="text-xs text-pwa-gray mt-2 hover:text-white transition-colors"
                >
                  + Поповнити запас
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📦"
          title="Товарів немає"
          description="Додайте перший товар"
          action={{ label: 'Додати товар', onClick: () => { setShowForm(true); setForm(emptyForm); } }}
        />
      )}
    </div>
  );
}
