// Service worker de Aurora Studios: deja la app disponible sin conexión.
// Páginas: primero la red (siempre lo más nuevo) y, si no hay conexión, la copia guardada.
// Archivos de /_next/static: llevan huella en el nombre, así que se sirven desde la caché.

const VERSION = "aurora-v2";
const PAGES = ["/", "/servicios", "/cotizar", "/nosotros", "/contacto"];

// Una respuesta que vino de una redirección no se puede usar para una navegación: se copia limpia.
const clean = async (response) =>
  response.redirected
    ? new Response(await response.blob(), { status: response.status, statusText: response.statusText, headers: response.headers })
    : response;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) =>
        Promise.all(
          PAGES.map((page) =>
            fetch(page)
              .then(async (response) => {
                if (response.ok) await cache.put(new URL(response.url).pathname, await clean(response));
              })
              .catch(() => {}),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

// La misma página puede pedirse como /servicios o /servicios/ según el hosting.
const otherSlash = (pathname) => (pathname.endsWith("/") ? pathname.slice(0, -1) || "/" : `${pathname}/`);

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Datos de navegación interna de Next.js: siempre desde la red.
  if (request.headers.get("RSC") || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(request, { ignoreSearch: true })
            .then((hit) => hit || caches.match(otherSlash(url.pathname)))
            .then((hit) => hit || caches.match("/"))
            .then((hit) => hit || Response.error()),
        ),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(VERSION).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // Íconos, imágenes y el resto: copia guardada al instante y se actualiza por detrás.
  event.respondWith(
    caches.match(request).then((hit) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => hit || Response.error());
      return hit || network;
    }),
  );
});
