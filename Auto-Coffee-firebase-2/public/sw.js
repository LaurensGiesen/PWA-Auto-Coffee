"use strict";

const CACHEPATHS = ["/404.html",
"https://fonts.googleapis.com/icon?family=Material+Icons",
"https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css",
"img/apple-touch-icon.png",
"img/favicon-32x32.png",
"img/favicon-16x16.png",
"/site.webmanifest",
"img/safari-pinned-tab.svg",
"https://code.jquery.com/jquery-3.6.0.min.js",
"https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js",
"/scripts/offline.js",
"/scripts/localforage.js"]

const CACHE_NAME = "auto-coffee-Cache-V1";

self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(CACHEPATHS);
        })
    );
});

self.addEventListener("fetch", e => {
    e.respondWith(
        fetch(e.request)
            .catch(
                () => {
                    return caches.open(CACHE_NAME).then(cache => {
                        return cache.match("/404.html");
                    });
                }
            )
    );
})