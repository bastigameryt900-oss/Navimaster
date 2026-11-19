# Anuncios estilo TikTok — serie "¿Sabías que…?"

Tres anuncios con el mismo formato que el de los cables submarinos (`../tiktok`): un dato curioso
animado en 3D con narrador y subtítulos, y un corte a Aurora Studios con "si estás interesado, mándanos un mensaje".
Cada uno vende un servicio distinto. Todo es original: animación (three.js), voz y música.
El de páginas web usa la narración que grabaste en ElevenLabs (voz "Mauricio", en `web/voz/`); los otros dos usan la voz local Kokoro.

| Carpeta | Tema | Vende | Duración | Video final |
|---|---|---|---|---|
| `web/` | Decidimos si nos gusta una web en 50 ms; más de la mitad se va si tarda > 3 s | Páginas web | 37 s | `web/out/aurora-studios-web-50ms.mp4` |
| `bots/` | ELIZA (1966), el primer chatbot, y la anécdota de la secretaria | Bots de Discord | 36 s | `bots/out/aurora-studios-bots-eliza.mp4` |
| `juegos/` | Tennis for Two (1958) en un osciloscopio; hoy los juegos superan al cine + música | Juegos y apps | 35 s | `juegos/out/aurora-studios-juegos-1958.mp4` |

Las fuentes de cada dato están en el campo `_fuentes` de cada `guion.json`.

## Cómo está armado

- `lib/base.js` / `lib/base.css`: motor común (render 3D con posproceso, subtítulos, utilidades, control de tiempo).
- `<episodio>/guion.json`: subtítulos y narración (`texto` en pantalla, `voz` si se lee distinto).
- `<episodio>/episodio.json`: cortes de escena, tramos del video principal que se usan en el cierre, música y efectos.
- `<episodio>/hook.html`: escenas 3D del gancho.
- `scripts/tts.py` (voz), `scripts/audio.py` (mezcla), `scripts/render.mjs` (cuadros, video y archivo final).

## Usar una voz grabada

Pon los audios en `<episodio>/voz/` y anota en `voz/mapa.json` qué líneas de `guion.json` cubre cada uno
(ver `web/voz/mapa.json`). Luego, en vez de `tts.py`:

```bash
python3 scripts/voz_externa.py web    # arma out/voz.wav y ubica los subtítulos en las pausas de la voz
```

Las escenas se ajustan solas a los nuevos tiempos; después sigue con `audio.py` y `render.mjs`.

## Generar un episodio

```bash
python3 scripts/tts.py web /ruta/al/modelo-kokoro     # voz + tiempos
python3 scripts/audio.py web                           # música + efectos + voz
node scripts/render.mjs web sheet 1 5 12 20            # revisar cuadros (out/preview/sheet.png)
node scripts/render.mjs web video --workers 4          # cuadros → video sin audio
node scripts/render.mjs web final                      # video final con audio
```

Requiere el video principal (`../index.html`) y su música (`../out/musica.wav`, de `../scripts/music.py`).
