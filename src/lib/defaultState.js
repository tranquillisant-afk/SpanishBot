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

// Почасовое расписание: 4 группы дней, у каждой — список блоков
// {id, time, title, sub, color}. Не зависит от конкретной недели.
export const SCHEDULE_GROUPS = ['mwf', 'tt', 'sat', 'sun']

export function emptySchedule() {
  return { mwf: [], tt: [], sat: [], sun: [] }
}

// Стартовое летнее расписание (его можно отредактировать прямо в приложении).
export function seededSchedule() {
  const b = (id, time, title, sub, color) => ({ id, time, title, sub, color })
  return {
    mwf: [
      b('s_mwf_0', '23:00', 'Сон', 'до 8:30 — 9,5 часов', 'sleep'),
      b('s_mwf_1', '8:30', 'Подъём, умывание, завтрак', '30 мин', 'morning'),
      b('s_mwf_2', '9:00', 'Anki — испанский', '30 мин, дома', 'morning'),
      b('s_mwf_3', '9:30', 'Дорога на работу 🚌', '3 статьи на английском — 1,5 часа', 'commute'),
      b('s_mwf_4', '11:00', 'Работа', '~2 часа основных задач', 'work'),
      b('s_mwf_5', '13:00', 'Свободное время на работе 💼', 'Курс (Prof. Writing → Eth. Leadership + UN Women) / мобильные книги · ~2 ч', 'work'),
      b('s_mwf_6', '15:00', 'Дорога домой — английский тренажёр 🚌', '5 квестов, 1,5 часа', 'commute'),
      b('s_mwf_7', '16:30', 'Фитнес + душ 🏋️', '~2 часа', 'fitness'),
      b('s_mwf_8', '18:30', 'Самозанятость — разметка кейсов', '2 часа', 'self'),
      b('s_mwf_9', '20:30', '«Бесконечная шутка» 📖', '2 часа, дома', 'read'),
      b('s_mwf_10', '22:30', 'Досуг', '30 мин — игры, раскраски, прогулка', 'free'),
    ],
    tt: [
      b('s_tt_0', '23:00', 'Сон', 'до 8:30 — 9,5 часов', 'sleep'),
      b('s_tt_1', '8:30', 'Подъём, умывание, завтрак', '30 мин', 'morning'),
      b('s_tt_2', '9:00', 'Anki — испанский', '30 мин, дома', 'morning'),
      b('s_tt_3', '9:30', 'Дорога на работу 🚌', '3 статьи на английском — 1,5 часа', 'commute'),
      b('s_tt_4', '11:00', 'Работа', '~2 часа основных задач', 'work'),
      b('s_tt_5', '13:00', 'Свободное время на работе 💼', 'Курс (Prof. Writing → Eth. Leadership + UN Women) / мобильные книги · ~2 ч', 'work'),
      b('s_tt_6', '15:00', 'Дорога домой — английский тренажёр 🚌', '5 квестов, 1,5 часа', 'commute'),
      b('s_tt_7', '16:30', 'Самозанятость — разметка кейсов', '2 часа', 'self'),
      b('s_tt_8', '18:30', '«Бесконечная шутка» 📖', '2 часа, дома', 'read'),
      b('s_tt_9', '20:30', 'Досуг', '2,5 часа — игры, раскраски, прогулка', 'free'),
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

// Берём только известные группы; если расписание пустое — подставляем стартовое.
function normalizeSchedule(raw) {
  const src = raw && typeof raw === 'object' ? raw : {}
  const out = {}
  let total = 0
  for (const k of SCHEDULE_GROUPS) {
    out[k] = Array.isArray(src[k]) ? src[k] : []
    total += out[k].length
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
