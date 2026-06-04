import { useState } from 'react'

let idc = 0
const newId = () => `w_${Date.now()}_${idc++}`

export default function WishList({ state, setState }) {
  const [text, setText] = useState('')
  const wishes = state.wishes

  const add = () => {
    const t = text.trim()
    if (!t) return
    setState((s) => ({ ...s, wishes: [...s.wishes, { id: newId(), text: t, done: false }] }))
    setText('')
  }

  const toggle = (id) =>
    setState((s) => ({
      ...s,
      wishes: s.wishes.map((w) => (w.id === id ? { ...w, done: !w.done } : w)),
    }))

  const remove = (id) =>
    setState((s) => ({ ...s, wishes: s.wishes.filter((w) => w.id !== id) }))

  return (
    <div className="card soft">
      <h2>✨ Список желаний</h2>
      {wishes.length === 0 && <div className="empty">Пока пусто. Чего хочется?</div>}
      {wishes.map((w) => (
        <div key={w.id} className={`wish${w.done ? ' done' : ''}`}>
          <input
            type="checkbox"
            className="checkbox"
            checked={w.done}
            onChange={() => toggle(w.id)}
          />
          <span>{w.text}</span>
          <button className="icon-x" onClick={() => remove(w.id)} title="Удалить">
            ✕
          </button>
        </div>
      ))}
      <div className="add-row">
        <input
          className="input"
          placeholder="Новое желание…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="btn primary" onClick={add}>
          +
        </button>
      </div>
    </div>
  )
}
