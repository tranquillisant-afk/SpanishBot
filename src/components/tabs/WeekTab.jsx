import { useState } from 'react'
import { weekDays, dayNames, monthGrid, fromKey, toKey, isToday, fullDateLabel } from '../../lib/dates'
import { getWeek } from '../../lib/defaultState'
import { updateWeek, uid, nextTag, TAG_INFO } from '../../lib/updaters'

function MiniCalendar({ weekKey, onSelectDay, selectedDay, events }) {
  const monday = fromKey(weekKey)
  const [view, setView] = useState({ y: monday.getFullYear(), m: monday.getMonth() })
  const weeks = monthGrid(view.y, view.m)
  const weekSet = new Set(weekDays(weekKey).map(toKey))
  const eventDates = new Set((events || []).map((e) => e.date))
  const monthName = new Date(view.y, view.m, 1).toLocaleDateString('ru-RU', {
    month: 'long', year: 'numeric',
  })
  const shift = (n) => {
    const d = new Date(view.y, view.m + n, 1)
    setView({ y: d.getFullYear(), m: d.getMonth() })
  }

  return (
    <div className="mini-cal">
      <div className="mini-cal-head">
        <button className="btn icon sm" onClick={() => shift(-1)}>←</button>
        <span style={{ textTransform: 'capitalize' }}>{monthName}</span>
        <button className="btn icon sm" onClick={() => shift(1)}>→</button>
      </div>
      <div className="mini-cal-grid">
        {dayNames.map((d) => <div key={d} className="dow">{d}</div>)}
        {weeks.flat().map((cell, i) => {
          if (!cell) return <div key={i} />
          const key = toKey(cell)
          const cls = [
            'mini-cal-cell',
            weekSet.has(key) ? 'in-week' : '',
            isToday(cell) ? 'today' : '',
            eventDates.has(key) ? 'has-event' : '',
            selectedDay === key ? 'selected' : '',
          ].filter(Boolean).join(' ')
          return (
            <button key={i} className={cls} onClick={() => onSelectDay(key === selectedDay ? null : key)}>
              {cell.getDate()}
            </button>
          )
        })}
      </div>
      <p className="muted" style={{ marginTop: 8 }}>
        Нажмите на день, чтобы добавить событие.
      </p>
    </div>
  )
}

function EventsPanel({ dateKey, state, setState, onOpenDay }) {
  const [name, setName] = useState('')
  const dayEvents = state.events.filter((e) => e.date === dateKey)

  const add = () => {
    const t = name.trim()
    if (!t) return
    setState((s) => ({ ...s, events: [...s.events, { id: uid('e'), name: t, date: dateKey }] }))
    setName('')
  }
  const remove = (id) => setState((s) => ({ ...s, events: s.events.filter((e) => e.id !== id) }))

  return (
    <div className="events-panel">
      <div className="row" style={{ marginBottom: 8 }}>
        <strong style={{ flex: 1 }}>📌 {fullDateLabel(fromKey(dateKey))}</strong>
        <button className="btn sm ghost" onClick={() => onOpenDay(fromKey(dateKey))}>
          открыть день →
        </button>
      </div>
      {dayEvents.length === 0 && <div className="muted" style={{ marginBottom: 6 }}>Событий пока нет.</div>}
      {dayEvents.map((e) => (
        <div className="event-row" key={e.id}>
          <span>🔖 {e.name}</span>
          <button className="icon-x" onClick={() => remove(e.id)}>✕</button>
        </div>
      ))}
      <div className="add-row">
        <input
          className="input"
          placeholder="Название события…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="btn primary" onClick={add}>+</button>
      </div>
    </div>
  )
}

