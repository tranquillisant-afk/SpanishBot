import { useState } from 'react'
import { toKey, fullDateLabel, isToday, addDays } from '../../lib/dates'
import { getDay, getWeek } from '../../lib/defaultState'
import { updateDay, updateWeek, uid } from '../../lib/updaters'

const WATER_GOAL = 8
const MOODS = ['😢', '🙁', '😐', '🙂', '😄']

function WaterCard({ dateKey, day, setState }) {
  const setWater = (n) => setState(updateDay(dateKey, (d) => ({ ...d, water: n })))
  return (
    <div className="card">
      <h2>💧 Вода</h2>
      <p className="muted">
        Выпито: {day.water} из {WATER_GOAL} стаканов
      </p>
      <div className="glasses">
        {Array.from({ length: WATER_GOAL }, (_, i) => (
          <button
            key={i}
            className={`glass${i < day.water ? ' filled' : ''}`}
            onClick={() => setWater(i + 1 === day.water ? i : i + 1)}
            title={`${i + 1} стакан`}
          >
            🥛
          </button>
        ))}
      </div>
    </div>
  )
}

function MoodCard({ dateKey, day, setState }) {
  const setMood = (idx) =>
    setState((s) => {
      const moodHistory = { ...s.moodHistory, [dateKey]: idx }
      const prevDay = { water: 0, mood: null, gratitude: ['', '', ''], ...(s.days[dateKey] || {}) }
      return {
        ...s,
        moodHistory,
        days: { ...s.days, [dateKey]: { ...prevDay, mood: idx } },
      }
    })

  return (
    <div className="card">
      <h2>🌈 Настроение</h2>
      <div className="moods">
        {MOODS.map((emoji, idx) => (
          <button
            key={idx}
            className={`mood-btn${day.mood === idx ? ' active' : ''}`}
            onClick={() => setMood(idx)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}

function GratitudeCard({ dateKey, day, setState }) {
  const setG = (i, val) =>
    setState(updateDay(dateKey, (d) => ({ ...d, gratitude: d.gratitude.map((g, idx) => (idx === i ? val : g)) })))
  return (
    <div className="card">
      <h2>🙏 Благодарность дня</h2>
      {[0, 1, 2].map((i) => (
        <input
          key={i}
          className="input"
          style={{ marginBottom: 8 }}
          placeholder={`Я благодарна за… (${i + 1})`}
          value={day.gratitude[i] || ''}
          onChange={(e) => setG(i, e.target.value)}
        />
      ))}
    </div>
  )
}

function FinanceCard({ weekKey, week, setState }) {
  const [incLabel, setIncLabel] = useState('')
  const [incAmt, setIncAmt] = useState('')
  const [expLabel, setExpLabel] = useState('')
  const [expAmt, setExpAmt] = useState('')

  const fin = week.finance
  const setBudget = (v) =>
    setState(updateWeek(weekKey, (w) => ({ ...w, finance: { ...w.finance, budget: v } })))

  const addItem = (kind, label, amt) => {
    const a = Number(amt)
    if (!label.trim() || !a) return
    setState(
      updateWeek(weekKey, (w) => ({
        ...w,
        finance: {
          ...w.finance,
          [kind]: [...(w.finance[kind] || []), { id: uid('f'), label: label.trim(), amount: a }],
        },
      })),
    )
  }
  const removeItem = (kind, id) =>
    setState(
      updateWeek(weekKey, (w) => ({
        ...w,
        finance: { ...w.finance, [kind]: w.finance[kind].filter((x) => x.id !== id) },
      })),
    )

  const sum = (arr) => (arr || []).reduce((a, b) => a + (Number(b.amount) || 0), 0)
  const income = sum(fin.income)
  const expense = sum(fin.expense)
  const budget = Number(fin.budget) || 0
  const balance = income - expense
  const left = budget - expense

  return (
    <div className="card">
      <h2>💰 Финансы недели</h2>
      <div className="row" style={{ marginBottom: 12 }}>
        <span>Бюджет на неделю:</span>
        <input
          className="input"
          type="number"
          style={{ maxWidth: 140 }}
          placeholder="0"
          value={fin.budget}
          onChange={(e) => setBudget(e.target.value)}
        />
      </div>

      <div className="grid grid-2">
        <div>
          <h3>➕ Доходы</h3>
          {(fin.income || []).map((it) => (
            <div className="fin-line" key={it.id}>
              <span style={{ flex: 1 }}>{it.label}</span>
              <strong>{it.amount}</strong>
              <button className="icon-x" onClick={() => removeItem('income', it.id)}>
                ✕
              </button>
            </div>
          ))}
          <div className="add-row">
            <input className="input" placeholder="статья" value={incLabel} onChange={(e) => setIncLabel(e.target.value)} />
            <input
              className="input"
              type="number"
              style={{ maxWidth: 90 }}
              placeholder="₽"
              value={incAmt}
              onChange={(e) => setIncAmt(e.target.value)}
            />
            <button
              className="btn primary"
              onClick={() => {
                addItem('income', incLabel, incAmt)
                setIncLabel('')
                setIncAmt('')
              }}
            >
              +
            </button>
          </div>
        </div>

        <div>
          <h3>➖ Расходы</h3>
          {(fin.expense || []).map((it) => (
            <div className="fin-line" key={it.id}>
              <span style={{ flex: 1 }}>{it.label}</span>
              <strong>{it.amount}</strong>
              <button className="icon-x" onClick={() => removeItem('expense', it.id)}>
                ✕
              </button>
            </div>
          ))}
          <div className="add-row">
            <input className="input" placeholder="статья" value={expLabel} onChange={(e) => setExpLabel(e.target.value)} />
            <input
              className="input"
              type="number"
              style={{ maxWidth: 90 }}
              placeholder="₽"
              value={expAmt}
              onChange={(e) => setExpAmt(e.target.value)}
            />
            <button
              className="btn primary"
              onClick={() => {
                addItem('expense', expLabel, expAmt)
                setExpLabel('')
                setExpAmt('')
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="fin-totals">
        <div className="stat-card">
          <div className="big">{income}</div>
          <div className="lbl">доходы</div>
        </div>
        <div className="stat-card">
          <div className="big">{expense}</div>
          <div className="lbl">расходы</div>
        </div>
        <div className="stat-card">
          <div className="big" style={{ color: balance >= 0 ? '#3a9d5d' : '#c0584f' }}>
            {balance >= 0 ? '+' : ''}
            {balance}
          </div>
          <div className="lbl">баланс</div>
        </div>
      </div>
      {budget > 0 && (
        <p className="muted" style={{ marginTop: 8 }}>
          {left >= 0 ? `Осталось от бюджета: ${left}` : `Превышение бюджета на ${-left}`}
        </p>
      )}
    </div>
  )
}

export default function DayTab({ state, setState, weekKey, selectedDate, setSelectedDate }) {
  const dateKey = toKey(selectedDate)
  const day = getDay(state, dateKey)
  const week = getWeek(state, weekKey)

  return (
    <div className="grid">
      <div className="card tint">
        <div className="row">
          <button className="btn icon" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
            ←
          </button>
          <strong style={{ flex: 1, textAlign: 'center' }}>
            {fullDateLabel(selectedDate)} {isToday(selectedDate) ? '· сегодня' : ''}
          </strong>
          <button className="btn icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
            →
          </button>
          <button className="btn sm ghost" onClick={() => setSelectedDate(new Date())}>
            сегодня
          </button>
        </div>
      </div>

      <div className="grid grid-2">
        <WaterCard dateKey={dateKey} day={day} setState={setState} />
        <MoodCard dateKey={dateKey} day={day} setState={setState} />
      </div>
      <GratitudeCard dateKey={dateKey} day={day} setState={setState} />
      <FinanceCard weekKey={weekKey} week={week} setState={setState} />
    </div>
  )
}
