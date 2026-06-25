import { useState } from 'react'
import { uid } from '../../lib/updaters'

// Группы дней. dows — индексы дня недели (0 = Пн … 6 = Вс).
const GROUPS = [
  { key: 'mwf', label: 'Пн / Ср / Пт', dows: [0, 2, 4] },
  { key: 'tt', label: 'Вт / Чт', dows: [1, 3] },
  { key: 'sat', label: 'Суббота', dows: [5] },
  { key: 'sun', label: 'Воскресенье', dows: [6] },
]

// Цветовые типы блоков (фиксированные, не зависят от темы).
const BLOCK_COLORS = [
  { key: 'free',    label: 'Досуг',          bg: '#EAE5DE', border: '#9C9088', ink: '#3A3530' },
  { key: 'sleep',   label: 'Сон',            bg: '#D9D5F5', border: '#7F77DD', ink: '#2A2570' },
  { key: 'morning', label: 'Утро',           bg: '#FAEEDA', border: '#D4902A', ink: '#5A3000' },
  { key: 'commute', label: 'Дорога',         bg: '#D8EAF8', border: '#3A8BD4', ink: '#0A3A6A' },
  { key: 'work',    label: 'Работа',         bg: '#DCF0D0', border: '#5A9A20', ink: '#244010' },
  { key: 'self',    label: 'Самозанятость',  bg: '#FAE0D4', border: '#CC5028', ink: '#4A1B0C' },
  { key: 'fitness', label: 'Фитнес',         bg: '#F5D8E8', border: '#C44A82', ink: '#4B1528' },
  { key: 'read',    label: 'Чтение / учёба', bg: '#C8E8DC', border: '#1A9470', ink: '#043428' },
]
const COLOR_MAP = Object.fromEntries(BLOCK_COLORS.map((c) => [c.key, c]))

// "9:30" → минуты с начала суток; пустое — в конец списка.
function timeVal(t) {
  const m = /^(\d{1,2})[:.\s]?(\d{0,2})$/.exec((t || '').trim())
  if (!m) return 1e9
  return Number(m[1]) * 60 + (Number(m[2]) || 0)
}

function todayGroupKey() {
  const dow = (new Date().getDay() + 6) % 7
  return GROUPS.find((g) => g.dows.includes(dow))?.key || 'mwf'
}

export default function ScheduleTab({ state, setState }) {
  // При каждом открытии вкладки активна группа, к которой относится сегодняшний день.
  const [active, setActive] = useState(todayGroupKey())
  const todayKey = todayGroupKey()

  const blocks = state.hourlySchedule?.[active] || []

  const setBlocks = (fn) => setState((s) => ({
    ...s,
    hourlySchedule: { ...s.hourlySchedule, [active]: fn(s.hourlySchedule?.[active] || []) },
  }))

  const add = () => setBlocks((b) => [...b, { id: uid('sb'), time: '', title: '', sub: '', color: 'free' }])
  const update = (id, field, val) => setBlocks((b) => b.map((x) => x.id === id ? { ...x, [field]: val } : x))
  const remove = (id) => setBlocks((b) => b.filter((x) => x.id !== id))
  const cycleColor = (id) => setBlocks((b) => b.map((x) => {
    if (x.id !== id) return x
    const idx = BLOCK_COLORS.findIndex((c) => c.key === x.color)
    return { ...x, color: BLOCK_COLORS[(idx + 1) % BLOCK_COLORS.length].key }
  }))
  const sortByTime = () => setBlocks((b) => [...b].sort((a, c) => timeVal(a.time) - timeVal(c.time)))

  return (
    <div className="grid">
      <div className="card">
        <h2>⏰ Расписание по часам</h2>
        <p className="muted" style={{ marginTop: -6, marginBottom: 14 }}>
          Общий распорядок дня — один на все недели. Активный день меняется автоматически на сегодняшний.
          Кружок слева от ✕ меняет тип блока.
        </p>

        <div className="sched-tabs">
          {GROUPS.map((g) => (
            <button
              key={g.key}
              className={`sched-tab${active === g.key ? ' active' : ''}`}
              onClick={() => setActive(g.key)}
            >
              {g.label}{g.key === todayKey && <span className="sched-today-dot" title="Сегодня">●</span>}
            </button>
          ))}
        </div>

        {blocks.length === 0 && (
          <div className="empty">Пусто. Добавьте блоки своего распорядка дня для «{GROUPS.find((g) => g.key === active).label}».</div>
        )}

        <div className="timeline">
          {blocks.map((blk) => {
            const c = COLOR_MAP[blk.color] || COLOR_MAP.free
            return (
              <div className="sched-row" key={blk.id}>
                <div className="sched-time">
                  <input
                    value={blk.time}
                    placeholder="9:00"
                    onChange={(e) => update(blk.id, 'time', e.target.value)}
                  />
                </div>
                <div className="sched-conn">
                  <div className="sched-dot" style={{ borderColor: c.border }} />
                  <div className="sched-line" />
                </div>
                <div className="sched-block" style={{ background: c.bg, borderLeftColor: c.border }}>
                  <div className="fields">
                    <input
                      className="title-in"
                      style={{ color: c.ink }}
                      value={blk.title}
                      placeholder="Чем занята…"
                      onChange={(e) => update(blk.id, 'title', e.target.value)}
                    />
                    <input
                      className="sub-in"
                      style={{ color: c.ink }}
                      value={blk.sub}
                      placeholder="детали, длительность"
                      onChange={(e) => update(blk.id, 'sub', e.target.value)}
                    />
                  </div>
                  <button
                    className="sched-color-btn"
                    style={{ color: c.border }}
                    onClick={() => cycleColor(blk.id)}
                    title={`Тип: ${c.label} (нажмите для смены)`}
                  >⬤</button>
                  <button className="icon-x" onClick={() => remove(blk.id)}>✕</button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn primary" onClick={add}>+ Добавить блок</button>
          {blocks.length > 1 && <button className="btn sm" onClick={sortByTime}>↕ По времени</button>}
        </div>
      </div>

      <div className="card soft">
        <h2>🎨 Типы блоков</h2>
        <div className="tag-legend">
          {BLOCK_COLORS.map((c) => (
            <span key={c.key} className="tag-legend-item">
              <span style={{ color: c.border }}>⬤</span> {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
