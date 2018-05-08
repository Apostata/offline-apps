self.addEventListener('fetch', function(event){

    event.respondWith(
        new Response('<h1 class="a-winner-is-me">Resposta</h1>', {
            headers:{
                "Content-Type": "text/html"            }
        })
    )
    //console.log(event.request);
});