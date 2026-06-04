// Утилиты для работы с датами. Все ключи — ISO-строки YYYY-MM-DD
// в локальном времени (без сдвига часового пояса).

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const MONTH_NAMES = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
]
const MONTH_NAMES_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]

export const dayNames = DAY_NAMES
export const monthNames = MONTH_NAMES

// Локальный ISO-ключ (без UTC-сдвига).
export function toKey(date) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Понедельник недели, к которой относится дата.
export function mondayOf(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const dow = (d.getDay() + 6) % 7 // 0 = Пн
  d.setDate(d.getDate() - dow)
  return d
}

export function weekKeyOf(date) {
  return toKey(mondayOf(date))
}

// Массив из 7 объектов Date начиная с понедельника недели.
export function weekDays(weekKey) {
  const monday = fromKey(weekKey)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function isSameDay(a, b) {
  return toKey(a) === toKey(b)
}

export function isToday(date) {
  return isSameDay(date, new Date())
}

// «27 окт – 2 ноя» для шапки недели.
export function weekRangeLabel(weekKey) {
  const days = weekDays(weekKey)
  const a = days[0]
  const b = days[6]
  const left = `${a.getDate()} ${MONTH_NAMES_GEN[a.getMonth()].slice(0, 3)}`
  const right = `${b.getDate()} ${MONTH_NAMES_GEN[b.getMonth()].slice(0, 3)}`
  return `${left} – ${right}`
}

export function fullDateLabel(date) {
  const d = new Date(date)
  return `${d.getDate()} ${MONTH_NAMES_GEN[d.getMonth()]} ${d.getFullYear()}`
}

// Сетка месяца (для мини-календаря): массив недель по 7 ячеек,
// null для пустых дней до/после месяца.
export function monthGrid(year, month) {
  const first = new Date(year, month, 1)
  const startDow = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

// Количество полных дней между сегодня и целевой датой (date — ISO-ключ).
export function daysUntil(dateKey) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = fromKey(dateKey)
  target.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}
