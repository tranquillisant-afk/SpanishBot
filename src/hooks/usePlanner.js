import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase, isSupabaseConfigured, ROW_ID, TABLE } from '../lib/supabase'
import { defaultState, normalizeState } from '../lib/defaultState'

const LS_KEY = 'weekly-planner-state-v1'
const LS_TS_KEY = 'weekly-planner-updated-at-v1'
const SAVE_DEBOUNCE_MS = 600

function readLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return { data: normalizeState(JSON.parse(raw)), updatedAt: localStorage.getItem(LS_TS_KEY) || null }
  } catch {
    return null
  }
}

function writeLocal(data, updatedAt) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data))
    if (updatedAt) localStorage.setItem(LS_TS_KEY, updatedAt)
  } catch {
    /* квота переполнена — игнорируем */
  }
}

/**
 * Главный хук планера.
 * Возвращает: { state, setState, status, lastSaved, replaceState }
 * - state         — нормализованное состояние приложения
 * - setState(fn)  — обновление (как у useState, принимает функцию-updater)
 * - status        — 'loading' | 'online' | 'offline' | 'saving' | 'error'
 * - replaceState  — полная замена состояния (для импорта JSON)
 */
export function usePlanner() {
  const [state, setStateInternal] = useState(null)
  const [status, setStatus] = useState('loading')
  const [lastSaved, setLastSaved] = useState(null)

  // updated_at последней известной версии (для сравнения с realtime).
  const updatedAtRef = useRef(null)
  // Флаг: следующее realtime-событие вызвано нашим же сохранением — пропустить.
  const ignoreNextRef = useRef(false)
  const saveTimer = useRef(null)
  const mounted = useRef(true)

  // ---- Загрузка при старте -------------------------------------------------
  useEffect(() => {
    mounted.current = true
    let cancelled = false

    async function load() {
      const local = readLocal()

      if (!isSupabaseConfigured) {
        const initial = local?.data || defaultState()
        if (!cancelled) {
          updatedAtRef.current = local?.updatedAt || new Date().toISOString()
          setStateInternal(initial)
          setStatus('offline')
        }
        return
      }

      try {
        const { data, error } = await supabase
          .from(TABLE)
          .select('data, updated_at')
          .eq('id', ROW_ID)
          .maybeSingle()

        if (error) throw error

        if (!data) {
          // Строки нет — создаём с дефолтным состоянием.
          const fresh = defaultState()
          const nowTs = new Date().toISOString()
          const { error: upErr } = await supabase
            .from(TABLE)
            .upsert({ id: ROW_ID, data: fresh, updated_at: nowTs })
          if (upErr) throw upErr
          if (!cancelled) {
            updatedAtRef.current = nowTs
            writeLocal(fresh, nowTs)
            setStateInternal(fresh)
            setStatus('online')
          }
          return
        }

        // Есть строка в БД. Берём более свежую из (БД, локальной).
        const remote = { data: normalizeState(data.data), updatedAt: data.updated_at }
        let chosen = remote
        if (local && local.updatedAt && (!remote.updatedAt || local.updatedAt > remote.updatedAt)) {
          chosen = local
        }
        if (!cancelled) {
          updatedAtRef.current = chosen.updatedAt
          writeLocal(chosen.data, chosen.updatedAt)
          setStateInternal(chosen.data)
          setStatus('online')
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[planner] ошибка загрузки из Supabase:', e)
        if (!cancelled) {
          setStateInternal(local?.data || defaultState())
          updatedAtRef.current = local?.updatedAt || new Date().toISOString()
          setStatus('offline')
        }
      }
    }

    load()
    return () => {
      cancelled = true
      mounted.current = false
    }
  }, [])

  // ---- Сохранение (debounced upsert) --------------------------------------
  const persist = useCallback(async (nextState) => {
    const nowTs = new Date().toISOString()
    updatedAtRef.current = nowTs
    writeLocal(nextState, nowTs)

    if (!isSupabaseConfigured || !supabase) {
      setLastSaved(nowTs)
      return
    }

    setStatus('saving')
    ignoreNextRef.current = true
    try {
      const { error } = await supabase
        .from(TABLE)
        .upsert({ id: ROW_ID, data: nextState, updated_at: nowTs })
      if (error) throw error
      if (mounted.current) {
        setStatus('online')
        setLastSaved(nowTs)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[planner] ошибка сохранения:', e)
      if (mounted.current) setStatus('error')
    }
  }, [])

  const scheduleSave = useCallback(
    (nextState) => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => persist(nextState), SAVE_DEBOUNCE_MS)
    },
    [persist],
  )

  // Публичный setState: принимает updater-функцию или объект.
  const setState = useCallback(
    (updater) => {
      setStateInternal((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        scheduleSave(next)
        return next
      })
    },
    [scheduleSave],
  )

  // Полная замена (импорт). Сохраняем немедленно, без debounce.
  const replaceState = useCallback(
    (raw) => {
      const next = normalizeState(raw)
      setStateInternal(next)
      if (saveTimer.current) clearTimeout(saveTimer.current)
      persist(next)
    },
    [persist],
  )

  // ---- Realtime-подписка ---------------------------------------------------
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return

    const channel = supabase
      .channel('planner_state_row')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE, filter: `id=eq.${ROW_ID}` },
        (payload) => {
          const row = payload.new
          if (!row || !row.updated_at) return

          // Пропускаем эхо собственного сохранения.
          if (ignoreNextRef.current && row.updated_at === updatedAtRef.current) {
            ignoreNextRef.current = false
            return
          }

          // Применяем только если входящее изменение новее локального.
          if (updatedAtRef.current && row.updated_at <= updatedAtRef.current) return

          const incoming = normalizeState(row.data)
          updatedAtRef.current = row.updated_at
          writeLocal(incoming, row.updated_at)
          setStateInternal(incoming)
          setLastSaved(row.updated_at)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Сброс таймера при размонтировании (финальное сохранение через localStorage уже есть).
  useEffect(() => () => saveTimer.current && clearTimeout(saveTimer.current), [])

  return { state, setState, replaceState, status, lastSaved }
}
