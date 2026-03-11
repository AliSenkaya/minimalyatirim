// ═══════════════════════════════════════════════════════════════
//  Minimal Yatırım — Halka Arz Simülatörü
//  Service Worker: sw.js
//
//  Bu dosyayı simülatörünüzü yayınladığınız sunucunun
//  KÖK DİZİNİNE koyun (index.html ile aynı klasör)
// ═══════════════════════════════════════════════════════════════

const CACHE_NAME = 'halkarz-v1'

// ── INSTALL ──────────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  self.skipWaiting()
})

// ── ACTIVATE ─────────────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim())
})

// ── PUSH BİLDİRİMİ AL ────────────────────────────────────────────
self.addEventListener('push', (e) => {
  let data = {}
  try {
    data = e.data?.json() || {}
  } catch {
    data = { title: 'Yeni Halka Arz!', body: e.data?.text() || '' }
  }

  const title   = data.title   || '🔔 Yeni Halka Arz!'
  const options = {
    body:    data.body    || 'Yeni bir halka arz açıldı. Hemen inceleyin!',
    icon:    data.icon    || '/icon-192.png',
    badge:   data.badge   || '/badge-72.png',
    tag:     'halkarz-notif',          // aynı tag = öncekinin üstüne yazar
    renotify: true,
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      timestamp: data.timestamp || new Date().toISOString(),
    },
    actions: [
      { action: 'open',    title: '📊 Simülatörü Aç' },
      { action: 'dismiss', title: 'Kapat'             },
    ],
  }

  e.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// ── BİLDİRİME TIKLANINCA ─────────────────────────────────────────
self.addEventListener('notificationclick', (e) => {
  e.notification.close()

  if (e.action === 'dismiss') return

  const targetUrl = e.notification.data?.url || '/'

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Zaten açık bir sekme varsa oraya odaklan
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      // Yoksa yeni sekme aç
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})

// ── BİLDİRİM KAPATILINCA ─────────────────────────────────────────
self.addEventListener('notificationclose', (e) => {
  // İsteğe bağlı: analitik için buraya log eklenebilir
  console.log('Bildirim kapatıldı:', e.notification.tag)
})
