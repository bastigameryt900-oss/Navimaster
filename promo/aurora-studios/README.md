# Video promocional — Aurora Studios

Video vertical (1080×1920, 30 fps, 58 s) para Reels, TikTok, YouTube Shorts y estados de WhatsApp.
Promociona todos los servicios de [aurorastudios.shop](https://aurorastudios.shop) y suma los nuevos
servicios de apps y juegos, que van **a cotización**.

**Archivo final:** `out/aurora-studios-promo-vertical.mp4`

## Guion

| Tiempo | Escena | Contenido |
|---|---|---|
| 0–4 s | Intro | Se dibuja el logo (la “A” y el sol que sale) y aparece “Aurora Studios · AI Development”. |
| 4–8 s | Gancho | “Tecnología que impulsa tus ideas.”, los servicios y “Desde la V Región de Valparaíso, Chile”. |
| 8–12 s | Bots de Discord | Demo del Aurora Bot respondiendo `/servicios`. Sin hosting $40.000 · Con hosting $50.000. |
| 12–16 s | Páginas Web | Sitio en computador y celular con botón de WhatsApp. Sin dominio $70.000 · Con dominio anual $85.000. |
| 16–20 s | Reels | Reel vertical y línea de tiempo de edición. Edición $10.000 · Creación $15.000. |
| 20–24 s | Videos para YouTube | Reproductor y botón de suscripción. Edición $20.000 · Creación $30.000. |
| 24–26 s | Nuevo | “Y ahora también: Apps y juegos.”, con iPhone, Android, Windows y Juegos. “Todo a cotización”. |
| 26–29 s | Apps para iPhone | App iOS con notificación. A cotización. |
| 29–32 s | Apps para Android | App Android con reservas. A cotización. |
| 32–35 s | Programas para Windows | Programa de escritorio con panel de ventas. A cotización. |
| 35–38 s | Videojuegos | Minijuego de plataformas animado. A cotización. |
| 38–42 s | A medida | Automatizaciones, integraciones, IA, chatbots, sistemas a medida. A cotización. |
| 42–46 s | Clientes | Kenpo Karate Power Evolution y Al Paso Food Truck, con sus reseñas reales. |
| 46–50 s | Proceso | Los 4 pasos y las garantías (precio confirmado, sin cobros sorpresa). |
| 50–58 s | Cierre | “Cotiza tu proyecto.”, WhatsApp +56 9 2227 4083, @aurorastudioscl, aurorastudios.shop. |

Precios en pesos chilenos (CLP), tal como aparecen en el sitio.

## Cómo editarlo

Todo el video es una página HTML animada con GSAP (`index.html`). Para cambiar un texto o un precio,
edítalo ahí y vuelve a generar el video.

- Ver la animación en vivo: abre `index.html?play` en Chrome.
- Ver un instante exacto: `index.html?t=27.5`.
- Hoja de cuadros para revisar: `node scripts/render.mjs sheet 5 10 27 53` → `out/preview/sheet.png`.
- Generar todo: `./build.sh` (música, cuadros y mezcla final).

## Recursos

- Tipografía Archivo (la misma del sitio), licencia SIL OFL: `assets/fonts/`.
- Logo tomado del favicon del sitio.
- Íconos: [Simple Icons](https://simpleicons.org) (CC0) y [Lucide](https://lucide.dev) (ISC).
- Música original sintetizada con `scripts/music.py` (sin samples externos, libre de derechos).
