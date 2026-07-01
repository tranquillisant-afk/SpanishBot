import { weekKeyOf } from './dates'

export function defaultState() {
  return {
    theme: 'pink',
    userName: 'Солнышко',
    habits: ['Вода', 'Зарядка', 'Чтение', 'Витамины'],
    subjects: ['Математика', 'Английский'],
    wishes: [],
    events: [],
    moodHistory: {},
    weeks: {},
    days: {},
    recurringTasks: [], // [{id, text, tag, days:[0..6]}]
    monthlyGoals: [],   // [{id, text, current:0, target:10, unit:'шт.'}]
    hourlySchedule: seededSchedule(), // почасовое расписание (общее для всех недель)
  }
}

// Почасовое расписание: 7 отдельных дней недели, у каждого — свой список
// блоков {id, time, title, sub, color}. Не зависит от конкретной недели
// (используется одно и то же расписание каждую неделю).
export const SCHEDULE_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export function emptySchedule() {
  return Object.fromEntries(SCHEDULE_DAYS.map((d) => [d, []]))
}

// Стартовое летнее расписание (его можно отредактировать прямо в приложении).
export function seededSchedule() {
  const b = (id, time, title, sub, color) => ({ id, time, title, sub, color })
  const workday = (p) => [
    b(`s_${p}_0`, '23:00', 'Сон', 'до 8:30 — 9,5 часов', 'sleep'),
    b(`s_${p}_1`, '8:30', 'Подъём, умывание, завтрак', '30 мин', 'morning'),
    b(`s_${p}_2`, '9:00', 'Anki — испанский', '30 мин, дома', 'morning'),
    b(`s_${p}_3`, '9:30', 'Дорога на работу 🚌', '3 статьи на английском — 1,5 часа', 'commute'),
    b(`s_${p}_4`, '11:00', 'Работа', '~2 часа основных задач', 'work'),
    b(`s_${p}_5`, '13:00', 'Свободное время на работе 💼', 'Курс (Prof. Writing → Eth. Leadership + UN Women) / мобильные книги · ~2 ч', 'work'),
    b(`s_${p}_6`, '15:00', 'Дорога домой — английский тренажёр 🚌', '5 квестов, 1,5 часа', 'commute'),
  ]
  return {
    mon: [
      ...workday('mon'),
      b('s_mon_7', '16:30', 'Фитнес + душ 🏋️', '~2 часа', 'fitness'),
      b('s_mon_8', '18:30', 'Самозанятость — разметка кейсов', '2 часа', 'self'),
      b('s_mon_9', '20:30', '«Бесконечная шутка» 📖', '2 часа, дома', 'read'),
      b('s_mon_10', '22:30', 'Досуг', '30 мин — игры, раскраски, прогулка', 'free'),
    ],
    wed: [
      ...workday('wed'),
      b('s_wed_7', '16:30', 'Фитнес + душ 🏋️', '~2 часа', 'fitness'),
      b('s_wed_8', '18:30', 'Самозанятость — разметка кейсов', '2 часа', 'self'),
      b('s_wed_9', '20:30', '«Бесконечная шутка» 📖', '2 часа, дома', 'read'),
      b('s_wed_10', '22:30', 'Досуг', '30 мин — игры, раскраски, прогулка', 'free'),
    ],
    fri: [
      ...workday('fri'),
      b('s_fri_7', '16:30', 'Фитнес + душ 🏋️', '~2 часа', 'fitness'),
      b('s_fri_8', '18:30', 'Самозанятость — разметка кейсов', '2 часа', 'self'),
      b('s_fri_9', '20:30', '«Бесконечная шутка» 📖', '2 часа, дома', 'read'),
      b('s_fri_10', '22:30', 'Досуг', '30 мин — игры, раскраски, прогулка', 'free'),
    ],
    tue: [
      ...workday('tue'),
      b('s_tue_7', '16:30', 'Самозанятость — разметка кейсов', '2 часа', 'self'),
      b('s_tue_8', '18:30', '«Бесконечная шутка» 📖', '2 часа, дома', 'read'),
      b('s_tue_9', '20:30', 'Досуг', '2,5 часа — игры, раскраски, прогулка', 'free'),
    ],
    thu: [
      ...workday('thu'),
      b('s_thu_7', '16:30', 'Самозанятость — разметка кейсов', '2 часа', 'self'),
      b('s_thu_8', '18:30', '«Бесконечная шутка» 📖', '2 часа, дома', 'read'),
      b('s_thu_9', '20:30', 'Досуг', '2,5 часа — игры, раскраски, прогулка', 'free'),
    ],
    sat: [
      b('s_sat_0', '23:00', 'Сон', 'до 9:00 — 10 часов', 'sleep'),
      b('s_sat_1', '9:00', 'Подъём, умывание, завтрак', '1 час', 'morning'),
      b('s_sat_2', '10:00', 'Anki — испанский', '30 мин', 'morning'),
      b('s_sat_3', '10:30', 'Занятие по испанскому', 'с Клодом, 30 мин', 'read'),
      b('s_sat_4', '11:00', 'Самозанятость — разметка кейсов', '2 часа', 'self'),
      b('s_sat_5', '13:00', '«Бесконечная шутка» 📖', '2 часа', 'read'),
      b('s_sat_6', '15:00', 'Английский тренажёр', '5 квестов, ~30 мин', 'read'),
      b('s_sat_7', '15:30', 'Досуг', 'свободно до конца дня', 'free'),
    ],
    sun: [
      b('s_sun_0', '23:00', 'Сон', 'до 9:00 — 10 часов', 'sleep'),
      b('s_sun_1', '9:00', 'Подъём, умывание, завтрак', '1 час', 'morning'),
      b('s_sun_2', '10:00', 'Anki — испанский', '30 мин', 'morning'),
      b('s_sun_3', '10:30', 'Самозанятость — разметка кейсов', '2 часа', 'self'),
      b('s_sun_4', '12:30', '«Бесконечная шутка» / досуг 📖', 'по настроению — 1 час', 'read'),
      b('s_sun_5', '13:30', 'Английский тренажёр', '5 квестов, ~30 мин', 'read'),
      b('s_sun_6', '14:00', 'Полностью свободно', 'отдых, прогулки, игры, раскраски', 'free'),
    ],
  }
}

