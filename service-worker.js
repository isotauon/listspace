// the page from the network when there is one, so a new build lands at once;
// the cache answers when there is not. the cache name carries a version and
// every other cache goes on activate, so nobody is left on an old build
var CACHE = 'ephemeral-list-v2';
var SHELL = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];
self.addEventListener('install', function (e) {
	e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
	e.waitUntil(caches.keys().then(function (keys) {
		return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
	}).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
	if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
	e.respondWith(fetch(e.request).then(function (res) {
		var copy = res.clone();
		caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
		return res;
	}).catch(function () {
		return caches.match(e.request).then(function (r) { return r || caches.match('/'); });
	}));
});
