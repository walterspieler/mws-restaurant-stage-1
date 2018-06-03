const CACHE_NAME = 'mws-restaurant-home-v1.0-c';
const CACHE_NAME_INFO = 'mws-restaurant-info-v1.0';
const commonsurlsToCache = [
  '/css/styles.css',
  '/css/styles-640.css',
  '/css/styles-1000.css',
  '/css/styles-1250.css',
  '/css/styles-1250.css',
  '/build/1.jpg',
  '/build/2.jpg',
  '/build/3.jpg',
  '/build/4.jpg',
  '/build/5.jpg',
  '/build/6.jpg',
  '/build/7.jpg',
  '/build/8.jpg',
  '/build/9.jpg',
  '/build/10.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:100,400'
];
const homeurlsToCache = ['/', '/build/main.bundle.js'];
const infourlsToCache = ['restaurant.html', '/build/restaurantInfo.bundle.js'];

/*self.addEventListener('install', function(event) {
  console.log('Install Event: ', event);
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log(('Opened cache', CACHE_NAME));
      return cache.addAll([...commonsurlsToCache, ...homeurlsToCache]);
    }),
    caches.open(CACHE_NAME_INFO).then(function(cache) {
      console.log(('Opened cache', CACHE_NAME_INFO));
      return cache.addAll([...commonsurlsToCache, ...infourlsToCache]);
    })
  );
});*/

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // IMPORTANT: Clone the request. A request is a stream and
      // can only be consumed once. Since we are consuming this
      // once by cache and once by the browser for fetch, we need
      // to clone the response.
      var fetchRequest = event.request.clone();

      return fetch(fetchRequest).then(function(response) {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // IMPORTANT: Clone the response. A response is a stream
        // and because we want the browser to consume the response
        // as well as the cache consuming the response, we need
        // to clone it so we have two streams.
        var responseToCache = response.clone();

        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

self.addEventListener('activate', function(event) {
  const cacheWhitelist = ['mws-restaurant-home-v1.0-b', 'mws-restaurant-info-v1.0'];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});