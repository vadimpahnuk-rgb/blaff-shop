import { useEffect, useState } from 'react';
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductItems,
  getProductItems,
  deleteProductItem,
} from '../api/admin';
import type { Product, ProductItem } from '../types';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  tags: string;
  category_id: string;
}

const emptyForm: ProductForm = {
  name: '',
  description: '',
  price: '',
  tags: '',
  category_id: '1',
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Items manager state
  const [itemsProduct, setItemsProduct] = useState<Product | null>(null);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [addingItems, setAddingItems] = useState(false);

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
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        category_id: parseInt(form.category_id),
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
      tags: product.tags?.join(', ') || '',
      category_id: product.category_id.toString(),
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

  const openItems = (product: Product) => {
    setItemsProduct(product);
    setBulkText('');
    setItemsLoading(true);
    getProductItems(product.id)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setItemsLoading(false));
  };

  const reloadItems = (productId: number) => {
    getProductItems(productId)
      .then(setItems)
      .catch(() => {});
    loadProducts();
  };

  const handleAddItems = async () => {
    if (!itemsProduct) return;
    const lines = bulkText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    setAddingItems(true);
    try {
      await addProductItems(itemsProduct.id, lines);
      setBulkText('');
      reloadItems(itemsProduct.id);
    } catch (err) {
      alert('Помилка додавання одиниць');
    } finally {
      setAddingItems(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!itemsProduct) return;
    if (!confirm('Видалити одиницю?')) return;
    try {
      await deleteProductItem(itemsProduct.id, itemId);
      reloadItems(itemsProduct.id);
    } catch (err) {
      alert('Помилка видалення');
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
          <div className="bg-pwa-dark rounded-2xl border border-pwa-border/50 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                  placeholder="ID категорії"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full bg-pwa-black border border-pwa-border rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-pwa-yellow/50"
                />
              </div>
              <p className="text-pwa-gray/70 text-xs">
                Наявність визначається кількістю доданих одиниць — керуйте ними через «Одиниці» у списку товарів.
              </p>
              <input
                placeholder="Теги (через кому)"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className="w-full bg-pwa-black border border-pwa-border rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-pwa-yellow/50"
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

      {/* Items manager modal */}
      {itemsProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-pwa-dark rounded-2xl border border-pwa-border/50 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white text-sm font-bold">Одиниці товару</h3>
              <button onClick={() => setItemsProduct(null)} className="text-pwa-gray">✕</button>
            </div>
            <p className="text-pwa-gray text-xs mb-4">{itemsProduct.name}</p>

            {/* Bulk add */}
            <div className="mb-4">
              <p className="text-xs font-medium text-pwa-gray/70 mb-2">
                Додати одиниці (одна на рядок):
              </p>
              <textarea
                placeholder={'login1:pass1\nlogin2:pass2\nhttps://link-3'}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full bg-pwa-black border border-pwa-border rounded-lg px-3 py-2 text-white text-xs font-mono outline-none focus:border-pwa-yellow/50 resize-none h-28"
              />
              <button
                onClick={handleAddItems}
                disabled={addingItems || !bulkText.trim()}
                className="w-full mt-2 py-2.5 bg-pwa-yellow text-pwa-black text-xs font-bold rounded-lg disabled:opacity-50"
              >
                {addingItems ? 'Додавання...' : 'Додати одиниці'}
              </button>
            </div>

            {/* Items list */}
            {itemsLoading ? (
              <Loading text="Завантаження одиниць..." />
            ) : items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 bg-pwa-black rounded-lg border border-pwa-border/50 px-3 py-2"
                  >
                    <span className="flex-1 text-white text-xs font-mono truncate">
                      {item.data}
                    </span>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.is_sold
                          ? 'bg-red-900/50 text-red-400'
                          : 'bg-green-900/50 text-green-400'
                      }`}
                    >
                      {item.is_sold ? 'Продано' : 'Доступно'}
                    </span>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="shrink-0 px-2 py-1 bg-red-900/50 text-red-400 text-xs rounded-lg"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-pwa-gray text-xs text-center py-4">
                Одиниць ще немає — додайте перші вище.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Products list */}
      {products.length > 0 ? (
        <div className="space-y-4 pb-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-pwa-dark rounded-2xl border border-pwa-border/50 p-6"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-white text-sm font-semibold">{product.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-pwa-yellow text-xs font-bold">${product.price.toFixed(2)}</span>
                    <span className={`text-xs ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {product.stock} шт
                    </span>
                    <span className="text-pwa-gray text-xs">
                      продано {product.items_sold ?? 0} / {product.items_total ?? 0}
                    </span>
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

              <button
                onClick={() => openItems(product)}
                className="text-xs text-pwa-gray mt-2 hover:text-white transition-colors"
              >
                🔑 Керувати одиницями
              </button>
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