function DayTaskColumn({ date, dayIndex, week, weekKey, setState, events }) {
  const [text, setText] = useState('')
  const [addingSubtask, setAddingSubtask] = useState(null)
  const [stText, setStText] = useState('')
  const tasks = week.tasks[dayIndex] || []
  const wkUpdate = (mut) => setState(updateWeek(weekKey, mut))

  const mapTasks = (dayIndex, fn) => (w) => ({
    ...w,
    tasks: { ...w.tasks, [dayIndex]: w.tasks[dayIndex].map(fn) },
  })

  const add = () => {
    const t = text.trim()
    if (!t) return
    wkUpdate((w) => ({
      ...w,
      tasks: {
        ...w.tasks,
        [dayIndex]: [...(w.tasks[dayIndex] || []), { id: uid('t'), text: t, done: false, tag: null, subtasks: [] }],
      },
    }))
    setText('')
  }
  const toggle = (id) => wkUpdate(mapTasks(dayIndex, (t) => t.id === id ? { ...t, done: !t.done } : t))
  const remove = (id) => wkUpdate((w) => ({
    ...w,
    tasks: { ...w.tasks, [dayIndex]: w.tasks[dayIndex].filter((t) => t.id !== id) },
  }))
  const cycleTag = (id) => wkUpdate(mapTasks(dayIndex, (t) => t.id === id ? { ...t, tag: nextTag(t.tag) } : t))

  const addSubtask = (taskId) => {
    const t = stText.trim()
    if (!t) return
    wkUpdate(mapTasks(dayIndex, (tk) =>
      tk.id === taskId
        ? { ...tk, subtasks: [...(tk.subtasks || []), { id: uid('st'), text: t, done: false }] }
        : tk
    ))
    setStText('')
    setAddingSubtask(null)
  }
  const toggleSubtask = (taskId, stId) => wkUpdate(mapTasks(dayIndex, (tk) =>
    tk.id === taskId
      ? { ...tk, subtasks: (tk.subtasks || []).map((st) => st.id === stId ? { ...st, done: !st.done } : st) }
      : tk
  ))
  const removeSubtask = (taskId, stId) => wkUpdate(mapTasks(dayIndex, (tk) =>
    tk.id === taskId
      ? { ...tk, subtasks: (tk.subtasks || []).filter((st) => st.id !== stId) }
      : tk
  ))

  return (
    <div className={`day-col${isToday(date) ? ' today' : ''}`}>
      <h4>
        <span>{dayNames[dayIndex]}</span>
        <span className="muted">{date.getDate()}</span>
      </h4>
      {events.map((e) => (
        <div className="day-event" key={e.id} title={e.name}>🔖 {e.name}</div>
      ))}
      {tasks.map((t) => {
        const tagInfo = t.tag ? TAG_INFO[t.tag] : null
        return (
          <div key={t.id}>
            <div
              className={`task${t.done ? ' done' : ''}`}
              style={{ borderLeft: tagInfo ? `3px solid ${tagInfo.color}` : '3px solid transparent' }}
            >
              <input type="checkbox" className="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
              <span>{t.text}</span>
              <button
                className="tag-btn"
                style={{ color: tagInfo?.color || 'var(--c3)' }}
                onClick={() => cycleTag(t.id)}
                title={tagInfo?.label || 'Без тега'}
              >
                {tagInfo ? '⬤' : '○'}
              </button>
              <button
                className="icon-x"
                style={{ opacity: 0.55, fontSize: '0.75rem' }}
                onClick={() => { setAddingSubtask(addingSubtask === t.id ? null : t.id); setStText('') }}
                title="Добавить подзадачу"
              >
                ⊕
              </button>
              <button className="icon-x" onClick={() => remove(t.id)}>✕</button>
            </div>
            {(t.subtasks || []).map((st) => (
              <div key={st.id} className={`subtask${st.done ? ' done' : ''}`}>
                <input type="checkbox" className="checkbox" checked={st.done} onChange={() => toggleSubtask(t.id, st.id)} />
                <span>{st.text}</span>
                <button className="icon-x" onClick={() => removeSubtask(t.id, st.id)}>✕</button>
              </div>
            ))}
            {addingSubtask === t.id && (
              <input
                className="input subtask-add"
                placeholder="+ подзадача"
                autoFocus
                value={stText}
                onChange={(e) => setStText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addSubtask(t.id)
                  if (e.key === 'Escape') { setAddingSubtask(null); setStText('') }
                }}
                onBlur={() => { addSubtask(t.id); }}
              />
            )}
          </div>
        )
      })}
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

export default function WeekTab({ state, setState, weekKey, onPickDate }) {
  const week = getWeek(state, weekKey)
  const days = weekDays(weekKey)
  const [eventDay, setEventDay] = useState(null)

  const setPriority = (i, val) =>
    setState(updateWeek(weekKey, (w) => ({ ...w, priorities: w.priorities.map((p, idx) => (idx === i ? val : p)) })))

  const setNote = (val) => setState(updateWeek(weekKey, (w) => ({ ...w, note: val })))

  const eventsByDate = {}
  for (const e of state.events) {
    ;(eventsByDate[e.date] ||= []).push(e)
  }

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
          <MiniCalendar
            weekKey={weekKey}
            onSelectDay={setEventDay}
            selectedDay={eventDay}
            events={state.events}
          />
          {eventDay && (
            <EventsPanel
              dateKey={eventDay}
              state={state}
              setState={setState}
              onOpenDay={onPickDate}
            />
          )}
        </div>
      </div>

      <div className="card">
        <h2>✅ Задачи недели</h2>
        <div className="week-grid-wrap">
          <div className="week-grid">
            {days.map((date, di) => (
              <DayTaskColumn
                key={di}
                date={date}
                dayIndex={di}
                week={week}
                weekKey={weekKey}
                setState={setState}
                events={eventsByDate[toKey(date)] || []}
              />
            ))}
          </div>
        </div>
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
