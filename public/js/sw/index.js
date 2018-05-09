var staticCacheName = 'wittr-static-v1';
self.addEventListener('install', function(event){
    var urlsToCache = [
        '/',
        'js/main.js',
        'css/main.css',
        'imgs/icon.png',
        'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
        'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
    ];
    event.waitUntil(
        caches.open(staticCacheName)
        .then(function(cache){
            return cache.addAll(urlsToCache);
        })
    )
});

self.addEventListener('activate', function(event){ //assim que terminar a instalação
    event.waitUntil(
        caches.keys().then(function(cacheNames){
            return Promise.all(
                cacheNames.filter(function(cacheName){
                    return cacheName.startsWith('wttr-') && 
                    cacheName != staticCacheName;
                }).map(function(cacheName){
                    return cache.delete(cacheName)
                })
            );
        })
    )
});

self.addEventListener('fetch', function(event){ //intercepta todas requisições
    event.respondWith(
       caches.match(event.request)
       .then(function(response){
            if(response){
                return response
            }

            return fetch(event.request)
       })
    )    
});

