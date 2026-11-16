#!/usr/bin/env bash
# Arma el video final: música + cuadros + mezcla.
# Requiere: node 18+, Playwright con Chromium, ffmpeg, python3 con numpy y scipy.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
python3 scripts/music.py out/musica.wav
node scripts/render.mjs video --fps 30 --workers "${WORKERS:-4}"
# -2 dB lleva la música de ~-12 a ~-14 LUFS (nivel de Instagram/YouTube).
ffmpeg -y -loglevel error -i out/video-sin-audio.mp4 -i out/musica.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k \
  -af "volume=-2dB,afade=t=out:st=57.3:d=0.7" -shortest -movflags +faststart \
  out/aurora-studios-promo-vertical.mp4
echo "Listo: out/aurora-studios-promo-vertical.mp4"
