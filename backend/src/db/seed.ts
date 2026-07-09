import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { db, pool } from './index';
import { users, categories, products } from './schema';

async function seed() {
  console.log('[seed] starting...');

  // ---- Admin user (upsert by telegram_id) ----
  // Set ADMIN_TELEGRAM_ID to your own Telegram id to make yourself admin.
  const adminTelegramId = Number(process.env.ADMIN_TELEGRAM_ID) || 123456789;
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.telegramId, adminTelegramId))
    .limit(1);

  if (existingAdmin.length === 0) {
    await db.insert(users).values({
      telegramId: adminTelegramId,
      firstName: 'Admin',
      username: 'admin',
      role: 'admin',
      balance: '1000',
    });
    console.log('[seed] created admin user');
  } else {
    console.log('[seed] admin user already exists, skipping');
  }

  // ---- Categories (upsert by slug) ----
  const categorySeed = [
    { name: 'Facebook Accounts', slug: 'facebook-accounts', icon: '📘', sortOrder: 1 },
    { name: 'Proxies', slug: 'proxies', icon: '🌐', sortOrder: 2 },
    { name: 'Business Manager', slug: 'business-managers', icon: '💼', sortOrder: 3 },
    { name: 'Other', slug: 'other', icon: '📦', sortOrder: 4 },
    { name: 'Фарм ФБ', slug: 'farm-fb', icon: '👤', sortOrder: 5 },
    { name: 'Агентські кабінети', slug: 'agency-cabinets', icon: '🏢', sortOrder: 6 },
    { name: 'Партнери', slug: 'partners', icon: '🤝', sortOrder: 7 },
    { name: 'Spy-сервіси', slug: 'spy-services', icon: '🕵️', sortOrder: 8 },
    { name: 'PWA', slug: 'pwa', icon: '📲', sortOrder: 9 },
    { name: 'Дизайнери', slug: 'designers', icon: '🎨', sortOrder: 10 },
    { name: 'Антидетект-браузери', slug: 'antidetect', icon: '🛡️', sortOrder: 11 },
    { name: 'Трекери', slug: 'trackers', icon: '📊', sortOrder: 12 },
    { name: 'Клоакінг-сервіси', slug: 'cloaking', icon: '🎭', sortOrder: 13 },
  ];

  const categoryIdBySlug: Record<string, number> = {};
  for (const cat of categorySeed) {
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, cat.slug))
      .limit(1);

    if (existing.length === 0) {
      const [inserted] = await db.insert(categories).values(cat).returning();
      categoryIdBySlug[cat.slug] = inserted.id;
      console.log(`[seed] created category: ${cat.name}`);
    } else {
      categoryIdBySlug[cat.slug] = existing[0].id;
      console.log(`[seed] category exists: ${cat.name}, skipping`);
    }
  }

  // ---- Products (upsert by name) ----
  const productSeed = [
    {
      categorySlug: 'facebook-accounts',
      name: 'Facebook Aged Account (2018)',
      description:
        'Aged Facebook account created in 2018. Email verified, with friends and activity history. Comes with login + email access.',
      price: '12.50000000',
      stock: 25,
      tags: ['aged', 'verified', 'usa'],
      data: 'login: fb_user_2018@example.com\npassword: S3cretP@ss\nemail: recovery_2018@mail.com\nemail_pass: M@ilPass1',
    },
    {
      categorySlug: 'facebook-accounts',
      name: 'Facebook Account with 50+ Friends',
      description:
        'Fresh-ish account warmed up with 50+ friends. Phone + email verified. Ready for ads after warmup.',
      price: '8.00000000',
      stock: 40,
      tags: ['warmed', 'friends', 'verified'],
      data: 'login: fb_friends@example.com\npassword: Fr1endsPass\n2fa: disabled',
    },
    {
      categorySlug: 'proxies',
      name: 'Residential Proxy (US) - 30 days',
      description:
        'Dedicated US residential proxy. Unlimited bandwidth for 30 days. HTTP + SOCKS5 supported.',
      price: '5.99000000',
      stock: 100,
      tags: ['residential', 'usa', 'socks5'],
      data: 'host: 192.0.2.10\nport: 8080\nuser: proxyuser\npass: proxyPass123\ntype: socks5',
    },
    {
      categorySlug: 'business-managers',
      name: 'Verified Business Manager (BM5)',
      description:
        'Verified Facebook Business Manager with 5 ad account slots. No spend limit restrictions. Includes admin access.',
      price: '45.00000000',
      stock: 10,
      tags: ['bm5', 'verified', 'no-limit'],
      data: 'bm_id: 100200300400\nadmin_login: bm_admin@example.com\nadmin_pass: BmAdm1nPass\nad_accounts: 5',
    },
    {
      categorySlug: 'other',
      name: 'Gmail Account (Aged + App Password)',
      description:
        'Aged Gmail account with app password enabled. Suitable for account recovery and registrations.',
      price: '3.25000000',
      stock: 60,
      tags: ['gmail', 'aged', 'app-password'],
      data: 'email: aged_gmail_user@gmail.com\npassword: Gm@ilPass\napp_password: abcd efgh ijkl mnop',
    },
    {
      categorySlug: 'farm-fb',
      name: 'Фарм ФБ акаунт (30+ днів)',
      description:
        'Прогрітий Facebook акаунт, фарм 30+ днів. Пройдена активність, друзі, заповнений профіль. Готовий під рекламу після прогріву.',
      price: '15.00000000',
      stock: 20,
      tags: ['farm', 'aged', 'warmed'],
      data: 'login: farm_user@example.com\npassword: FarmP@ss1\nemail: recovery@mail.com',
    },
    {
      categorySlug: 'agency-cabinets',
      name: 'Агентський кабінет (Agency Ad Account)',
      description:
        'Агентський рекламний кабінет. Підвищені ліміти витрат, стабільний траст. Видається з доступом та інструкцією.',
      price: '99.00000000',
      stock: 5,
      tags: ['agency', 'no-limit', 'premium'],
      data: 'account_id: act_1234567890\naccess: shared\nlimit: unlimited',
    },
    {
      categorySlug: 'business-managers',
      name: 'BM (Business Manager) — готовий',
      description:
        'Готовий Business Manager з вільними слотами під рекламні кабінети. Адмін-доступ, без обмежень по спенду.',
      price: '35.00000000',
      stock: 15,
      tags: ['bm', 'verified', 'ready'],
      data: 'bm_id: 900800700600\nadmin_login: bm_ready@example.com\nadmin_pass: BmReadyP@ss',
    },
    {
      categorySlug: 'partners',
      name: 'Антидетект браузер (партнер)',
      description:
        'Партнерський сервіс — антидетект браузер для мультиакаунтингу. Знижка за нашим посиланням. Поле data містить партнерське посилання.',
      price: '0.00000000',
      stock: 999,
      tags: ['partner', 'antidetect', 'referral'],
      data: 'https://example-partner.com/?ref=blashop',
    },
    // ---- Facebook Accounts ----
    {
      categorySlug: 'facebook-accounts',
      name: 'Facebook Account (2016) — 8+ years old',
      description:
        'Aged Facebook account created in 2016 (8+ years old). Strong trust score, real activity history. Delivered with login + email access.',
      price: '25.00000000',
      stock: 10,
      tags: ['aged', 'high-quality'],
      data: 'login: fb_2016@example.com\npassword: Aged2016P@ss\nemail: recovery_2016@mail.com',
    },
    {
      categorySlug: 'facebook-accounts',
      name: 'Facebook Account (2020) — 5+ years old',
      description:
        'Aged Facebook account created in 2020 (5+ years old). Trusted profile, email verified. Delivered with login + email access.',
      price: '15.00000000',
      stock: 20,
      tags: ['aged', 'trusted'],
      data: 'login: fb_2020@example.com\npassword: Aged2020P@ss\nemail: recovery_2020@mail.com',
    },
    {
      categorySlug: 'facebook-accounts',
      name: 'Facebook BM Invite Ready Account',
      description:
        'Facebook account prepared and ready to accept a Business Manager invite. Delivered with login + email access.',
      price: '10.00000000',
      stock: 30,
      tags: ['bm-ready'],
      data: 'login: fb_bm_ready@example.com\npassword: BmReadyP@ss\nemail: recovery_bmready@mail.com',
    },
    // ---- Business Manager ----
    {
      categorySlug: 'business-managers',
      name: 'BM 250 (2 ad accounts)',
      description:
        'Business Manager with a $250 daily limit and 2 ad accounts ready to use. Admin access included.',
      price: '30.00000000',
      stock: 8,
      tags: ['bm', 'ready', '250'],
      data: 'bm_id: 250250250250\nadmin_login: bm250@example.com\nadmin_pass: Bm250P@ss\nad_accounts: 2\nlimit: 250',
    },
    {
      categorySlug: 'business-managers',
      name: 'BM 2500 (high limit)',
      description:
        'High-limit Business Manager with a $2500 daily limit. Trusted, ready for scaling. Admin access included.',
      price: '120.00000000',
      stock: 5,
      tags: ['bm', 'high-limit', '2500'],
      data: 'bm_id: 250025002500\nadmin_login: bm2500@example.com\nadmin_pass: Bm2500P@ss\nlimit: 2500',
    },
    // ---- Agency ----
    {
      categorySlug: 'agency-cabinets',
      name: 'Agency Ad Account (no spend limit)',
      description:
        'Agency ad account with no spend limit. Premium trust, stable. Delivered with access and instructions.',
      price: '100.00000000',
      stock: 3,
      tags: ['agency', 'no-limit'],
      data: 'account_id: act_9000000001\naccess: shared\nlimit: unlimited',
    },
    {
      categorySlug: 'agency-cabinets',
      name: 'Agency Ad Account (spent 10k+)',
      description:
        'Aged agency ad account with 10k+ USD spend history. Maximum trust for aggressive scaling. Delivered with access and instructions.',
      price: '150.00000000',
      stock: 2,
      tags: ['agency', 'spent'],
      data: 'account_id: act_9000000002\naccess: shared\nspent: 10000+\nlimit: unlimited',
    },
  ];

  for (const p of productSeed) {
    const existing = await db
      .select()
      .from(products)
      .where(eq(products.name, p.name))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(products).values({
        categoryId: categoryIdBySlug[p.categorySlug] ?? null,
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        tags: p.tags,
        data: p.data,
        isActive: true,
      });
      console.log(`[seed] created product: ${p.name}`);
    } else {
      console.log(`[seed] product exists: ${p.name}, skipping`);
    }
  }

  console.log('[seed] done.');
}

seed()
  .catch((err) => {
    console.error('[seed] failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
