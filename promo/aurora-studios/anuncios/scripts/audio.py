"""Mezcla de audio de un episodio: música de fondo del gancho + efectos + narración + música del video
principal en el cierre. Todo se define en <episodio>/episodio.json.

Uso: python3 scripts/audio.py <episodio>        (requiere ../out/musica.wav del video principal)
"""
import json
import re
import sys
import wave
from pathlib import Path

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

EPD = Path(sys.argv[1]).resolve()
ROOT = Path(__file__).resolve().parent.parent
SR = 44100
rng = np.random.default_rng(11)
TI = json.loads((EPD / "out/tiempos.json").read_text(encoding="utf-8"))
EP = json.loads((EPD / "episodio.json").read_text(encoding="utf-8"))
L = {l["id"]: l for l in TI["lineas"]}
DUR = TI["duracion"]
N = int(DUR * SR) + SR


def tx(e):
    if isinstance(e, (int, float)):
        return float(e)
    m = re.match(r"^([a-z]\d+)\.(ini|fin)\s*([+-]\s*[\d.]+)?$", e.strip())
    if not m:
        return float(e)
    return L[m.group(1)][m.group(2)] + (float(m.group(3).replace(" ", "")) if m.group(3) else 0)


CUTS = sorted(tx(v) for v in EP["escenas"].values())
END = tx(EP["fin_gancho"])


def rd(p):
    w = wave.open(str(p))
    x = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(np.float64) / 32768
    if w.getnchannels() == 2:
        x = x.reshape(-1, 2).mean(axis=1)
    return x


def tt(d):
    return np.arange(int(d * SR)) / SR


def flt(x, kind, f):
    return sosfilt(butter(2, f, kind, fs=SR, output="sos"), x)


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


MUS, SFX = np.zeros(N), np.zeros(N)


def add(buf, sig, t0, g=1.0):
    i = int(t0 * SR)
    if i >= N or i < 0:
        return
    sig = sig[: N - i]
    buf[i: i + len(sig)] += sig * g


def rngs(key):
    return [(tx(a), tx(b)) for a, b in EP.get("musica", {}).get(key, [])]


def inr(t, rs):
    return any(a <= t < b for a, b in rs)


# ---------------- música del gancho ----------------
M = EP.get("musica", {})
BEAT = 60 / M.get("bpm", 100)
CH = M.get("acordes", [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]])
ROOTS = M.get("raices", [45, 41, 48, 43])
ENER, TENS, AGUA, SIL = rngs("energia"), rngs("tension"), rngs("pasabajos"), rngs("silencio")


def pad(notes, d):
    t = tt(d)
    x = sum(np.sin(2 * np.pi * hz(m) * t) + 0.3 * np.sin(2 * np.pi * hz(m) * 2.003 * t) for m in notes) / len(notes)
    return x * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.5)


def pluck(m, d=0.5):
    t = tt(d)
    f = hz(m)
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 9) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 14)) * np.minimum(1, t / 0.003)


def kick():
    t = tt(0.35)
    return np.sin(2 * np.pi * np.cumsum(48 + 80 * np.exp(-t * 30)) / SR) * np.exp(-t * 8)


def hat():
    t = tt(0.05)
    return flt(rng.standard_normal(len(t)), "high", 7500) * np.exp(-t * 80) * 0.4


