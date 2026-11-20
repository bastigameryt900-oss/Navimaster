# Aurora Studios — App

Nueva aplicación web de [aurorastudios.shop](https://aurorastudios.shop), hecha con Next.js 16, React 19 y Tailwind CSS 4.
Es una app instalable (PWA): se puede agregar a la pantalla de inicio del celular y funciona sin conexión.

## Qué cambió respecto del sitio anterior

- **Se eliminó** toda mención a la V Región / Valparaíso.
- **Se agregó** que Aurora Studios es parte del **Grupo Aurora Studios América Latina** (portada, Nosotros, pie de página y preguntas frecuentes).
- **Se agregó** que trabajamos **en cualquier país**: atención 100% en línea, WhatsApp y videollamada, cotización en tu moneda y horarios según tu zona horaria.
- Página **Nosotros** mucho más completa: quiénes somos, el grupo, misión, visión, valores, cómo trabajamos a distancia, especialidades, cómo hemos crecido, proceso, reseñas y preguntas frecuentes.
- Diseño nuevo, tipo app: fondo de aurora animado, barra de navegación inferior en el celular y un **cotizador** que arma la cotización y la envía por WhatsApp.

## Páginas

| Ruta | Contenido |
|---|---|
| `/` | Portada, servicios, países, cómo funciona la app, grupo, reseñas |
| `/servicios` | Catálogo con filtros, opciones y precios; botón “Agregar a mi cotización” |
| `/cotizar` | Cotizador: servicios elegidos, datos (país, idea, plazo, moneda), resumen y envío por WhatsApp |
| `/nosotros` | Toda la información del estudio |
| `/contacto` | WhatsApp, Instagram, mensaje rápido e instalación de la app |

La cotización y los datos del formulario se guardan solo en el navegador de cada persona (localStorage) hasta que la envía.

## Cómo usarla

```bash
cd aurora-studios-app
npm install
npm run dev      # http://localhost:3000
npm run build    # versión de producción
npm start
```

## Publicarla en Vercel

Importa el repositorio en Vercel y, en **Root Directory**, elige `aurora-studios-app`. Luego conecta el dominio `aurorastudios.shop`.

## Dónde se edita cada cosa

- **Precios, servicios, reseñas, WhatsApp, Instagram, países:** `lib/site.ts`
- **Textos de Nosotros (misión, visión, valores, historia, preguntas):** `app/nosotros/page.tsx`
- **Portada:** `app/page.tsx`
- **Colores y animaciones:** `app/globals.css`
- **Íconos de la app instalada:** `public/icons/` y `app/apple-icon.png`

## Recursos

- Tipografía Archivo (licencia SIL OFL, `app/fonts/`).
- Íconos de [Simple Icons](https://simpleicons.org) (CC0) y [Lucide](https://lucide.dev) (ISC).
