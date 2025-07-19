/* eslint-disable no-restricted-globals */
const CACHE_NAME = "kpfc-manager-v1";
const urlsToCache = [
	"/",
	"/static/js/bundle.js",
	"/static/css/main.css",
	"/manifest.json",
	"/favicon.ico",
	"/logo192.png",
	"/logo512.png",
];

// Install event
self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log("Opened cache");
			return cache.addAll(urlsToCache);
		})
	);
});

// Fetch event
self.addEventListener("fetch", (event) => {
	event.respondWith(
		caches.match(event.request).then((response) => {
			// Return cached version or fetch from network
			return response || fetch(event.request);
		})
	);
});

// Activate event
self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (cacheName !== CACHE_NAME) {
						console.log("Deleting old cache:", cacheName);
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});
