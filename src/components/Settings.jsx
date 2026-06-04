import { useRef, useState } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'

export default function Settings({ state, setState, replaceState, onClose }) {
  const fileRef = useRef(null)
  const [msg, setMsg] = useState('')

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `planner-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        if (!parsed || typeof parsed !== 'object') throw new Error('bad')
        replaceState(parsed)
        setMsg('✅ Импортировано и сохранено.')
      } catch {
        setMsg('❌ Не удалось прочитать файл. Это точно JSON-бэкап планера?')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>⚙️ Настройки</h2>

        <h3>Имя</h3>
        <input
          className="input"
          value={state.userName}
          onChange={(e) => setState((s) => ({ ...s, userName: e.target.value }))}
        />

        <h3 style={{ marginTop: 18 }}>Резервная копия</h3>
        <p className="muted">
          Экспортируйте всё состояние в JSON-файл или восстановите из бэкапа.
          Импорт полностью заменит текущие данные.
        </p>
        <div className="row">
          <button className="btn primary" onClick={exportJson}>
            ⬇️ Экспорт JSON
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            ⬆️ Импорт JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={importJson}
          />
        </div>
        {msg && (
          <p className="muted" style={{ marginTop: 8 }}>
            {msg}
          </p>
        )}

        <h3 style={{ marginTop: 18 }}>Синхронизация</h3>
        <p className="muted">
          {isSupabaseConfigured
            ? 'Supabase подключён — данные синхронизируются между устройствами в реальном времени.'
            : 'Supabase не настроен. Данные хранятся только в этом браузере. Добавьте переменные окружения VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.'}
        </p>

        <div className="row" style={{ marginTop: 18, justifyContent: 'flex-end' }}>
          <button className="btn primary" onClick={onClose}>
            Готово
          </button>
        </div>
      </div>
    </div>
  )
}
