import { useState } from 'react'
import { weekDays, dayNames, isToday } from '../../lib/dates'
import { getWeek } from '../../lib/defaultState'
import { updateWeek } from '../../lib/updaters'

const STEP_GOAL = 8000
const SLEEP_MIN = 7
const SLEEP_MAX = 9

/* ---------- Привычки ---------- */
function HabitsCard({ state, setState, weekKey }) {
  const [newHabit, setNewHabit] = useState('')
  const week = getWeek(state, weekKey)
  const days = weekDays(weekKey)

  const addHabit = () => {
    const t = newHabit.trim()
    if (!t) return
    setState((s) => ({ ...s, habits: [...s.habits, t] }))
    setNewHabit('')
  }
  const renameHabit = (i, val) =>
    setState((s) => ({ ...s, habits: s.habits.map((h, idx) => (idx === i ? val : h)) }))

  const removeHabit = (i) =>
    setState((s) => {
      // переиндексируем галочки, удаляя строку i
      const habits = s.habits.filter((_, idx) => idx !== i)
      const weeks = { ...s.weeks }
      for (const wk of Object.keys(weeks)) {
        const hchecks = {}
        for (const [key, val] of Object.entries(weeks[wk].hchecks || {})) {
          const [hi, di] = key.split('_').map(Number)
          if (hi === i) continue
          const nhi = hi > i ? hi - 1 : hi
          hchecks[`${nhi}_${di}`] = val
        }
        weeks[wk] = { ...weeks[wk], hchecks }
      }
      return { ...s, habits, weeks }
    })

  const toggle = (hi, di) =>
    setState(
      updateWeek(weekKey, (w) => {
        const key = `${hi}_${di}`
        const hchecks = { ...w.hchecks }
        if (hchecks[key]) delete hchecks[key]
        else hchecks[key] = true
        return { ...w, hchecks }
      }),
    )

  return (
    <div className="card">
      <h2>🔁 Привычки</h2>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th className="label">Привычка</th>
              {days.map((d, di) => (
                <th key={di} className={isToday(d) ? 'today' : ''}>
                  {dayNames[di]}
                </th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {state.habits.map((h, hi) => (
              <tr key={hi}>
                <td className="label">
                  <input
                    className="cell-input"
                    style={{ textAlign: 'left' }}
                    value={h}
                    onChange={(e) => renameHabit(hi, e.target.value)}
                  />
                </td>
                {days.map((d, di) => (
                  <td key={di} className={isToday(d) ? 'today' : ''}>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={!!week.hchecks[`${hi}_${di}`]}
                      onChange={() => toggle(hi, di)}
                    />
                  </td>
                ))}
                <td>
                  <button className="icon-x" onClick={() => removeHabit(hi)}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
            {state.habits.length === 0 && (
              <tr>
                <td className="empty" colSpan={9}>
                  Добавьте первую привычку
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="add-row">
        <input
          className="input"
          placeholder="Новая привычка…"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addHabit()}
        />
        <button className="btn primary" onClick={addHabit}>
          +
        </button>
      </div>
    </div>
  )
}

/* ---------- Универсальные столбики с вводом ---------- */
function BarInputCard({ title, emoji, weekKey, week, setState, field, goal, unit, hint, goalLabel }) {
  const days = weekDays(weekKey)
  const values = days.map((_, di) => week[field][di] ?? '')
  const goalNum = Array.isArray(goal) ? goal[1] : goal
  const max = Math.max(goalNum, ...values.map((v) => Number(v) || 0)) || goalNum

  const setVal = (di, val) =>
    setState(updateWeek(weekKey, (w) => ({ ...w, [field]: { ...w[field], [di]: val } })))

  const hits = (v) => {
    const n = Number(v) || 0
    if (Array.isArray(goal)) return n >= goal[0] && n <= goal[1]
    return n >= goal
  }

  return (
    <div className="card">
      <h2>
        {emoji} {title}
      </h2>
      <p className="muted">{hint}</p>
      <div className="bars">
        {days.map((d, di) => {
          const v = Number(values[di]) || 0
          const h = Math.min(100, (v / max) * 100)
          return (
            <div className="bar-col" key={di}>
              <div
                className={`bar${hits(values[di]) ? ' goal' : ''}`}
                style={{ height: `${h}%` }}
                title={`${v} ${unit}`}
              />
              <span className="bar-label">{dayNames[di]}</span>
            </div>
          )
        })}
      </div>
      <div className="tbl-wrap" style={{ marginTop: 10 }}>
        <table className="tbl">
          <tbody>
            <tr>
              {days.map((d, di) => (
                <td key={di} className={isToday(d) ? 'today' : ''}>
                  <input
                    className="cell-input"
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={values[di]}
                    onChange={(e) => setVal(di, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ marginTop: 6 }}>
        {goalLabel} ({Array.isArray(goal) ? `${goal[0]}–${goal[1]}` : goalNum} {unit})
      </p>
    </div>
  )
}

/* ---------- Учёба ---------- */
function StudyCard({ state, setState, weekKey }) {
  const [newSubject, setNewSubject] = useState('')
  const week = getWeek(state, weekKey)
  const days = weekDays(weekKey)

  const addSubject = () => {
    const t = newSubject.trim()
    if (!t) return
    setState((s) => ({ ...s, subjects: [...s.subjects, t] }))
    setNewSubject('')
  }
  const renameSubject = (i, val) =>
    setState((s) => ({ ...s, subjects: s.subjects.map((x, idx) => (idx === i ? val : x)) }))
  const removeSubject = (i) =>
    setState((s) => ({ ...s, subjects: s.subjects.filter((_, idx) => idx !== i) }))

  const setHours = (si, di, val) =>
    setState(updateWeek(weekKey, (w) => ({ ...w, study: { ...w.study, [`${si}_${di}`]: val } })))

  const totalFor = (si) =>
    days.reduce((sum, _, di) => sum + (Number(week.study[`${si}_${di}`]) || 0), 0)

  return (
    <div className="card">
      <h2>📚 Учёба (часы)</h2>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th className="label">Предмет</th>
              {days.map((d, di) => (
                <th key={di} className={isToday(d) ? 'today' : ''}>
                  {dayNames[di]}
                </th>
              ))}
              <th>Σ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {state.subjects.map((subj, si) => (
              <tr key={si}>
                <td className="label">
                  <input
                    className="cell-input"
                    style={{ textAlign: 'left' }}
                    value={subj}
                    onChange={(e) => renameSubject(si, e.target.value)}
                  />
                </td>
                {days.map((d, di) => (
                  <td key={di} className={isToday(d) ? 'today' : ''}>
                    <input
                      className="cell-input"
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      value={week.study[`${si}_${di}`] ?? ''}
                      onChange={(e) => setHours(si, di, e.target.value)}
                    />
                  </td>
                ))}
                <td>
                  <strong>{totalFor(si)}</strong>
                </td>
                <td>
                  <button className="icon-x" onClick={() => removeSubject(si)}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
            {state.subjects.length === 0 && (
              <tr>
                <td className="empty" colSpan={10}>
                  Добавьте предмет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="add-row">
        <input
          className="input"
          placeholder="Новый предмет…"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSubject()}
        />
        <button className="btn primary" onClick={addSubject}>
          +
        </button>
      </div>
    </div>
  )
}

export default function TrackersTab({ state, setState, weekKey }) {
  const week = getWeek(state, weekKey)
  return (
    <div className="grid">
      <HabitsCard state={state} setState={setState} weekKey={weekKey} />
      <div className="grid grid-2">
        <BarInputCard
          title="Шаги"
          emoji="👟"
          weekKey={weekKey}
          week={week}
          setState={setState}
          field="steps"
          goal={STEP_GOAL}
          unit="шаг."
          hint="Введите количество шагов за день."
          goalLabel="Цель"
        />
        <BarInputCard
          title="Сон"
          emoji="😴"
          weekKey={weekKey}
          week={week}
          setState={setState}
          field="sleep"
          goal={[SLEEP_MIN, SLEEP_MAX]}
          unit="ч"
          hint="Сколько часов вы спали."
          goalLabel="Норма"
        />
      </div>
      <StudyCard state={state} setState={setState} weekKey={weekKey} />
    </div>
  )
}
