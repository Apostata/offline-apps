import idb from 'idb'; //biblioteca IndexDB Promised para normalizar as promises

var dbPromise = idb.open('test-db', 4, function(upgradDb){
  switch(upgradDb.oldVersion){
      case 0:
          var keyValStore = upgradDb.createObjectStore('keyval');
          keyValStore.put('world', 'hello'); // (valor, key)

      case 1:
          upgradDb.createObjectStore('people', {keyPath: "name"});

      case 2:
        var peopleStore = upgradDb.transaction.objectStore('people');
        peopleStore = peopleStore.createIndex('animal', 'favoriteAnimal');
      
      case 3:
        var peopleStore = upgradDb.transaction.objectStore('people');
        peopleStore = peopleStore.createIndex('age', 'age');
  } 
});

dbPromise.then(function(db){ //lendo
  var tx = db.transaction('keyval');
  var keyValStore = tx.objectStore('keyval');
  return keyValStore.get('hello');
}).then(function(val){
  console.log("Valor do indice 'hello' na store 'keyval' e db 'teste-db' :" + val);
});


dbPromise.then(function(db){ 
  var tx = db.transaction('keyval', 'readwrite');
  var keyValStore = tx.objectStore('keyval');
  keyValStore.put('foo', 'bar'); // (valor, key)
  return tx.complete; // retorna a promise quando a transação tiver sido completada
}).then(function(){
  console.log('Adicionando foo:bar à storage keyval');
})

dbPromise.then(function(db){ 
  var tx = db.transaction('keyval', 'readwrite');
  var keyValStore = tx.objectStore('keyval');
  keyValStore.put('Dog', 'favoriteAnimal'); // (valor, key)
  return tx.complete; // retorna a promise quando a transação tiver sido completada
}).then(function(){
  console.log('Adicionando favouriteAnimal:Dog à storage keyval');
})

dbPromise.then(function(db){ 
  var tx = db.transaction('people', 'readwrite');
  var peopleStore = tx.objectStore('people');

  peopleStore.put({
    name: 'Helena Souza',
    age: 1,
    favoriteAnimal: 'cat'
  });

  peopleStore.put({
    name: 'Erica Souza',
    age: 29,
    favoriteAnimal: 'cat'
  });

  peopleStore.put({
    name: 'Rene Souza',
    age: 33,
    favoriteAnimal: 'dog'
  });

  peopleStore.put({
    name: 'Otavio Souza',
    age: 4,
    favoriteAnimal: 'dog'
  });

  peopleStore.put({
    name: 'Fabio Souza',
    age: 38,
    favoriteAnimal: 'dog'
  });

  return tx.complete; // retorna a promise quando a transação tiver sido completada
}).then(function(){
  console.log('People added');
});


dbPromise.then(function(db){ //lendo
  var tx = db.transaction('people');
  var peopleStore = tx.objectStore('people');
  var animalindex = peopleStore.index('animal');

  return peopleStore.getAll();
}).then(function(people){
  console.log('People:', people);
});

dbPromise.then(function(db){ //lendo
  var tx = db.transaction('people');
  var peopleStore = tx.objectStore('people');
  var animalIndex = peopleStore.index('animal');

  return animalIndex.getAll("cat");
}).then(function(people){
  console.log("People's animals:", people);
});

dbPromise.then(function(db){ //lendo
  var tx = db.transaction('people');
  var peopleStore = tx.objectStore('people');
  var ageIndex = peopleStore.index('age');

  return ageIndex.getAll();
}).then(function(people){
  console.log("People's ages:", people);
});

//lendo um item de cada vez

dbPromise.then(function(db){
  var tx = db.transaction('people');
  var peopleStore = tx.objectStore('people');

  return peopleStore.openCursor();

}).then(function logPerson(cursor){
  if(!cursor) return;

  console.log('Cursor em: ', cursor.value.name);
  return cursor.continue().then(logPerson);

}).then(function(){
  console.log('lista finalizada!');
});
