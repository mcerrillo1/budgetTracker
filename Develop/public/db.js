
// TODO: open  indexedDB
const indexedDB =
window.indexedDB ||
window.mozIndexedDB ||
window.webkitIndexedDB ||
window.msIndexedDB ||
window.shimIndexedDB;

let db;
const request = indexedDB.open("budget", 1);

// TODO: create an object store in the open db
request.onupgradeneeded = function(event){
  const db = event.target.result;
  db.createObjectStore("budget", { autoIncrement: true });
};
// TODO: log any indexedDB errors

request.onerror = function(event){
  console.log(`Error ${event.target.errorCode}`)
};

// TODO: add code so that any transactions stored in the db
// are sent to the backend if/when the user goes online
// Hint: learn about "navigator.onLine" and the "online" window event.

request.onsuccess = function(event){
  db = event.target.result;

  if(navigator.onLine){
    databaseCheck();
  }
}
// TODO: add code to saveRecord so that it accepts a record object for a
// transaction and saves it in the db. This function is called in index.js
// when the user creates a transaction while offline.
function saveRecord(record) {
  // add your code here
  const transaction = db.transaction(["pending"], "readwrite");

  const store = transaction.objectStore("pending");

  store.add(record);
}

function databaseCheck(){
  const transaction = db.transaction(["budget"], "readwrite");
  const store = transaction.objectStore("budget");
  const getAll = store.getAll();

  getAll.onsuccess = function(){
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
          .then(response => response.json())
          .then(() => {
            const transaction = db.transaction(["budget"], "readwrite");
            const store = transaction.objectStore("budget");
            store.clear();
          });
      }
  }
};

window.addEventListener("online", databaseCheck);