bar = 4 * BEAT
b = 0
while b * bar < END:
    t0 = b * bar
    k = b % len(CH)
    if not inr(t0, TENS) and not inr(t0, SIL):
        add(MUS, pad(CH[k], bar + 0.5), t0, 0.10)
    for e in range(8):
        te = t0 + e * BEAT / 2
        if te >= END or inr(te, TENS) or inr(te, SIL):
            continue
        m = CH[k][[0, 1, 2, 1, 0, 2, 1, 2][e]] + 12
        add(MUS, pluck(m), te, 0.13 if inr(te, ENER) else 0.10)
        if inr(te, ENER):
            add(MUS, pluck(m + 12, 0.25), te + BEAT / 4, 0.06)
    for q in range(4):
        tq = t0 + q * BEAT
        if tq >= END or inr(tq, TENS) or inr(tq, SIL):
            continue
        add(MUS, np.sin(2 * np.pi * hz(ROOTS[k]) * tt(0.5)) * np.exp(-tt(0.5) * 5), tq, 0.16)
        if inr(tq, ENER):
            add(MUS, kick(), tq, 0.45)
            add(MUS, hat(), tq + BEAT / 2, 0.5)
    b += 1

for a, z in AGUA:  # filtro pasa bajos en tramos
    env = np.zeros(N)
    env[int(a * SR): int(z * SR)] = 1
    w = int(0.25 * SR)
    env = np.convolve(env, np.ones(w) / w, mode="same")
    MUS = MUS * (1 - env) + flt(MUS, "low", 500) * env

for a, z in TENS:  # dron grave + latidos que se aceleran
    t = tt(z - a)
    add(MUS, (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 58.3 * t)) * np.minimum(1, t / 0.4) * np.minimum(1, (t[-1] - t) / 0.2), a, 0.22)
    bt, gap = a + 0.1, 0.55
    while bt < z - 0.1:
        add(MUS, kick(), bt, 0.5)
        add(MUS, kick(), bt + 0.16, 0.3)
        bt += gap
        gap = max(0.28, gap * 0.85)


# ---------------- efectos ----------------
def whoosh(d=0.5, lo=400, hi=5000):
    t = tt(d)
    return flt(rng.standard_normal(len(t)), "band", [lo, hi]) * np.sin(np.pi * t / d) ** 2


def blip(f0=700, f1=1400, d=0.12):
    t = tt(d)
    return np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f1, len(t))) / SR) * np.exp(-t * 18)


def boom(d=1.5):
    t = tt(d)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(40 + 60 * np.exp(-t * 8)) / SR) * np.exp(-t * 3) * 1.5)


def ding():
    t = tt(1.2)
    return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(1318.5, 4), (1975.5, 5), (2637, 7)]) * 0.35


def buzz():
    out = np.zeros(int(0.5 * SR))
    for off in (0, 0.22):
        t = tt(0.17)
        out[int(off * SR): int(off * SR) + len(t)] += flt(np.sign(np.sin(2 * np.pi * 150 * t)) * np.exp(-t * 4), "low", 2000)
    return out


def zap(d=0.45):
    t = tt(d)
    saw = 2 * ((t * (180 + 900 * t)) % 1) - 1
    return (saw * 0.4 + flt(rng.standard_normal(len(t)), "high", 3000) * 0.5) * np.exp(-t * 6)


def tick():
    t = tt(0.03)
    return np.sin(2 * np.pi * 2100 * t) * np.exp(-t * 120)


