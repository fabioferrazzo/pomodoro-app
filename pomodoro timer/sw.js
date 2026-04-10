const CACHE_NAME = 'pomodoro-app-v5'; // Versão atualizada para forçar a limpeza da cache antiga
const URLS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './icon.PNG' // Respeitando a nomenclatura com maiúsculas do seu ficheiro
];

// Instalação do Service Worker e pré-cache dos ficheiros
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(URLS_TO_CACHE))
  );
});

// Ativação e limpeza de caches antigas (muito importante para atualizações)
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('A apagar cache antiga:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estratégia Network-First (Tenta a internet primeiro, se falhar ou estiver offline, usa a cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Apenas faz cache de requisições válidas (http/https) para evitar erros com extensões
        if (!event.request.url.startsWith('http')) return networkResponse;
        
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return networkResponse;
      })
      .catch(() => {
        // Se estiver offline ou der erro de rede, puxa da cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          
          // Fallback para a página inicial se for uma navegação (ex: o utilizador atualiza a página offline)
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});