#!/usr/bin/env bash
# Arma el anuncio estilo TikTok "¿Cómo viaja tu mensaje?".
# Requisitos: node 18+ con Playwright/Chromium, ffmpeg, python3 con numpy, scipy y kokoro-onnx.
# KOKORO_DIR debe apuntar a la carpeta con kokoro-v1.0.int8.onnx y voices-v1.0.bin
# (https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
: "${KOKORO_DIR:?Define KOKORO_DIR con la carpeta del modelo Kokoro}"
python3 scripts/tts.py "$KOKORO_DIR" out/voz.wav out/tiempos.json
[ -f ../out/musica.wav ] || python3 ../scripts/music.py ../out/musica.wav
python3 scripts/audio.py out/voz.wav out/tiempos.json ../out/musica.wav out/audio.wav
node scripts/render.mjs video --workers "${WORKERS:-4}"
# -1.3 dB lleva la mezcla de ~-12,7 a ~-14 LUFS.
ffmpeg -y -loglevel error -i out/video-sin-audio.mp4 -i out/audio.wav -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 192k -af "volume=-1.3dB" -shortest -movflags +faststart \
  out/aurora-studios-tiktok-cables.mp4
echo "Listo: out/aurora-studios-tiktok-cables.mp4"
