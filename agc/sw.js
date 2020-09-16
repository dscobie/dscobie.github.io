const filesToCache = [
    '/agc/',
    '/agc/index.html',
    '/agc/bootstrap-icons.svg',
    '/agc/css/starter-template.css',
    '/agc/css/bootstrap.min.css',
    '/agc/bootstrap.min.css.map',
    '/agc/images/agclogo.png',
    '/agc/images/agcicon.png',
    '/agc/js/alpine.js',
    '/agc/js/bootstrap.bundle.min.js',
    '/agc/js/bootstrap.bundle.min.js.map',
    '/agc/js/dexie.js',
    '/agc/js/jquery.slim.min.js'
];

const staticCacheName = 'pages-cache-agcv1';

self.addEventListener('install', event => {
  console.log('Attempting to install service worker and cache static assets');
  event.waitUntil(
    caches.open(staticCacheName)
    .then(cache => {
      return cache.addAll(filesToCache);
    })
  );
});

// cache first, network fallback 
self.addEventListener('fetch', event => {
  console.log('Fetch event for ', event.request.url);
  event.respondWith(
    caches.match(event.request)
    .then(response => {
      if (response) {
        console.log('Found ', event.request.url, ' in cache');
        return response;
      } else {
        console.log('Network request for ', event.request.url);
        return fetch(event.request)
        // add network response to cache
        .then(response => {
            return caches.open(staticCacheName).then(cache => {
//              cache.put(event.request.url, response.clone());
              return response;
            });
          });
      }
    }).catch(error => {

      // TODO 6 - Respond with custom offline page

    })
  );
});
