// Service Worker - Cache-First para modo 100% offline
const CACHE_NAME = 'controle-horas-v32-offline';
const ASSETS = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'chart.js',
  'exceljs.min.js',
  'tools_30.js',
  'prefilled_data.js'
];

// Instalar: cachear todos os assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cacheando assets para uso offline...');
      return cache.addAll(ASSETS);
    }).then(() => {
      console.log('[SW] Instalado e pronto para uso offline!');
      return self.skipWaiting();
    })
  );
});

// Ativar: limpar caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deletando cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Ativo! Controlando todas as páginas.');
      return self.clients.claim();
    })
  );
});

// Fetch: Cache-First (offline total)
// Para assets estáticos: serve do cache primeiro
// Para recursos externos (CDN, fonts): tenta rede, fallback para cache
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Nunca cachear chamadas a /api/ (modo offline: elas não existem mais)
  if (url.pathname.includes('/api/')) {
    return;
  }

  // Para requisições de mesma origem (app) ou localhost: Cache-First
  if (url.origin === self.location.origin || url.hostname === 'localhost') {
    e.respondWith(
      caches.match(e.request, { ignoreSearch: true }).then(cached => {
        if (cached) {
          // Servir do cache, atualizar em background (stale-while-revalidate)
          const networkUpdate = fetch(e.request).then(response => {
            if (response && response.status === 200 && response.type === 'basic') {
              caches.open(CACHE_NAME).then(cache => cache.put(e.request, response.clone()));
            }
            return response;
          }).catch(() => null);
          return cached;
        }
        // Não está no cache: buscar da rede e cachear
        return fetch(e.request).then(response => {
          if (response && response.status === 200) {
            const responseCopy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, responseCopy));
          }
          return response;
        }).catch(() => caches.match('index.html'));
      })
    );
    return;
  }

  // Para recursos externos (CDN, Google Fonts, FA): Cache-First
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) {
        // Stale-while-revalidate
        fetch(e.request).then(response => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, response.clone()));
          }
        }).catch(() => null);
        return cached;
      }
      return fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, responseCopy));
        }
        return response;
      }).catch(() => null);
    })
  );
});