def ticks(d=1.2, n=16):
    out = np.zeros(int(d * SR) + SR // 10)
    for k in range(n):
        tk = d * (1 - (1 - k / n) ** 1.6)
        i = int(tk * SR)
        s = tick()
        out[i: i + len(s)] += s
    return out


def typing(d=1.0, rate=11):
    out = np.zeros(int(d * SR) + SR // 10)
    tk = 0.0
    while tk < d:
        n = int(0.02 * SR)
        s = flt(rng.standard_normal(n), "band", [1500, 6000]) * np.exp(-tt(0.02) * 220) * (0.6 + 0.4 * rng.random())
        i = int(tk * SR)
        out[i: i + n] += s
        tk += (0.6 + 0.8 * rng.random()) / rate
    return out


def riser(d=1.5):
    t = tt(d)
    x = flt(rng.standard_normal(len(t)), "band", [800, 6000]) * (t / d) ** 2 * 0.25
    return x + np.sin(2 * np.pi * np.cumsum(300 + 900 * (t / d) ** 2) / SR) * (t / d) ** 2 * 0.08


def glitch(d=0.8):
    out = np.zeros(int(d * SR) + SR // 10)
    for k in range(9):
        i = int((k * d / 9 + rng.random() * 0.03) * SR)
        n = int(0.05 * SR)
        out[i: i + n] += flt(rng.standard_normal(n), "high", 1500) * 0.5
    return out


def beep(f=880, d=0.12):
    t = tt(d)
    return np.sign(np.sin(2 * np.pi * f * t)) * np.minimum(1, (d - t) / 0.01) * 0.3


def hum(d=1.0, f=60):
    t = tt(d)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t) + 0.2 * flt(rng.standard_normal(len(t)), "band", [200, 800])) * np.minimum(1, t / 0.2) * np.minimum(1, (d - t) / 0.2)


def door():
    t = tt(0.5)
    return np.tanh(np.sin(2 * np.pi * np.cumsum(90 + 40 * np.exp(-t * 20)) / SR) * np.exp(-t * 10) * 2) + flt(rng.standard_normal(len(t)), "low", 1200) * np.exp(-t * 25) * 0.6


def pop():
    return blip(500, 1200, 0.08)


def bounce():
    return blip(900, 600, 0.07)


def crowd(d=1.5):
    t = tt(d)
    return flt(rng.standard_normal(len(t)), "band", [300, 2500]) * 0.25 * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.4)


FX = dict(whoosh=whoosh, blip=blip, boom=boom, ding=ding, buzz=buzz, zap=zap, tick=tick, ticks=ticks, typing=typing,
          riser=riser, glitch=glitch, beep=beep, hum=hum, door=door, pop=pop, bounce=bounce, crowd=crowd)
for c in CUTS:
    if c > 0.1:
        add(SFX, whoosh(0.4), c - 0.15, 0.25)
for e in EP.get("sfx", []):
    fn = FX[e["tipo"]]
    sig = fn(**e.get("args", {}))
    times = e["t"] if isinstance(e["t"], list) else [e["t"]]
    for t0 in times:
        add(SFX, sig, tx(t0), e.get("g", 0.4))

# ---------------- cierre: música del video principal desde su "drop" (26 s) ----------------
promo = rd(ROOT.parent / "out" / "musica.wav")
src = 26.0 - 0.02
piece = promo[int(src * SR): int(src * SR) + (N - int(END * SR))]
add(MUS, piece * np.minimum(1, np.arange(len(piece)) / (0.02 * SR)), END, 0.45)
add(SFX, boom(), END, 0.3)

# ---------------- voz y mezcla ----------------
voz = rd(EPD / "out/voz.wav")
VOZ = np.zeros(N)
VOZ[: len(voz)] = voz
e = np.convolve(np.abs(VOZ), np.ones(int(0.05 * SR)) / int(0.05 * SR), mode="same")
duck = np.convolve(1 - 0.55 * np.clip(e / 0.08, 0, 1), np.ones(int(0.12 * SR)) / int(0.12 * SR), mode="same")
mix = MUS * duck * 0.9 + SFX * 0.9 + VOZ
ir = rng.standard_normal(int(0.9 * SR)) * np.exp(-tt(0.9) * 6)
ir /= np.sqrt(np.sum(ir ** 2))
mix += fftconvolve((MUS + SFX) * 0.15, ir)[:N] * 0.4
mix = flt(mix, "high", 30)
end = int((DUR - 0.6) * SR)
mix[end:] *= np.linspace(1, 0, N - end) ** 2
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 1.4
mix = (np.tanh(mix) / np.tanh(1.4) * 0.9)[: int(DUR * SR)]
with wave.open(str(EPD / "out/audio.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.stack([mix, mix], axis=1) * 32767).astype("<i2").tobytes())
print("audio:", EPD / "out/audio.wav", f"{DUR:.2f} s")
