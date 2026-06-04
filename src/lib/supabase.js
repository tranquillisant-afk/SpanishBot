import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Если ключи не заданы — приложение работает в оффлайн-режиме
// (только localStorage), а в консоль пишется предупреждение.
export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[planner] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY не заданы. ' +
      'Данные сохраняются только локально (localStorage). ' +
      'Создайте .env по образцу .env.example для синхронизации.',
  )
}

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      realtime: { params: { eventsPerSecond: 2 } },
    })
  : null

// Единственная строка-хранилище.
export const ROW_ID = 1
export const TABLE = 'planner_state'
