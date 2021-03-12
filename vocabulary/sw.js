const filesToCache = [
    '/vocabulary/',
    '/vocabulary/vocabulary.css',
    '/vocabulary/bootstrap.min.css',
    '/vocabulary/tocca.js',
    '/vocabulary/alpine.js',
    '/vocabulary/index.html',
    '/vocabulary/vocabulary.json'
  ];

const staticCacheName = 'pages-cache-v8';

self.addEventListener('install', event => {
  console.log('Attempting to install service worker and cache static assets');
  event.waitUntil(
    caches.open(staticCacheName)
    .then(cache => {
      return cache.addAll(filesToCache);
    })
  );
});

// network first, then cache
 self.addEventListener('fetch', function(event) {
  console.log('Fetch event for ', event.request.url);
  
  if (event.request.url.match('vocabulary.json')) {
    console.log('Processing ', event.request.url);
    event.respondWith(
      fetch(event.request).then(response => {
        return caches.open(staticCacheName).then(cache => {
          cache.put(event.request.url, response.clone());
          console.log('Revalidated', event.request.url);
          return response;
        });
      })
      .catch(function() {
        return caches.match(event.request);
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('Found ', event.request.url, ' in cache');
          return response;
        }
        console.log('Network request for ', event.request.url);
        return fetch(event.request)
      })
    );
  }
});

/***
self.addEventListener('fetch', event => {
    console.log('Fetch event for ', event.request.url);
    event.respondWith(
      caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('Found ', event.request.url, ' in cache');
          return response;
        }
        console.log('Network request for ', event.request.url);
        return fetch(event.request)
  
        // TODO 4 - Add fetched files to the cache
        .then(response => {
            // TODO 5 - Respond with custom 404 page
            return caches.open(staticCacheName).then(cache => {
              cache.put(event.request.url, response.clone());
              return response;
            });
          });
           
      }).catch(error => {
  
        // TODO 6 - Respond with custom offline page
  
      })
    );
  });
  */
