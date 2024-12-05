if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log('Service Worker зарегистрирован'))
        .catch((error) => console.error('Ошибка регистрации Service Worker:', error));
}
