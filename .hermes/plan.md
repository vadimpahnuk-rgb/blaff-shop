# BLA AFF SHOP — Telegram Mini App

## Концепція
Магазин цифрових товарів для медіабаєрів (акаунти FB, проксі, БМ) у Telegram Mini App.
Бренд: BLA AFF (чорний/жовтий, мінімалізм у стилі X.com).

## Стек
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Drizzle ORM
- **Payments:** NowPayments API (USDT, BTC, ETH)
- **Auth:** Telegram WebApp initData
- **Bot:** Telegraf.js

## Структура проекту
```
/Users/macbook/pwa-x-store/
├── frontend/          # React Mini App
├── backend/           # Express API
├── bot/               # Telegram bot
├── docker-compose.yml
└── README.md
```

---

# СПЕЦИФІКАЦІЯ

## 1. База даних (PostgreSQL)

### Таблиці:

**users**
- id: serial PK
- telegram_id: bigint UNIQUE
- first_name: varchar
- username: varchar
- balance: decimal(18,8) DEFAULT 0 — баланс в USD
- role: varchar DEFAULT 'user' — 'user' | 'admin'
- created_at: timestamp
- is_banned: boolean DEFAULT false

**categories**
- id: serial PK
- name: varchar
- slug: varchar UNIQUE
- icon: varchar (emoji або шлях до іконки)
- sort_order: integer

**products**
- id: serial PK
- category_id: integer FK → categories
- name: varchar
- description: text
- price: decimal(18,8) — ціна в USD
- stock: integer — кількість на складі (0 = немає)
- tags: text[] — масив тегів (KING, USA king, FP, Без Сим тощо)
- data: text — сам товар (логін:пароль, або JSON)
- is_active: boolean DEFAULT true
- created_at: timestamp

**transactions**
- id: serial PK
- user_id: integer FK → users
- type: varchar — 'deposit' | 'purchase'
- amount: decimal(18,8)
- status: varchar — 'pending' | 'completed' | 'failed'
- payment_id: varchar — ID від NowPayments
- product_id: integer FK → products (nullable для deposit)
- created_at: timestamp

**purchases** (історія покупок користувача, дані товару після оплати)
- id: serial PK
- user_id: integer FK → users
- product_id: integer FK → products
- product_data: text — копія data на момент покупки
- price: decimal(18,8)
- created_at: timestamp

### Міграції:
- 001_initial.sql

## 2. Backend (Express API)

### Ендпоїнти:

#### Публічні (з Telegram initData валідацією):
- `POST /api/auth/init` — авторизація через Telegram WebApp
- `GET /api/categories` — список категорій
- `GET /api/products?category_id=&search=&tag=` — товари з фільтрацією
- `GET /api/products/:id` — деталі товару
- `GET /api/user/balance` — баланс користувача
- `GET /api/user/purchases` — історія покупок
- `POST /api/deposit` — створити платіж (NowPayments)
- `POST /api/purchase/:productId` — купити товар
- `GET /api/purchase/:id/data` — отримати дані купленого товару

#### NowPayments Webhook:
- `POST /api/webhooks/nowpayments` — статус платежу

#### Адмін (перевірка role='admin'):
- `GET /api/admin/products` — всі товари
- `POST /api/admin/products` — створити товар
- `PUT /api/admin/products/:id` — оновити товар
- `DELETE /api/admin/products/:id` — видалити товар
- `POST /api/admin/products/:id/restock` — поповнити запас (+N шт)
- `GET /api/admin/users` — список користувачів
- `GET /api/admin/transactions` — транзакції
- `PUT /api/admin/users/:id/role` — зміна ролі
- `PUT /api/admin/users/:id/balance` — скоригувати баланс
- `POST /api/admin/products/:id/give` — видати товар користувачу безкоштовно
- `GET /api/admin/stats` — дашборд (продажі сьогодні/тиждень/місяць, топ товари)

### Мідлвари:
- auth — валідація Telegram WebApp initData
- admin — перевірка ролі

