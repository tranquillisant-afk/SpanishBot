import { useEffect, useState } from 'react'
import { usePlanner } from './hooks/usePlanner'
import { applyTheme } from './lib/themes'
import { weekKeyOf, fromKey, addDays } from './lib/dates'
import { currentWeekKey } from './lib/defaultState'

import Header from './components/Header'
import WishList from './components/WishList'
import Settings from './components/Settings'
import WeekTab from './components/tabs/WeekTab'
import TrackersTab from './components/tabs/TrackersTab'
import FocusTab from './components/tabs/FocusTab'
import DayTab from './components/tabs/DayTab'
import StatsTab from './components/tabs/StatsTab'
import ArchiveTab from './components/tabs/ArchiveTab'

const TABS = [
  { key: 'week', label: 'Неделя', emoji: '🗓️' },
  { key: 'trackers', label: 'Трекеры', emoji: '📈' },
  { key: 'focus', label: 'Фокус', emoji: '🍅' },
  { key: 'day', label: 'День', emoji: '☀️' },
  { key: 'stats', label: 'Статистика', emoji: '📊' },
  { key: 'archive', label: 'Архив', emoji: '📦' },
]

export default function App() {
  const { state, setState, replaceState, status } = usePlanner()
  const [tab, setTab] = useState('week')
  const [weekKey, setWeekKey] = useState(currentWeekKey())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Применяем тему при изменении.
  useEffect(() => {
    if (state?.theme) applyTheme(state.theme)
  }, [state?.theme])

  if (!state) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <div>Загружаем ваш планер…</div>
      </div>
    )
  }

  const shiftWeek = (n) => setWeekKey((wk) => weekKeyOf(addDays(fromKey(wk), n * 7)))
  const goToday = () => {
    setWeekKey(currentWeekKey())
    setSelectedDate(new Date())
  }

  // Выбор дня из мини-календаря → переключаемся на вкладку «День».
  const pickDate = (date) => {
    setSelectedDate(date)
    setWeekKey(weekKeyOf(date))
    setTab('day')
  }

  // Открыть неделю из архива.
  const openWeek = (wk) => {
    setWeekKey(wk)
    setSelectedDate(fromKey(wk))
    setTab('week')
  }

  return (
    <div className="app">
      <Header
        state={state}
        setState={setState}
        weekKey={weekKey}
        onPrevWeek={() => shiftWeek(-1)}
        onNextWeek={() => shiftWeek(1)}
        onToday={goToday}
        status={status}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {tab === 'week' && (
        <WeekTab state={state} setState={setState} weekKey={weekKey} onPickDate={pickDate} />
      )}
      {tab === 'trackers' && <TrackersTab state={state} setState={setState} weekKey={weekKey} />}
      {tab === 'focus' && <FocusTab state={state} setState={setState} />}
      {tab === 'day' && (
        <DayTab
          state={state}
          setState={setState}
          weekKey={weekKey}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      )}
      {tab === 'stats' && <StatsTab state={state} weekKey={weekKey} />}
      {tab === 'archive' && <ArchiveTab state={state} onOpenWeek={openWeek} />}

      <WishList state={state} setState={setState} />

      {settingsOpen && (
        <Settings
          state={state}
          setState={setState}
          replaceState={replaceState}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}
