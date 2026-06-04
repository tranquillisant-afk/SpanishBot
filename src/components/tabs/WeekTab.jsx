import { useState } from 'react'
import { weekDays, dayNames, monthGrid, fromKey, toKey, isToday } from '../../lib/dates'
import { getWeek } from '../../lib/defaultState'
import { updateWeek, uid } from '../../lib/updaters'

function MiniCalendar({ weekKey, onPickDate, events }) {
  const monday = fromKey(weekKey)
  const [view, setView] = useState({ y: monday.getFullYear(), m: monday.getMonth() })
  const weeks = monthGrid(view.y, view.m)
  const weekSet = new Set(weekDays(weekKey).map(toKey))
  const eventDates = new Set((events || []).map((e) => e.date))
  const monthName = new Date(view.y, view.m, 1).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })

  const shift = (n) => {
    const d = new Date(view.y, view.m + n, 1)
    setView({ y: d.getFullYear(), m: d.getMonth() })
  }

  return (
    <div className="mini-cal">
      <div className="mini-cal-head">
        <button className="btn icon sm" onClick={() => shift(-1)}>
          ←
        </button>
        <span style={{ textTransform: 'capitalize' }}>{monthName}</span>
        <button className="btn icon sm" onClick={() => shift(1)}>
          →
        </button>
      </div>
      <div className="mini-cal-grid">
        {dayNames.map((d) => (
          <div key={d} className="dow">
            {d}
          </div>
        ))}
        {weeks.flat().map((cell, i) => {
          if (!cell) return <div key={i} />
          const key = toKey(cell)
          const cls = [
            'mini-cal-cell',
            weekSet.has(key) ? 'in-week' : '',
            isToday(cell) ? 'today' : '',
            eventDates.has(key) ? 'has-event' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <button key={i} className={cls} onClick={() => onPickDate(cell)}>
              {cell.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function WeekTab({ state, setState, weekKey, onPickDate }) {
  const week = getWeek(state, weekKey)
  const days = weekDays(weekKey)

  const setPriority = (i, val) =>
    setState(updateWeek(weekKey, (w) => ({ ...w, priorities: w.priorities.map((p, idx) => (idx === i ? val : p)) })))

  const setNote = (val) => setState(updateWeek(weekKey, (w) => ({ ...w, note: val })))

  return (
    <div className="grid">
      <div className="grid grid-2">
        <div className="card">
          <h2>🎯 Приоритеты недели</h2>
          {[0, 1, 2].map((i) => (
            <input
              key={i}
              className="input"
              style={{ marginBottom: 8 }}
              placeholder={`Приоритет ${i + 1}`}
              value={week.priorities[i] || ''}
              onChange={(e) => setPriority(i, e.target.value)}
            />
          ))}
        </div>

        <div className="card">
          <h2>📅 Календарь</h2>
          <MiniCalendar weekKey={weekKey} onPickDate={onPickDate} events={state.events} />
        </div>
      </div>

      <div className="card">
        <h2>✅ Задачи недели</h2>
        <div className="week-grid-wrap"><div className="week-grid">
          {days.map((date, di) => (
            <DayTaskColumn
              key={di}
              date={date}
              dayIndex={di}
              week={week}
              weekKey={weekKey}
              setState={setState}
            />
          ))}
        </div></div>
      </div>

      <div className="card">
        <h2>📝 Заметки недели</h2>
        <textarea
          className="textarea"
          placeholder="Мысли, планы, напоминания…"
          value={week.note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
    </div>
  )
}

function DayTaskColumn({ date, dayIndex, week, weekKey, setState }) {
  const [text, setText] = useState('')
  const tasks = week.tasks[dayIndex] || []
  const wkUpdate = (mut) => setState(updateWeek(weekKey, mut))

  const add = () => {
    const t = text.trim()
    if (!t) return
    wkUpdate((w) => ({
      ...w,
      tasks: {
        ...w.tasks,
        [dayIndex]: [...(w.tasks[dayIndex] || []), { id: uid('t'), text: t, done: false }],
      },
    }))
    setText('')
  }
  const toggle = (id) =>
    wkUpdate((w) => ({
      ...w,
      tasks: {
        ...w.tasks,
        [dayIndex]: w.tasks[dayIndex].map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      },
    }))
  const remove = (id) =>
    wkUpdate((w) => ({
      ...w,
      tasks: { ...w.tasks, [dayIndex]: w.tasks[dayIndex].filter((t) => t.id !== id) },
    }))

  return (
    <div className={`day-col${isToday(date) ? ' today' : ''}`}>
      <h4>
        <span>{dayNames[dayIndex]}</span>
        <span className="muted">{date.getDate()}</span>
      </h4>
      {tasks.map((t) => (
        <div key={t.id} className={`task${t.done ? ' done' : ''}`}>
          <input type="checkbox" className="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
          <span>{t.text}</span>
          <button className="icon-x" onClick={() => remove(t.id)}>
            ✕
          </button>
        </div>
      ))}
      <input
        className="input"
        style={{ marginTop: 6, fontSize: '0.8rem', padding: '6px 8px' }}
        placeholder="+ задача"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && add()}
      />
    </div>
  )
}