## 3. Frontend (React + Tailwind)

### Теми:
- Бренд PWA-X: чорний (#0a0a0a), білий, жовтий (#f5c518) акцент
- Стиль: мінімалістичний, X.com-подібний

### Сторінки/Компоненти:

**User:**
- `Home` — категорії товарів (плитки з іконками)
- `Catalog` — список товарів з фільтрами (пошук, теги, категорії)
- `ProductDetail` — деталі товару: фото (якщо є), опис, ціна, кнопка "Купити"
- `Cart` / `PurchaseConfirm` — підтвердження покупки
- `Balance` — баланс, кнопка "Поповнити"
- `Deposit` — вибір суми, криптоадреса для оплати
- `Purchases` — історія покупок, кнопка "Отримати дані"
- `Support` — контакти підтримки
- `Terms` — угода користувача
- `Partners` — партнерські посилання

**Admin (доступ через роль admin, через той самий додаток):**
- `AdminDashboard` — дашборд: продажі сьогодні, кількість користувачів, топ товари
- `AdminProducts` — управління товарами (CRUD + restock)
- `AdminUsers` — список юзерів, роль, баланс, бани
- `AdminTransactions` — всі транзакції
- `AdminGive` — видати товар юзеру

**Shared:**
- `Navigation` — нижня навігація (Home, Catalog, Purchases, Profile)
- `HamburgerMenu` — бічне меню (Home, Catalog, Support, Terms, Partners)
- `Header` — лого PWA-X, іконка профілю
- `ProductCard` — картка товару (як на референсі)
- `BalanceBadge` — показує баланс у шапці
- `EmptyState` — коли товарів немає
- `Loading` — спінери/скелетони

### Інтеграція з Telegram:
- `WebApp.ready()` — при запуску
- `WebApp.MainButton` — для підтвердження покупки
- `HapticFeedback` — тактильний зворотній зв'язок

## 4. Telegram Bot (Telegraf.js)

### Команди:
- `/start` — вітальне повідомлення + кнопка "Відкрити магазин" (WebApp)
- `/balance` — баланс
- `/support` — контакти підтримки

### Нотифікації:
- При успішному поповненні балансу
- При покупці — дані товару в особисті повідомлення

### Webhook:
- Express API + bot.telegram.sendMessage()

## 5. Платежі (NowPayments)

**Флоу поповнення:**
1. Користувач вказує суму (від $5 до $1000)
2. Backend створює `transaction` (status=pending)
3. Backend створює інвойс через NowPayments API → отримує адресу для оплати
4. Frontend показує адресу та QR-код
5. NowPayments надсилає webhook на `POST /api/webhooks/nowpayments`
6. Backend оновлює статус `transaction` → completed, баланс зростає
7. Telegram bot надсилає повідомлення про успішне поповнення

## Етапи розробки (порядок)

### Phase 1 — Backend Core
1. Налаштувати Express + TypeScript проект
2. PostgreSQL + Drizzle ORM + міграції
3. Telegram auth middleware (initData валідація)
4. CRUD категорій, товарів
5. Покупка товару (списання балансу, створення запису purchase)

### Phase 2 — Frontend Core
1. Vite + React + Tailwind проект
2. Telegram Mini App інтеграція (WebApp)
3. Home сторінка з категоріями
4. Catalog з фільтрацією
5. ProductCard, ProductDetail
6. Покупка через MainButton

### Phase 3 — Платежі
1. NowPayments API інтеграція
2. Deposit сторінка з адресою/QR
3. Webhook для статусу платежу
4. Оновлення балансу

### Phase 4 — Адмінка
1. Admin дашборд + статистика
2. CRUD товарів
3. Управління користувачами
4. Видати товар юзеру

### Phase 5 — Telegram Bot + Доробки
1. Установка Telegraf.js
2. Команди /start, /balance, /support
3. Нотифікації про платежі
4. Partners сторінка
5. Support, Terms
