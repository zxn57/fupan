const CACHE_NAME = 'fupan-v4';

// 安装
self.addEventListener('install', event => {
  self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)));
    })
  );
  self.clients.claim();
});

// 网络优先：始终拉最新，离线时才用缓存
self.addEventListener('fetch', event => {
  if (event.request.url.includes('api.deepseek.com')) return;

  event.respondWith(
    fetch(event.request).then(response => {
      // 成功后更新缓存
      const clone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      return response;
    }).catch(() => {
      // 离线时用缓存
      return caches.match(event.request);
    })
  );
});
