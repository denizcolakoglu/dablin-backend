// sw.js - Service Worker for Push Notifications

self.addEventListener('push', function(event) {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Dablin', body: event.data.text() };
    }
  }

  const title = data.title || 'Dablin';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: {
      url: data.url || 'https://dablin.co'
    },
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const url = event.notification.data.url || 'https://dablin.co';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('pushsubscriptionchange', function(event) {
  event.waitUntil(
    self.registration.pushManager.subscribe({ userVisibleOnly: true })
      .then(function(subscription) {
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
      })
  );
});
