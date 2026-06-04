# 🌸 Недельный планер

Веб-приложение «Недельный планер» на **React + Vite** с синхронизацией данных
через **Supabase** (realtime между устройствами). Пастельный минималистичный
дизайн с пятью темами.

> ℹ️ В этом репозитории также живёт отдельный Telegram-бот для испанских фраз
> (`bot.py`, `phrases.csv`) — он не связан с планером и работает независимо.

## ✨ Возможности

- **Неделя** — приоритеты недели (3 поля), мини-календарь месяца, сетка задач
  по 7 дням (добавить / отметить / удалить), заметки недели.
- **Трекеры** — редактируемая таблица привычек на 7 дней, шаги (ввод + столбики,
  цель 8000), сон (ввод + столбики, норма 7–9 ч), таблица учёбы «предметы × дни».
- **Фокус** — Помодоро-таймер (25 / 5 / 15 мин, старт / пауза / сброс, счётчик
  циклов) и счётчик дней до событий.
- **День** — вода (8 стаканов), настроение (5 эмодзи), благодарность (3 поля),
  финансы недели (бюджет, доходы / расходы, итоги).
- **Статистика** — счёт недели (кольца: задачи × 40 % + привычки × 40 % +
  шаги × 20 %), сводные карточки, график настроения, прогресс-бары привычек,
  графики сна и шагов.
- **Архив** — список недель с данными, детали по клику.
- Сверху всегда: приветствие с редактируемым именем, переключение недель
  (← / → / сегодня), 5 пастельных тем, цитата дня, список желаний.
- **Экспорт / импорт JSON** в настройках для резервных копий.

## 🧱 Стек

React 18 · Vite 5 · @supabase/supabase-js · recharts · деплой на Vercel.

## 🗂 Как хранятся данные

Всё состояние приложения — **один JSON-объект** в строке с `id = 1` таблицы
`planner_state`. Изменения сохраняются с debounce 600 мс (`upsert` строки
`id = 1`), а realtime-подписка подтягивает изменения с других устройств
(локальный state обновляется, только если `updated_at` новее). Если ключи
Supabase не заданы, приложение работает оффлайн на `localStorage`.

```
{
  theme, userName,
  habits: [строки],
  subjects: [строки],
  wishes: [{ id, text, done }],
  events: [{ id, name, date }],
  moodHistory: { dateKey: moodIndex },
  weeks: { weekKey: { tasks, hchecks, steps, sleep, study, priorities, finance, note } },
  days:  { dateKey: { water, mood, gratitude } }
}
```

`weekKey` — ISO-дата понедельника недели, `dateKey` — ISO-дата дня.

---

## 🚀 Запуск локально

```bash
npm install
cp .env.example .env   # впишите ключи Supabase (см. ниже)
npm run dev
```

Откройте адрес, который выведет Vite (обычно <http://localhost:5173>).

> Без ключей Supabase приложение всё равно запустится — данные будут храниться
> только в текущем браузере (`localStorage`), без синхронизации.

---

## 🛠 Настройка Supabase

### 1. Создайте проект

1. Зайдите на <https://supabase.com> → **New project**.
2. Задайте имя, пароль БД и регион → **Create new project**.

### 2. Создайте таблицу (SQL)

Откройте **SQL Editor** → **New query**, вставьте содержимое файла
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
и нажмите **Run**. Скрипт:

- создаёт таблицу `planner_state (id, data jsonb, updated_at timestamptz)`;
- засевает строку `id = 1`;
- включает Realtime для таблицы;
- настраивает RLS-политики на чтение/запись по anon-ключу.

> ⚠️ Политики из миграции разрешают доступ всем по anon-ключу (планер
> однопользовательский, данные несекретные). Для приватного использования
> ужесточите политики под свою авторизацию Supabase.

### 3. Скопируйте ключи

**Project Settings → API**:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** key → `VITE_SUPABASE_ANON_KEY`

Впишите их в `.env`:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> Префикс `VITE_` обязателен — иначе Vite не передаст переменные в браузер.

### 4. Проверьте Realtime

**Database → Replication** (или **Realtime**) — убедитесь, что таблица
`planner_state` входит в публикацию `supabase_realtime` (миграция добавляет её
автоматически).

---

## ☁️ Деплой на Vercel

1. Запушьте репозиторий на GitHub.
2. На <https://vercel.com> → **Add New… → Project** → импортируйте репозиторий.
3. Framework Preset определится как **Vite** автоматически
   (см. `vercel.json`): build `npm run build`, output `dist`.
4. В **Settings → Environment Variables** добавьте:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Нажмите **Deploy**. Готово 🎉

> После изменения переменных окружения сделайте **Redeploy**, чтобы Vite
> пересобрал приложение с новыми значениями.

---

## 📁 Структура проекта

```
.
├─ index.html
├─ vite.config.js
├─ vercel.json
├─ .env.example
├─ supabase/migrations/0001_init.sql   # SQL-миграция таблицы
└─ src/
   ├─ main.jsx
   ├─ App.jsx
   ├─ index.css
   ├─ hooks/usePlanner.js              # загрузка / debounce-save / realtime
   ├─ lib/                             # supabase, даты, темы, цитаты, состояние
   └─ components/
      ├─ Header.jsx, WishList.jsx, Settings.jsx
      └─ tabs/                         # Week, Trackers, Focus, Day, Stats, Archive
```

## 💾 Резервные копии

В шапке нажмите ⚙️ → **Экспорт JSON** (скачать бэкап) или **Импорт JSON**
(восстановить). Импорт полностью заменяет текущее состояние и сразу сохраняет
его в Supabase.
