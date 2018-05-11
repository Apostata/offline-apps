import PostsView from './views/Posts';
import ToastsView from './views/Toasts';
import idb from 'idb';
import { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } from 'constants';

export default function IndexController(container) {
  this._container = container;
  this._postsView = new PostsView(this._container);
  this._toastsView = new ToastsView(this._container);
  this._lostConnectionToast = null;
  this._openSocket();
  this._registerServiceWorker();
};


IndexController.prototype._listenInstalling = function(worker){

  var indexController = this;
  worker.addEventListener('statechange', function(){ // aguarda uma mudança de estado
    if(worker.state === "installed"){ //vefificar se mudou de estado par instalado
      indexController._updateReady(worker);
    }
  });
};

IndexController.prototype._sendUpdateMessage = function(reg, message){
  reg.postMessage({action: message});
};
//TODO: listener para mudança de controller (worker) e recarregar a página

IndexController.prototype._registerServiceWorker = function(){
  var indexController = this;
  
  window.addEventListener('load', function(){
      navigator.serviceWorker.register('/sw.js')
      .then(function(reg){

        if(!navigator.serviceWorker.controller){
          return;
        }

        if(reg.waiting){ //se está aghuardando significa que tem update
          console.log('reg waiting');
          indexController._updateReady(reg.waiting);
          return
        }

        if(reg.installing){ //se está instalando ...
          console.log('reg installing');
          indexController._listenInstalling(reg.installing);
          return;
        }

        reg.addEventListener("updatefound", function(){
          console.log('update found');
          indexController._listenInstalling(reg);
          return;
        });

      }).catch(function(){
        console.log('Registration failed')
      });
    });

    navigator.serviceWorker.addEventListener('controllerchange', function(){
      console.log('new service worker controller');
      window.location.reload();
    });
};

IndexController.prototype._updateReady = function(worker){
  var indexController = this;

  var toast = this._toastsView.show("New version available", {
    buttons: ['refresh', 'dismiss']
  });

  toast.answer.then(function(answer){
      if(answer != 'refresh') return;
      indexController._sendUpdateMessage(worker, answer);
      //TODO: dizer para o Service worker para Pular a espera
  });
};

// open a connection to the server for live updates
IndexController.prototype._openSocket = function() {
  var indexController = this;
  var latestPostDate = this._postsView.getLatestPostDate();

  // create a url pointing to /updates with the ws protocol
  var socketUrl = new URL('/updates', window.location);
  socketUrl.protocol = 'ws';

  if (latestPostDate) {
    socketUrl.search = 'since=' + latestPostDate.valueOf();
  }

  // this is a little hack for the settings page's tests,
  // it isn't needed for Wittr
  socketUrl.search += '&' + location.search.slice(1);

  var ws = new WebSocket(socketUrl.href);

  // add listeners
  ws.addEventListener('open', function() {
    if (indexController._lostConnectionToast) {
      indexController._lostConnectionToast.hide();
    }
  });

  ws.addEventListener('message', function(event) {
    requestAnimationFrame(function() {
      indexController._onSocketMessage(event.data);
    });
  });

  ws.addEventListener('close', function() {
    // tell the user
    if (!indexController._lostConnectionToast) {
      indexController._lostConnectionToast = indexController._toastsView.show("Unable to connect. Retrying…");
    }

    // try and reconnect in 5 seconds
    setTimeout(function() {
      indexController._openSocket();
    }, 5000);
  });
};

// called when the web socket sends message data
IndexController.prototype._onSocketMessage = function(data) {
  var messages = JSON.parse(data);
  this._postsView.addPosts(messages);
};