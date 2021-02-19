// This file has a homegrown backup cache server API and a firebase cache server API

/* const fetch = require('node-fetch');

const CACHE_SERVER_ROOT_URL = 'https://cache.tendies.exchange/';

class CacheServer {
  constructor(callback, resource) {
    this.pollOnce = () => {
      const promise = fetch(CACHE_SERVER_ROOT_URL + resource, { cache: 'no-store' });
      promise.then((res) => res.json()).then(callback);
    };
    this.pollIndefinitely = () => {
      this.pollOnce();
      this.timer = setTimeout(this.pollIndefinitely, 5000);
    };
  }

  startPolling() {
    this.pollOnce();
    this.timer = setTimeout(this.pollIndefinitely, 5000);
  }

  stopPolling() {
    clearTimeout(this.timer);
  }

  updateResource(resource) {
    throw 'please define updateResource in CacheServer.js';
    alert('please define updateResource in CacheServer.js');
  }
} */

import firebase from 'firebase/app';
import 'firebase/database';

const config = {
  apiKey: 'AIzaSyAUABJOTkzXoWwC1_z7toj0wuWPrEQBWJs',
  databaseURL: 'https://tendiesexchange-default-rtdb.firebaseio.com',
  projectId: 'tendiesexchange',
  appId: '1:962602241177:web:69e706e6c963acc115fc08',
};
try {
  firebase.initializeApp(config);
} catch (e) {
  console.error();
}

class CacheServer {
  constructor(callback, resource) {
    this.resource = resource;
    this.ref = firebase.database().ref(resource);
    this.callback = callback;
  }

  startPolling() {
    this.ref.on('value', (snapshot) => {
      const data = snapshot.val();
      this.callback(data);
    });
  }

  stopPolling() {
    this.ref.off();
  }

  updateResource(resource) {
    if (this.resource !== resource) {
      this.stopPolling();
      this.resource = resource;
      this.ref = firebase.database().ref(resource);
      this.startPolling();
    }
  }
}

export default CacheServer;
