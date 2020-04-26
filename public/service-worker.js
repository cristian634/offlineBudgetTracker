//array of data to cache 
const FILES_TO_CACHE = [
    "/",
    "/index.js",
    "/manifest.webmanifest",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "/indexDB.js"
];
//run time and cache data 
const PRECACHE = "precache-v1";
const RUNTIME = "runtime";
//install service worker
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(PRECACHE)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(self.skipWaiting())
    );
});
//when the service worker starts add precached data
self.addEventListener("activate", event => {
    const currentCashes = [PRECACHE, RUNTIME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !currentCashes.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return cashes.delete(cacheToDelete)
            }));
        }).then(() => self.clients.claim())
    );
});

// fetch request - if error store data 
self.addEventListener("fetch", event => {
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            caches.open(RUNTIME).then(cache => {
                return fetch(event.request).then(
                    response => {
                        if (response.status === 200) {//good repsonse  
                            cache.put(event.request.url, response.clone());
                        }
                        return response;
                    }).catch(err => {
                        return cache.match(event.request);
                    });
            }).catch(err => console.log(err))
        );
        return;
    }
    event.respondWith(fetch(event.request).catch(() => {
        return caches.match(event.request).then((response) => {
            if (respsonse) {
                return response;
            } else if (event.request.headers.get("accept").includes("text/html")) {
                return caches.match("/");
            }
        }); 
    })
    );
}); 

// CLASS ACTIVITY CODE THAT DOESN'T WORK IN THIS SITUATION 
// self.addEventListener("fetch", event => {
//   if (event.request.url.startsWith(self.location.origin)) {
//     event.respondWith(
//       caches.match(event.request).then(cachedResponse => {
//         if (cachedResponse) {
//           return cachedResponse;
//         }

//         return caches.open(RUNTIME).then(cache => {
//           return fetch(event.request).then(response => {
//             return cache.put(event.request, response.clone()).then(() => {
//               return response;
//             });
//           });
//         });
//       })
//     );
//   }
// });