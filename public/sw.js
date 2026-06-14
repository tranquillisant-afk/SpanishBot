const CACHE = 'planner-v2'

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.add('/')))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  // Удаляем старые кэши.
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // Supabase-запросы всегда идут через сеть (нужна синхронизация).
  if (url.hostname.includes('supabase.co')) return

  // Для остальных — сначала сеть, при ошибке — кэш.
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        if (resp.ok && e.request.method === 'GET') {
          const clone = resp.clone()
          caches.open(CACHE).then((c) => c.put(e.request, clone))
        }
        return resp
      })
      .catch(() =>
        caches.match(e.request).then((cached) => cached || caches.match('/'))
      )
  )
})
