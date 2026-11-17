"""Genera la narración con Kokoro (TTS local, open source) y los tiempos de los subtítulos.

Uso:
  python3 scripts/tts.py <episodio> <carpeta-modelo>     -> <episodio>/out/voz.wav y tiempos.json

<carpeta-modelo> debe tener kokoro-v1.0.int8.onnx y voices-v1.0.bin, de
https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0  (pip install kokoro-onnx)
"""
import json
import sys
import wave
from math import gcd
from pathlib import Path

import numpy as np
from kokoro_onnx import Kokoro
from scipy.signal import butter, resample_poly, sosfilt

SR = 44100
LEAD = 0.25  # silencio inicial
VOZ = "em_alex"
VELOCIDAD = 1.12

root = Path(sys.argv[1]).resolve()
model_dir = Path(sys.argv[2])
(root / "out").mkdir(exist_ok=True)
out_wav, out_json = str(root / "out" / "voz.wav"), str(root / "out" / "tiempos.json")
guion = json.loads((root / "guion.json").read_text(encoding="utf-8"))["lineas"]
kok = Kokoro(str(model_dir / "kokoro-v1.0.int8.onnx"), str(model_dir / "voices-v1.0.bin"))


def synth(text):
    x, vsr = kok.create(text, voice=VOZ, speed=VELOCIDAD, lang="es")
    x = np.asarray(x, dtype=np.float64)
    idx = np.flatnonzero(np.abs(x) > 0.01)
    if len(idx):
        x = x[max(0, idx[0] - int(0.015 * vsr)) : idx[-1] + int(0.05 * vsr)]
    g = gcd(SR, vsr)
    return resample_poly(x, SR // g, vsr // g)


parts, tiempos, t = [np.zeros(int(LEAD * SR))], [], LEAD
for ln in guion:
    y = synth(ln.get("voz", ln["texto"]))
    d = len(y) / SR
    tiempos.append({"id": ln["id"], "texto": ln["texto"], "ini": round(t, 3), "fin": round(t + d, 3)})
    pausa = ln.get("pausa", 0.1)
    parts += [y, np.zeros(int(pausa * SR))]
    t += d + pausa

x = np.concatenate(parts)
# Limpieza: quita graves, realza presencia y comprime suave.
x = sosfilt(butter(2, 85, "high", fs=SR, output="sos"), x)
x = x + 0.3 * sosfilt(butter(2, [2200, 5500], "band", fs=SR, output="sos"), x)
x = np.tanh(x / (np.max(np.abs(x)) + 1e-9) * 1.6) / np.tanh(1.6) * 0.89
with wave.open(out_wav, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((x * 32767).astype("<i2").tobytes())
Path(out_json).write_text(
    json.dumps({"duracion": round(len(x) / SR, 3), "lineas": tiempos}, ensure_ascii=False, indent=1), encoding="utf-8"
)
print(f"voz: {out_wav} ({len(x) / SR:.2f} s)")
for ti in tiempos:
    print(f'{ti["ini"]:6.2f}-{ti["fin"]:6.2f}  {ti["texto"]}')
