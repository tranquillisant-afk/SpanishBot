import { useState } from 'react'
import { weekRangeLabel, weekDays, dayNames, fromKey } from '../../lib/dates'
import { getWeek } from '../../lib/defaultState'
import { weekTaskStats, weekHabitStats, weekStepsStats } from '../../lib/updaters'

// Есть ли в неделе хоть какие-то данные?
function weekHasData(week, habits) {
  if (week.priorities?.some((p) => p.trim())) return true
  if (week.note?.trim()) return true
  for (let d = 0; d < 7; d++) if ((week.tasks?.[d] || []).length) return true
  if (Object.keys(week.hchecks || {}).length) return true
  if (Object.values(week.steps || {}).some((v) => v)) return true
  if (Object.values(week.sleep || {}).some((v) => v)) return true
  if (Object.keys(week.study || {}).length) return true
  if ((week.finance?.income || []).length || (week.finance?.expense || []).length) return true
  return false
}

function WeekDetails({ state, weekKey, onClose }) {
  const week = getWeek(state, weekKey)
  const days = weekDays(weekKey)
  const tasks = weekTaskStats(week)
  const habits = weekHabitStats(week, state.habits)
  const steps = weekStepsStats(week)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>📦 {weekRangeLabel(weekKey)}</h2>

        <div className="stat-cards" style={{ marginBottom: 14 }}>
          <div className="stat-card">
            <div className="big">
              {tasks.done}/{tasks.total}
            </div>
            <div className="lbl">задачи</div>
          </div>
          <div className="stat-card">
            <div className="big">{Math.round(habits.ratio * 100)}%</div>
            <div className="lbl">привычки</div>
          </div>
          <div className="stat-card">
            <div className="big">{Math.round(steps.avg).toLocaleString('ru-RU')}</div>
            <div className="lbl">шагов/день</div>
          </div>
        </div>

        {week.priorities.some((p) => p.trim()) && (
          <>
            <h3>🎯 Приоритеты</h3>
            <ul>
              {week.priorities.filter((p) => p.trim()).map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </>
        )}

        <h3>✅ Задачи по дням</h3>
        {days.map((d, di) => {
          const list = week.tasks[di] || []
          if (!list.length) return null
          return (
            <div key={di} style={{ marginBottom: 8 }}>
              <strong>{dayNames[di]}</strong>
              <ul style={{ margin: '4px 0' }}>
                {list.map((t) => (
                  <li key={t.id} style={{ textDecoration: t.done ? 'line-through' : 'none', opacity: t.done ? 0.6 : 1 }}>
                    {t.text}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}

        {week.note?.trim() && (
          <>
            <h3>📝 Заметки</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}>{week.note}</p>
          </>
        )}

        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}>
          <button className="btn primary" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ArchiveTab({ state, onOpenWeek }) {
  const [detailKey, setDetailKey] = useState(null)

  const keys = Object.keys(state.weeks)
    .filter((wk) => weekHasData(getWeek(state, wk), state.habits))
    .sort((a, b) => b.localeCompare(a))

  return (
    <div className="card">
      <h2>📦 Архив недель</h2>
      {keys.length === 0 && <div className="empty">Здесь появятся недели с заполненными данными.</div>}
      {keys.map((wk) => {
        const week = getWeek(state, wk)
        const tasks = weekTaskStats(week)
        return (
          <div className="archive-item" key={wk} onClick={() => setDetailKey(wk)}>
            <div style={{ flex: 1 }}>
              <strong>{weekRangeLabel(wk)}</strong>
              <div className="muted">{fromKey(wk).getFullYear()}</div>
            </div>
            <span className="badge">
              ✅ {tasks.done}/{tasks.total}
            </span>
            <button
              className="btn sm ghost"
              onClick={(e) => {
                e.stopPropagation()
                onOpenWeek(wk)
              }}
            >
              открыть
            </button>
          </div>
        )
      })}

      {detailKey && <WeekDetails state={state} weekKey={detailKey} onClose={() => setDetailKey(null)} />}
    </div>
  )
}
