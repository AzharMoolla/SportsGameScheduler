self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('silbo-app-shell-v1').then((cache) =>
      cache.addAll(['/', '/site.webmanifest', '/favicon.svg', '/apple-touch-icon.png', '/pwa-192x192.png']),
    ),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== 'silbo-app-shell-v1').map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone()
          caches.open('silbo-app-shell-v1').then((cache) => cache.put('/', copy))
          return response
        })
        .catch(() => caches.match('/') || Response.error()),
    )
    return
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)))
})

self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = {}
  }

  const title = payload.title || 'Silbo Sports alert'
  const options = {
    body: payload.body || 'A schedule you follow has an update.',
    icon: '/assets/brand/notification-icon.png',
    badge: '/assets/brand/notification-badge.png',
    tag: typeof payload.tag === 'string' ? payload.tag : undefined,
    data: { url: safeNotificationTarget(payload.url) },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = safeNotificationTarget(event.notification.data?.url)
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((client) => new URL(client.url).origin === self.location.origin)
      if (existing) return existing.navigate(target).then(client => (client || existing).focus())
      return clients.openWindow(target)
    }),
  )
})

// A notification must return to this app, including when a malformed payload arrives.
function safeNotificationTarget(value) {
  try {
    const url = new URL(typeof value === 'string' ? value : '/settings/alerts', self.location.origin)
    if (url.origin === self.location.origin && url.protocol === 'https:') return url.href
    if (url.origin === self.location.origin && self.location.hostname === '127.0.0.1') return url.href
  } catch { /* Use the alert settings page. */ }
  return `${self.location.origin}/settings/alerts`
}
