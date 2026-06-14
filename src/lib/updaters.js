import { emptyWeek, emptyDay } from './defaultState'
import { weekKeyOf } from './dates'

let counter = 0
export const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${counter++}`

// ---------- Теги задач ----------
export const TASK_TAGS = [null, 'work', 'home', 'study', 'health']
export const TAG_INFO = {
  work:   { label: 'Работа',   color: '#5b8dee' },
  home:   { label: 'Дом',      color: '#52b788' },
  study:  { label: 'Учёба',    color: '#9d74d6' },
  health: { label: 'Здоровье', color: '#f48fb1' },
}
export function nextTag(current) {
  const idx = TASK_TAGS.indexOf(current ?? null)
  return TASK_TAGS[(idx + 1) % TASK_TAGS.length]
}

// ---------- Updaters ----------
export function updateWeek(weekKey, mutator) {
  return (s) => {
    const week = { ...emptyWeek(), ...(s.weeks[weekKey] || {}) }
    const next = mutator(week) || week
    return { ...s, weeks: { ...s.weeks, [weekKey]: next } }
  }
}

export function updateDay(dateKey, mutator) {
  return (s) => {
    const day = { ...emptyDay(), ...(s.days[dateKey] || {}) }
    const next = mutator(day) || day
    return { ...s, days: { ...s.days, [dateKey]: next } }
  }
}

// ---------- Статистика ----------
export function weekTaskStats(week) {
  let total = 0, done = 0
  for (let d = 0; d < 7; d++) {
    const list = week.tasks?.[d] || []
    total += list.length
    done += list.filter((t) => t.done).length
  }
  return { total, done, ratio: total ? done / total : 0 }
}

export function weekHabitStats(week, habits) {
  let total = habits.length * 7, done = 0
  for (let hi = 0; hi < habits.length; hi++)
    for (let di = 0; di < 7; di++)
      if (week.hchecks?.[`${hi}_${di}`]) done++
  return { total, done, ratio: total ? done / total : 0 }
}

export function weekStepsStats(week, goal = 8000) {
  const vals = Object.values(week.steps || {}).map((v) => Number(v) || 0)
  const sum = vals.reduce((a, b) => a + b, 0)
  const daysHit = vals.filter((v) => v >= goal).length
  const avg = vals.length ? sum / 7 : 0
  return { sum, avg, daysHit, ratio: Math.min(1, avg / goal) }
}

// ---------- Стрик привычки ----------
export function habitStreak(state, habitIndex) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayWk = weekKeyOf(today)
  const todayDow = (today.getDay() + 6) % 7
  const todayChecked = !!state.weeks[todayWk]?.hchecks?.[`${habitIndex}_${todayDow}`]
  let streak = todayChecked ? 1 : 0
  for (let offset = 1; offset < 366; offset++) {
    const d = new Date(today)
    d.setDate(today.getDate() - offset)
    const wk = weekKeyOf(d)
    const dow = (d.getDay() + 6) % 7
    if (!state.weeks[wk]?.hchecks?.[`${habitIndex}_${dow}`]) break
    streak++
  }
  return streak
}

// ---------- Автодобавление повторяющихся задач ----------
export function autoFillRecurring(state, weekKey) {
  const templates = state.recurringTasks || []
  if (!templates.length) return null
  const week = { ...emptyWeek(), ...(state.weeks[weekKey] || {}) }
  let tasks = { ...week.tasks }
  let changed = false
  for (const tmpl of templates) {
    for (const dayIdx of tmpl.days || []) {
      const dayTasks = tasks[dayIdx] || []
      if (!dayTasks.some((t) => t.recurringId === tmpl.id)) {
        tasks = {
          ...tasks,
          [dayIdx]: [
            ...dayTasks,
            { id: uid('rt'), recurringId: tmpl.id, text: tmpl.text, tag: tmpl.tag || null, done: false, subtasks: [] },
          ],
        }
        changed = true
      }
    }
  }
  if (!changed) return null
  return { ...state, weeks: { ...state.weeks, [weekKey]: { ...week, tasks } } }
}
