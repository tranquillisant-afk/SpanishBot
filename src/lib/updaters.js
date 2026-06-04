import { emptyWeek, emptyDay } from './defaultState'

let counter = 0
export const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${counter++}`

// Возвращает updater для setState, который меняет одну неделю.
export function updateWeek(weekKey, mutator) {
  return (s) => {
    const week = { ...emptyWeek(), ...(s.weeks[weekKey] || {}) }
    const next = mutator(week) || week
    return { ...s, weeks: { ...s.weeks, [weekKey]: next } }
  }
}

// Возвращает updater для setState, который меняет один день.
export function updateDay(dateKey, mutator) {
  return (s) => {
    const day = { ...emptyDay(), ...(s.days[dateKey] || {}) }
    const next = mutator(day) || day
    return { ...s, days: { ...s.days, [dateKey]: next } }
  }
}

// Подсчёт выполнения недели (доля 0..1).
export function weekTaskStats(week) {
  let total = 0
  let done = 0
  for (let d = 0; d < 7; d++) {
    const list = week.tasks?.[d] || []
    total += list.length
    done += list.filter((t) => t.done).length
  }
  return { total, done, ratio: total ? done / total : 0 }
}

export function weekHabitStats(week, habits) {
  let total = habits.length * 7
  let done = 0
  for (let hi = 0; hi < habits.length; hi++) {
    for (let di = 0; di < 7; di++) {
      if (week.hchecks?.[`${hi}_${di}`]) done++
    }
  }
  return { total, done, ratio: total ? done / total : 0 }
}

export function weekStepsStats(week, goal = 8000) {
  const vals = Object.values(week.steps || {}).map((v) => Number(v) || 0)
  const sum = vals.reduce((a, b) => a + b, 0)
  const daysHit = vals.filter((v) => v >= goal).length
  const avg = vals.length ? sum / 7 : 0
  return { sum, avg, daysHit, ratio: Math.min(1, avg / goal) }
}
