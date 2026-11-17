# Anuncio estilo TikTok — "¿Cómo viaja tu mensaje?"

Recrea el formato de los anuncios virales de TikTok: un dato curioso animado en 3D con narrador y subtítulos
en recuadro blanco, y un corte directo al negocio con "si estás interesado, mándanos un mensaje".
Toda la imagen, la voz y la música son originales (no se usa material de otros creadores).

**Archivo final:** `out/aurora-studios-tiktok-cables.mp4` (1080×1920, 30 fps, 44 s)

## Guion

| Tiempo | Imagen | Narración / subtítulo |
|---|---|---|
| 0–3,5 s | Celular sobre los cerros de Valparaíso; el mensaje sale volando hacia el mar | "Cuando le mandas un mensaje a alguien en Estados Unidos," |
| 3,5–7 s | Cielo con un satélite tachado | "tu mensaje no viaja por el cielo ni por un satélite." |
| 7–10 s | Se hunde en el océano y entra a un cable en el fondo | "Baja hasta el fondo del océano y viaja por un cable" |
| 10–12 s | Corte del cable junto a una manguera | "tan delgado como una manguera." |
| 12–18 s | Globo terráqueo: el cable de Valparaíso a Los Ángeles, contador de km | "Desde Valparaíso, por ejemplo, sale un cable hasta Los Ángeles: más de 10.000 km bajo el mar." |
| 18–25,7 s | Dentro de la fibra óptica, velocidad y cronómetro, "✓✓ Entregado" | "Tu mensaje viaja como luz a 200.000 km por segundo y cruza el océano en menos de una décima de segundo." |
| 25,7–29,5 s | Un tiburón muerde el cable; chispas y glitch | "Pero ojo: a veces los tiburones muerden estos cables…" |
| 29,5–44 s | Escenas del video principal de Aurora Studios | "Aurora Studios, tu estudio de tecnología en la V Región. Páginas web, bots y videos, y ahora también apps y juegos. Si estás interesado, mándanos un mensaje (ningún tiburón lo va a morder)." |

Los datos del gancho son reales: más del 99 % del tráfico de Internet entre continentes va por cables
submarinos; los cables de aguas profundas miden unos 2 cm de grosor; el cable Curie une Valparaíso con
Los Ángeles (unos 10.500 km); la luz en la fibra avanza a unos 200.000 km/s (≈ 0,05 s en ese tramo); y hay
registros de tiburones mordiendo cables submarinos.

## Cómo editarlo

- Textos y narración: `guion.json` (`texto` es el subtítulo; `voz` es lo que lee el narrador si es distinto).
- Animación 3D (three.js): `hook.html`. Ver un instante: abrir con `?t=12.5` (Chrome con `--allow-file-access-from-files`).
- Cierre: usa escenas de `../index.html`; los tramos están en `PIVOT` dentro de `scripts/render.mjs`.
- Revisar cuadros: `node scripts/render.mjs sheet 1 5 12 27 35` → `out/preview/sheet.png`.
- Generar todo: `KOKORO_DIR=/ruta/al/modelo ./build.sh`.

## Recursos

- Voz: [Kokoro](https://github.com/thewh1teagle/kokoro-onnx) (Apache 2.0), voz `em_alex`, generada localmente.
- 3D: [three.js](https://threejs.org) (MIT). Mapa: Natural Earth vía world-atlas (dominio público), `scripts/build-earth.mjs`.
- Tipografías: Inter y Archivo (SIL OFL).
- Música y efectos: sintetizados con `scripts/audio.py`; el cierre usa la música del video principal.
