import { THEMES, THEME_KEYS } from '../lib/themes'
import { weekRangeLabel } from '../lib/dates'
import { quoteOfDay } from '../lib/quotes'

const STATUS_LABEL = {
  loading: 'загрузка…',
  online: 'синхронизировано',
  saving: 'сохранение…',
  offline: 'оффлайн',
  error: 'ошибка сети',
}

export default function Header({
  state,
  setState,
  weekKey,
  onPrevWeek,
  onNextWeek,
  onToday,
  status,
  onOpenSettings,
}) {
  const quote = quoteOfDay(new Date())

  return (
    <header className="header">
      <div className="header-top">
        <div className="greeting">
          <span>Привет,</span>
          <input
            className="name-input"
            value={state.userName}
            onChange={(e) => setState((s) => ({ ...s, userName: e.target.value }))}
            aria-label="Ваше имя"
          />
          <span>{THEMES[state.theme]?.emoji || '🌸'}</span>
        </div>

        <div className="spacer" />

        <div className="themes" role="group" aria-label="Темы">
          {THEME_KEYS.map((key) => (
            <button
              key={key}
              className={`theme-dot${state.theme === key ? ' active' : ''}`}
              style={{ background: THEMES[key].shades[2] }}
              title={THEMES[key].label}
              onClick={() => setState((s) => ({ ...s, theme: key }))}
            >
              {THEMES[key].emoji}
            </button>
          ))}
        </div>

        <button className="btn icon" onClick={onOpenSettings} title="Настройки">
          ⚙️
        </button>
      </div>

      <div className="header-top" style={{ marginTop: 12 }}>
        <div className="week-switch">
          <button className="btn icon" onClick={onPrevWeek} aria-label="Предыдущая неделя">
            ←
          </button>
          <span className="week-label">{weekRangeLabel(weekKey)}</span>
          <button className="btn icon" onClick={onNextWeek} aria-label="Следующая неделя">
            →
          </button>
          <button className="btn sm ghost" onClick={onToday}>
            сегодня
          </button>
        </div>

        <div className="spacer" />

        <span className="status-pill">
          <span className={`status-dot ${status}`} />
          {STATUS_LABEL[status] || status}
        </span>
      </div>

      <div className="quote">«{quote}»</div>
    </header>
  )
}
