"""Usa una narración grabada (en vez de la voz automática) y calcula los tiempos de los subtítulos.

Lee <episodio>/voz/mapa.json, que dice qué líneas de guion.json cubre cada audio. Dentro de cada audio
los cortes entre subtítulos se ubican en las pausas de la voz (o, si no hay pausa cerca, en proporción
al largo del texto). Escribe <episodio>/out/voz.wav y <episodio>/out/tiempos.json, igual que tts.py.

Uso: python3 scripts/voz_externa.py <episodio>
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
LEAD = 0.25
EPD = Path(sys.argv[1]).resolve()
guion = {l["id"]: l for l in json.loads((EPD / "guion.json").read_text(encoding="utf-8"))["lineas"]}
mapa = json.loads((EPD / "voz" / "mapa.json").read_text(encoding="utf-8"))["audios"]


def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype="<f4").astype(np.float64)


def frames_rms(x, win):
    n = len(x) // win
    return np.sqrt(np.mean(x[: n * win].reshape(n, win) ** 2, axis=1))


parts, tiempos, t = [np.zeros(int(LEAD * SR))], [], LEAD
for a in mapa:
    x = load(EPD / "voz" / a["archivo"])
    # recorta silencios del principio y del final
    pk = np.max(np.abs(x)) + 1e-9
    idx = np.flatnonzero(np.abs(x) > pk * 0.02)
    x = x[max(0, idx[0] - int(0.03 * SR)): idx[-1] + int(0.08 * SR)]
    d = len(x) / SR
    # pausas internas (≥ 0,12 s por debajo de -30 dB del pico)
    win = int(0.02 * SR)
    r = frames_rms(x, win)
    quiet = r < (np.max(r) * 0.04)
    pauses, k = [], 0
    while k < len(quiet):
        if quiet[k]:
            j = k
            while j < len(quiet) and quiet[j]:
                j += 1
            if (j - k) * 0.02 >= 0.12 and k > 0 and j < len(quiet):
                pauses.append((k * 0.02, j * 0.02))
            k = j
        else:
            k += 1
    ids = a["lineas"]
    w = np.array([len(guion[i].get("voz", guion[i]["texto"])) for i in ids], dtype=float)
    cum = np.cumsum(w) / w.sum()
    bounds, used = [], set()
    for c in cum[:-1]:
        target = c * d
        best = None
        for pi, (p0, p1) in enumerate(pauses):
            mid = (p0 + p1) / 2
            if pi in used or (bounds and mid <= bounds[-1][1]):
                continue
            if abs(mid - target) <= 0.7 and (best is None or abs(mid - target) < abs((pauses[best][0] + pauses[best][1]) / 2 - target)):
                best = pi
        if best is not None:
            used.add(best)
            bounds.append(pauses[best])
        else:
            bounds.append((target, target))
    starts = [0.0] + [b[1] for b in bounds]
    ends = [b[0] for b in bounds] + [d]
    for i, s0, e0 in zip(ids, starts, ends):
        tiempos.append({"id": i, "texto": guion[i]["texto"], "ini": round(t + s0, 3), "fin": round(t + e0, 3)})
    pausa = guion[ids[-1]].get("pausa", 0.2)
    parts += [x, np.zeros(int(pausa * SR))]
    t += d + pausa
    print(f'{a["archivo"]}: {d:.2f} s, pausas {[(round(p0, 2), round(p1, 2)) for p0, p1 in pauses]}')

x = np.concatenate(parts)
x = sosfilt(butter(2, 80, "high", fs=SR, output="sos"), x)
x = np.tanh(x / (np.max(np.abs(x)) + 1e-9) * 1.3) / np.tanh(1.3) * 0.89
with wave.open(str(EPD / "out" / "voz.wav"), "wb") as wv:
    wv.setnchannels(1)
    wv.setsampwidth(2)
    wv.setframerate(SR)
    wv.writeframes((x * 32767).astype("<i2").tobytes())
(EPD / "out" / "tiempos.json").write_text(json.dumps({"duracion": round(len(x) / SR, 3), "lineas": tiempos}, ensure_ascii=False, indent=1), encoding="utf-8")
print(f"voz: {EPD / 'out' / 'voz.wav'} ({len(x) / SR:.2f} s)")
for ti in tiempos:
    print(f'{ti["ini"]:6.2f}-{ti["fin"]:6.2f}  {ti["texto"]}')
