// Service worker para notificaciones push - EDS Centro Servicios Zona Industrial
// No cachea nada, solo escucha eventos push y clicks en la notificacion.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Alerta de Cupo', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Alerta de Cupo Bajo';
  const options = {
    body: data.body || 'Un cliente tiene el cupo bajo.',
    icon: data.icon || 'icons/icon-192.png',
    badge: data.badge || 'icons/badge-96.png',
    vibrate: data.vibrate || [300, 100, 300, 100, 300],
    requireInteraction: data.requireInteraction !== undefined ? data.requireInteraction : true,
    data: { url: data.url || './index.html' },
    tag: data.tag || 'cupo-alerta',
    renotify: true,
    actions: data.actions || [
      { action: 'ver', title: 'Ver detalles' },
      { action: 'descartar', title: 'Descartar' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'descartar') {
    return;
  }

  const url = (event.notification.data && event.notification.data.url) || './index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
