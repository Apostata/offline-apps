var staticCacheName = 'wittr-static-v1';
//teste 1

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
        caches.open(staticCacheName) //cria ou abre se não tiver criado
        .then(function(cache){
            //cache.put(request, response) colocar item pot item no cache
            return cache.addAll(urlsToCache); //coloca todo array no cahce e retorn um fetch
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
    var reqUrl = new URL(event.request.url); //gera um novo objeto url com os parametros de path e origin para a requisição

    if(reqUrl.origin === location.origin){
        if(reqUrl.pathname === '/'){
            event.respondWith(
                caches.match('/skeleton')
            );
            return;
        }
    }
//else
    event.respondWith(
       caches.match(event.request) //se a requisição está em cache
       .then(function(response){
            if(response){
                return response
            }

            return fetch(event.request)
       })
    )    
});


//TODO: listener para receber a mensagem e chamar o skip Waiting - Feito
self.addEventListener('message', function(event){
    var worker = self;
    this.console.log(event.data.action);
    if(event.data.action === "refresh"){
        worker.skipWaiting();
    }
});


