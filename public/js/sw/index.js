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
        caches.open('wittr-static-v1')
        .then(function(cache){
            return cache.addAll(urlsToCache);
        })
    )
});

self.addEventListener('fetch', function(event){ //intercepta todas requisições
    event.respondWith(
        fetch(event.request)
        .then(function(response){
            if(response.status === 404){
                return fetch('/imgs/dr-evil.gif')
            }
            return response;    
        })
        .catch(function(){
            return new Response("Falha geral")
        })
    )    
});