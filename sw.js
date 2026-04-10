// Força o Service Worker a se atualizar imediatamente
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

// Garante que o SW assuma o controle das abas abertas
self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

// Escuta o clique na notificação do Windows/Android
self.addEventListener('notificationclick', (e) => {
  e.notification.close(); // Fecha o banner da notificação
  
  // Tenta focar na janela do App que já está aberta ou abre uma nova
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        if (client.focus) return client.focus();
      }
      return clients.openWindow('./');
    })
  );
});