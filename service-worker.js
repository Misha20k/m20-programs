self.addEventListener('install', (event) => {
    console.log('Service Worker установлен');
});

self.addEventListener('fetch', (event) => {
    console.log('Service Worker обрабатывает запрос:', event.request.url);
});
