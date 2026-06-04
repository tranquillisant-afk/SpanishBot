import { weekKeyOf } from './dates'

// Дефолтное состояние при первом запуске / пустой строке в БД.
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
  }
}

// Гарантирует наличие всех полей (миграция старого состояния).
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
  }
}

// Пустая структура недели.
export function emptyWeek() {
  return {
    tasks: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
    hchecks: {},
    steps: { 0: '', 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' },
    sleep: { 0: '', 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' },
    study: {}, // { "subjectIndex_dayIndex": hours }
    priorities: ['', '', ''],
    finance: { income: [], expense: [], budget: '' },
    note: '',
  }
}

// Пустая структура дня.
export function emptyDay() {
  return { water: 0, mood: null, gratitude: ['', '', ''] }
}

// Возвращает неделю из состояния (или пустую, не мутируя).
export function getWeek(state, weekKey) {
  return { ...emptyWeek(), ...(state.weeks[weekKey] || {}) }
}

export function getDay(state, dateKey) {
  return { ...emptyDay(), ...(state.days[dateKey] || {}) }
}

export const currentWeekKey = () => weekKeyOf(new Date())
