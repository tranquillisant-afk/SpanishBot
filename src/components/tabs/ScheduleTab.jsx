import { useState } from 'react'
import { dayNames } from '../../lib/dates'
import { SCHEDULE_DAYS } from '../../lib/defaultState'
import { uid } from '../../lib/updaters'

// Дни недели в порядке Пн…Вс, ключи совпадают с hourlySchedule.
const DAYS = SCHEDULE_DAYS.map((key, i) => ({ key, label: dayNames[i] }))

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

function todayDayKey() {
  const dow = (new Date().getDay() + 6) % 7
  return DAYS[dow].key
}

// ---------- Копирование расписания на другие дни ----------
function CopyToPanel({ active, onCopy }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState([])
  const others = DAYS.filter((d) => d.key !== active)

  const toggle = (key) => setSelected((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])
  const confirm = () => {
    if (!selected.length) return
    onCopy(selected)
    setSelected([])
    setOpen(false)
  }

  if (!open) {
    return <button className="btn sm" onClick={() => setOpen(true)}>📋 Скопировать это расписание в…</button>
  }

  return (
    <div className="sched-copy-panel">
      <div className="muted" style={{ marginBottom: 6 }}>Скопировать расписание «{DAYS.find((d) => d.key === active).label}» в:</div>
      <div className="day-picker">
        {others.map((d) => (
          <button key={d.key} className={`day-pick-btn${selected.includes(d.key) ? ' active' : ''}`} onClick={() => toggle(d.key)}>
            {d.label}
          </button>
        ))}
      </div>
      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn primary sm" onClick={confirm} disabled={!selected.length}>Скопировать</button>
        <button className="btn sm ghost" onClick={() => { setOpen(false); setSelected([]) }}>Отмена</button>
      </div>
    </div>
  )
}

// ---------- Очистка расписания дня ----------
function ClearButton({ onClear }) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return <button className="btn sm danger" onClick={() => setConfirming(true)}>🗑 Очистить расписание</button>
  }

  return (
    <span className="row" style={{ gap: 6 }}>
      <span className="muted">Точно удалить все блоки этого дня?</span>
      <button className="btn sm danger" onClick={() => { onClear(); setConfirming(false) }}>Да, очистить</button>
      <button className="btn sm ghost" onClick={() => setConfirming(false)}>Отмена</button>
    </span>
  )
}

export default function ScheduleTab({ state, setState }) {
  // При каждом открытии вкладки активен день, соответствующий сегодняшнему.
  const [active, setActive] = useState(todayDayKey())
  const todayKey = todayDayKey()

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
  const clear = () => setBlocks(() => [])

  const copyTo = (targetKeys) => setState((s) => {
    const source = s.hourlySchedule?.[active] || []
    const next = { ...s.hourlySchedule }
    for (const key of targetKeys) {
      next[key] = source.map((blk, i) => ({ ...blk, id: uid(`sb_${key}${i}`) }))
    }
    return { ...s, hourlySchedule: next }
  })

  return (
    <div className="grid">
      <div className="card">
        <h2>⏰ Расписание по часам</h2>
        <p className="muted" style={{ marginTop: -6, marginBottom: 14 }}>
          Своё расписание на каждый день недели. Активный день меняется автоматически на сегодняшний.
          Кружок слева от ✕ меняет тип блока.
        </p>

        <div className="sched-tabs">
          {DAYS.map((d) => (
            <button
              key={d.key}
              className={`sched-tab${active === d.key ? ' active' : ''}`}
              onClick={() => setActive(d.key)}
            >
              {d.label}{d.key === todayKey && <span className="sched-today-dot" title="Сегодня">●</span>}
            </button>
          ))}
        </div>

        {blocks.length === 0 && (
          <div className="empty">Пусто. Добавьте блоки распорядка дня для «{DAYS.find((d) => d.key === active).label}» или скопируйте с другого дня.</div>
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
          {blocks.length > 0 && <ClearButton onClear={clear} />}
        </div>

        {blocks.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed var(--c3)' }}>
            <CopyToPanel active={active} onCopy={copyTo} />
          </div>
        )}
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
