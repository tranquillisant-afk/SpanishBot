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
  }
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
