import { useEffect, useRef, useState } from 'react'
import { daysUntil, fullDateLabel } from '../../lib/dates'
import { uid } from '../../lib/updaters'

const MODES = {
  work: { label: 'Фокус', min: 25, emoji: '🍅' },
  short: { label: 'Перерыв', min: 5, emoji: '☕' },
  long: { label: 'Отдых', min: 15, emoji: '🌿' },
}

function Pomodoro() {
  const [mode, setMode] = useState('work')
  const [secs, setSecs] = useState(MODES.work.min * 60)
  const [running, setRunning] = useState(false)
  const [cycles, setCycles] = useState(0)
  const intervalRef = useRef(null)

  const total = MODES[mode].min * 60

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          if (mode === 'work') setCycles((c) => c + 1)
          try {
            // лёгкий сигнал окончания
            new Audio(
              'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
            ).play()
          } catch {
            /* без звука */
          }
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, mode])

  const switchMode = (m) => {
    setRunning(false)
    setMode(m)
    setSecs(MODES[m].min * 60)
  }
  const reset = () => {
    setRunning(false)
    setSecs(MODES[mode].min * 60)
  }

  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')
  const pct = total ? ((total - secs) / total) * 100 : 0
  const R = 88
  const C = 2 * Math.PI * R

  return (
    <div className="card pomo">
      <h2 style={{ justifyContent: 'center' }}>🍅 Помодоро</h2>
      <div className="pomo-modes">
        {Object.entries(MODES).map(([key, m]) => (
          <button
            key={key}
            className={`btn sm${mode === key ? ' primary' : ' ghost'}`}
            onClick={() => switchMode(key)}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      <svg className="pomo-ring" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={R} fill="none" stroke="var(--c2)" strokeWidth="14" />
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke="var(--c5)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C - (pct / 100) * C}
          transform="rotate(-90 100 100)"
          style={{ transition: 'stroke-dashoffset 0.5s linear' }}
        />
        <text x="100" y="108" textAnchor="middle" fontSize="38" fontWeight="800" fill="var(--ink)">
          {mm}:{ss}
        </text>
      </svg>

      <div className="row" style={{ justifyContent: 'center', marginTop: 8 }}>
        <button className="btn primary" onClick={() => setRunning((r) => !r)}>
          {running ? '⏸ Пауза' : '▶ Старт'}
        </button>
        <button className="btn ghost" onClick={reset}>
          ↺ Сброс
        </button>
      </div>
      <div className="cycles">Завершено циклов фокуса: <strong>{cycles}</strong> 🍅</div>
    </div>
  )
}

function Countdown({ state, setState }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')

  const add = () => {
    if (!name.trim() || !date) return
    setState((s) => ({ ...s, events: [...s.events, { id: uid('e'), name: name.trim(), date }] }))
    setName('')
    setDate('')
  }
  const remove = (id) => setState((s) => ({ ...s, events: s.events.filter((e) => e.id !== id) }))

  const sorted = [...state.events].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="card">
      <h2>⏳ Счётчик дней до событий</h2>
      {sorted.length === 0 && <div className="empty">Добавьте важное событие</div>}
      {sorted.map((e) => {
        const d = daysUntil(e.date)
        const txt = d === 0 ? 'сегодня!' : d > 0 ? `${d} дн.` : `${-d} дн. назад`
        return (
          <div className="event-item" key={e.id}>
            <div className="event-days">{d === 0 ? '🎉' : d > 0 ? d : '–'}</div>
            <div style={{ flex: 1 }}>
              <strong>{e.name}</strong>
              <div className="muted">
                {fullDateLabel(e.date)} · {txt}
              </div>
            </div>
            <button className="icon-x" onClick={() => remove(e.id)}>
              ✕
            </button>
          </div>
        )
      })}
      <div className="add-row">
        <input
          className="input"
          placeholder="Название события"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ maxWidth: 170 }} />
        <button className="btn primary" onClick={add}>
          +
        </button>
      </div>
    </div>
  )
}

export default function FocusTab({ state, setState }) {
  return (
    <div className="grid grid-2">
      <Pomodoro />
      <Countdown state={state} setState={setState} />
    </div>
  )
}
