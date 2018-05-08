self.addEventListener('fetch', function(event){

   /* event.respondWith(
        new Response('<h1 class="a-winner-is-me">Resposta</h1>', {
            headers:{
                "Content-Type": "text/html"            }
        })
    )*/

    if(event.request.url.endsWith('.jpg')){
        event.respondWith(
            fetch('/imgs/dr-evil.gif')
        )
    }
    
});