export function normalizeState(raw) {
  const base = defaultState()
  if (!raw || typeof raw !== 'object') return base
  return {
    ...base,
    ...raw,
    habits: Array.isArray(raw.habits) ? raw.habits : base.habits,
    subjects: Array.isArray(raw.subjects) ? raw.subjects : base.subjects,
    wishes: Array.isArray(raw.wishes) ? raw.wishes : [],
    events: Array.isArray(raw.events) ? raw.events : [],
    moodHistory: raw.moodHistory && typeof raw.moodHistory === 'object' ? raw.moodHistory : {},
    weeks: raw.weeks && typeof raw.weeks === 'object' ? raw.weeks : {},
    days: raw.days && typeof raw.days === 'object' ? raw.days : {},
    recurringTasks: Array.isArray(raw.recurringTasks) ? raw.recurringTasks : [],
    monthlyGoals: Array.isArray(raw.monthlyGoals) ? raw.monthlyGoals : [],
    hourlySchedule: normalizeSchedule(raw.hourlySchedule),
  }
}

// Соответствие старых групповых ключей новым дням недели (миграция).
const OLD_GROUP_DAYS = {
  mwf: ['mon', 'wed', 'fri'],
  tt: ['tue', 'thu'],
  weekend: ['sat', 'sun'],
  sat: ['sat'],
  sun: ['sun'],
}

// Приводим к формату «7 дней»; если встречен старый групповой формат —
// раскладываем его по дням; если расписание совсем пустое — подставляем стартовое.
function normalizeSchedule(raw) {
  const src = raw && typeof raw === 'object' ? raw : {}
  const hasDayFormat = SCHEDULE_DAYS.some((d) => Array.isArray(src[d]))

  const out = {}
  let total = 0
  if (hasDayFormat) {
    for (const d of SCHEDULE_DAYS) {
      out[d] = Array.isArray(src[d]) ? src[d] : []
      total += out[d].length
    }
  } else {
    for (const d of SCHEDULE_DAYS) out[d] = []
    for (const [groupKey, days] of Object.entries(OLD_GROUP_DAYS)) {
      if (!Array.isArray(src[groupKey])) continue
      for (const d of days) {
        out[d] = src[groupKey].map((blk, i) => ({ ...blk, id: `${blk.id || 'sb'}_${d}${i}` }))
        total += out[d].length
      }
    }
  }
  return total > 0 ? out : seededSchedule()
}

export function emptyWeek() {
  return {
    tasks: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
    hchecks: {},
    steps: { 0: '', 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' },
    sleep: { 0: '', 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' },
    study: {},
    priorities: ['', '', ''],
    finance: { income: [], expense: [], budget: '' },
    note: '',
  }
}

export function emptyDay() {
  return { water: 0, mood: null, gratitude: ['', '', ''] }
}

export function getWeek(state, weekKey) {
  return { ...emptyWeek(), ...(state.weeks[weekKey] || {}) }
}

export function getDay(state, dateKey) {
  return { ...emptyDay(), ...(state.days[dateKey] || {}) }
}

export const currentWeekKey = () => weekKeyOf(new Date())
