# Утильсбор — калькулятор (Next.js + Tailwind)

## Локальный запуск
```bash
npm i
npm run dev
# откройте http://localhost:3000
```

## Деплой на Vercel
1. Создайте аккаунт на https://vercel.com и (опционально) установите CLI: `npm i -g vercel`.
2. Загрузите папку проекта в новый репозиторий GitHub.
3. В Vercel нажмите **New Project** → выберите репозиторий → **Import**.
4. Leave defaults: Framework = Next.js, Build Command = `next build`.
5. Нажмите **Deploy** — получите URL вида `https://…vercel.app`.

> Все ставки сохраняются в `localStorage`. Чтобы задать общие дефолты, редактируйте `loadPeriods()` или разошлите JSON для импорта.
