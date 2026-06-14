import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, ReferenceArea,
} from 'recharts'
import { weekDays, dayNames, toKey } from '../../lib/dates'
import { getWeek } from '../../lib/defaultState'
import { weekTaskStats, weekHabitStats, weekStepsStats, uid } from '../../lib/updaters'

const MOODS = ['😢', '🙁', '😐', '🙂', '😄']

function Ring({ value, label, color }) {
  const R = 46, C = 2 * Math.PI * R
  return (
    <div className="ring-wrap">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={R} fill="none" stroke="var(--c2)" strokeWidth="12" />
        <circle cx="60" cy="60" r={R} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C - value * C}
          transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 0.5s' }} />
        <text x="60" y="67" textAnchor="middle" fontSize="24" fontWeight="800" fill="var(--ink)">{Math.round(value * 100)}%</text>
      </svg>
      <div className="ring-label">{label}</div>
    </div>
  )
}

// ---------- Цели месяца ----------
function MonthlyGoalsCard({ state, setState }) {
  const goals = state.monthlyGoals || []

  const add = () => setState((s) => ({
    ...s,
    monthlyGoals: [...(s.monthlyGoals || []), { id: uid('g'), text: 'Новая цель', current: 0, target: 10, unit: 'шт.' }],
  }))
  const update = (id, field, val) => setState((s) => ({
    ...s,
    monthlyGoals: s.monthlyGoals.map((g) => g.id === id ? { ...g, [field]: val } : g),
  }))
  const remove = (id) => setState((s) => ({ ...s, monthlyGoals: s.monthlyGoals.filter((g) => g.id !== id) }))
  const step = (id, dir) => setState((s) => ({
    ...s,
    monthlyGoals: s.monthlyGoals.map((g) => g.id === id
      ? { ...g, current: Math.max(0, Math.min(g.target, g.current + dir)) }
      : g),
  }))

  return (
    <div className="card">
      <h2>🎯 Цели месяца</h2>
      {goals.length === 0 && <div className="empty">Добавьте цели на этот месяц — с прогресс-баром.</div>}
      {goals.map((g) => {
        const ratio = g.target > 0 ? Math.min(1, g.current / g.target) : 0
        return (
          <div key={g.id} style={{ marginBottom: 16 }}>
            <div className="row" style={{ marginBottom: 6 }}>
              <input
                className="input"
                style={{ flex: 1, marginRight: 8 }}
                value={g.text}
                onChange={(e) => update(g.id, 'text', e.target.value)}
              />
              <button className="icon-x" onClick={() => remove(g.id)}>✕</button>
            </div>
            <div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>
              <button className="btn sm" onClick={() => step(g.id, -1)}>−</button>
              <div className="progress" style={{ flex: 1 }}>
                <div style={{ width: `${ratio * 100}%` }} />
              </div>
              <button className="btn sm primary" onClick={() => step(g.id, 1)}>+</button>
              <span style={{ minWidth: 60, textAlign: 'right', fontSize: '0.88rem' }}>
                {g.current}/{g.target}
                <input
                  className="cell-input"
                  value={g.unit}
                  onChange={(e) => update(g.id, 'unit', e.target.value)}
                  style={{ width: 36, marginLeft: 4, fontSize: '0.78rem' }}
                />
              </span>
            </div>
          </div>
        )
      })}
      <button className="btn" style={{ marginTop: 4 }} onClick={add}>+ Добавить цель</button>
    </div>
  )
}

export default function StatsTab({ state, setState, weekKey }) {
  const week = getWeek(state, weekKey)
  const days = weekDays(weekKey)

  const tasks = weekTaskStats(week)
  const habits = weekHabitStats(week, state.habits)
  const steps = weekStepsStats(week)
  const score = tasks.ratio * 0.4 + habits.ratio * 0.4 + steps.ratio * 0.2

  const moodData = days.map((d, di) => {
    const k = toKey(d), m = state.moodHistory[k]
    return { day: dayNames[di], mood: m == null ? null : m + 1 }
  })
  const stepData = days.map((d, di) => ({ day: dayNames[di], steps: Number(week.steps[di]) || 0 }))
  const sleepData = days.map((d, di) => ({ day: dayNames[di], sleep: Number(week.sleep[di]) || 0 }))
  const habitProgress = state.habits.map((h, hi) => {
    let done = 0
    for (let di = 0; di < 7; di++) if (week.hchecks[`${hi}_${di}`]) done++
    return { name: h, ratio: done / 7, done }
  })

  return (
    <div className="grid">
      <MonthlyGoalsCard state={state} setState={setState} />

      <div className="card">
        <h2>🏆 Счёт недели</h2>
        <div className="rings">
          <Ring value={score} label="Итог" color="var(--c5)" />
          <Ring value={tasks.ratio} label="Задачи · 40%" color="var(--c4)" />
          <Ring value={habits.ratio} label="Привычки · 40%" color="var(--c4)" />
          <Ring value={steps.ratio} label="Шаги · 20%" color="var(--c4)" />
        </div>
      </div>

      <div className="card">
        <h2>📊 Сводка</h2>
        <div className="stat-cards">
          <div className="stat-card"><div className="big">{tasks.done}/{tasks.total}</div><div className="lbl">задачи выполнены</div></div>
          <div className="stat-card"><div className="big">{habits.done}/{habits.total}</div><div className="lbl">отметки привычек</div></div>
          <div className="stat-card"><div className="big">{Math.round(steps.avg).toLocaleString('ru-RU')}</div><div className="lbl">шагов в среднем</div></div>
          <div className="stat-card"><div className="big">{steps.daysHit}</div><div className="lbl">дней с целью по шагам</div></div>
        </div>
      </div>

      <div className="card">
        <h2>🌈 Настроение за неделю</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={moodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--c2)" />
            <XAxis dataKey="day" stroke="var(--ink)" />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tickFormatter={(v) => MOODS[v - 1]} stroke="var(--ink)" />
            <Tooltip formatter={(v) => MOODS[v - 1]} />
            <Line type="monotone" dataKey="mood" stroke="var(--c5)" strokeWidth={3} dot={{ r: 5, fill: 'var(--c5)' }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>🔁 Прогресс привычек</h2>
        {habitProgress.length === 0 && <div className="empty">Нет привычек</div>}
        {habitProgress.map((h, i) => (
          <div className="prog-row" key={i}>
            <span className="name">{h.name}</span>
            <div className="progress"><div style={{ width: `${h.ratio * 100}%` }} /></div>
            <span style={{ minWidth: 38, textAlign: 'right' }}>{h.done}/7</span>
          </div>
        ))}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2>👟 Шаги</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stepData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--c2)" />
              <XAxis dataKey="day" stroke="var(--ink)" /><YAxis stroke="var(--ink)" /><Tooltip />
              <Bar dataKey="steps" fill="var(--c4)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2>😴 Сон</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sleepData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--c2)" />
              <XAxis dataKey="day" stroke="var(--ink)" /><YAxis domain={[0, 12]} stroke="var(--ink)" /><Tooltip />
              <ReferenceArea y1={7} y2={9} fill="var(--c3)" fillOpacity={0.4} />
              <Bar dataKey="sleep" fill="var(--c5)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
