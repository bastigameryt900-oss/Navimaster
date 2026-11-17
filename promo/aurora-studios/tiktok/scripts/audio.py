"""Mezcla de audio del anuncio: música de fondo del gancho + efectos sincronizados + narración
+ música del video principal en el cierre.

Uso: python3 scripts/audio.py out/voz.wav out/tiempos.json ../out/musica.wav out/audio.wav
(../out/musica.wav se genera con ../scripts/music.py)
"""
import json
import sys
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

voz_p, tiempos_p, promo_p, out_p = sys.argv[1:5]
SR = 44100
rng = np.random.default_rng(11)
TI = json.load(open(tiempos_p, encoding="utf-8"))
L = {l["id"]: l for l in TI["lineas"]}
DUR = TI["duracion"]
N = int(DUR * SR) + SR
# Mismos cortes que hook.html
T = dict(A=0, B=L["h3"]["ini"] - 0.1, C=L["h5"]["ini"] - 0.15, C2=L["h7"]["ini"] - 0.05, D=L["h8"]["ini"] - 0.15,
         E=L["h11"]["ini"] - 0.1, F=L["h15"]["ini"] - 0.15, END=L["p1"]["ini"] - 0.2)


def rd(p):
    w = wave.open(p)
    x = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(np.float64) / 32768
    if w.getnchannels() == 2:
        x = x.reshape(-1, 2).mean(axis=1)
    assert w.getframerate() == SR
    return x


def tt(d):
    return np.arange(int(d * SR)) / SR


def flt(x, kind, f):
    return sosfilt(butter(2, f, kind, fs=SR, output="sos"), x)


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


MUS = np.zeros(N)
SFX = np.zeros(N)


def add(buf, sig, t0, g=1.0):
    i = int(t0 * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    buf[i: i + len(sig)] += sig * g


# ---------------- música del gancho (La menor, 100 BPM) ----------------
BEAT = 0.6
CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
ROOT = [45, 41, 48, 43]


def pad(notes, d):
    t = tt(d)
    x = sum(np.sin(2 * np.pi * hz(m) * t) + 0.3 * np.sin(2 * np.pi * hz(m) * 2.003 * t) for m in notes) / len(notes)
    return x * np.minimum(1, t / 0.5) * np.minimum(1, (d - t) / 0.5)


def pluck(m, d=0.5):
    t = tt(d)
    f = hz(m)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t * 9) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 14)
    return x * np.minimum(1, t / 0.003)


def kick():
    t = tt(0.35)
    f = 48 + 80 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)


def hat():
    t = tt(0.05)
    return flt(rng.standard_normal(len(t)), "high", 7500) * np.exp(-t * 80) * 0.4


bar = 4 * BEAT
nb = int(np.ceil(T["END"] / bar)) + 1
for b in range(nb):
    t0 = b * bar
    if t0 >= T["END"]:
        break
    k = b % 4
    add(MUS, pad(CH[k], bar + 0.5), t0, 0.10)
    for e in range(8):
        te = t0 + e * BEAT / 2
        if te >= T["F"]:
            break
        m = CH[k][[0, 1, 2, 1, 0, 2, 1, 2][e]] + 12
        add(MUS, pluck(m), te, 0.10 if te < T["E"] else 0.13)
        if T["E"] <= te < T["F"]:  # energía dentro de la fibra
            add(MUS, pluck(m + 12, 0.25), te + BEAT / 4, 0.06)
    for q in range(4):
        tq = t0 + q * BEAT
        if tq < T["F"]:
            add(MUS, np.sin(2 * np.pi * hz(ROOT[k]) * tt(0.5)) * np.exp(-tt(0.5) * 5), tq, 0.16)
        if T["E"] <= tq < T["F"]:
            add(MUS, kick(), tq, 0.45)
            add(MUS, hat(), tq + BEAT / 2, 0.5)

# bajo el agua: filtro pasa bajos sobre la música
env = np.zeros(N)
i0, i1 = int(T["C"] * SR), int(T["D"] * SR)
env[i0:i1] = 1
env = np.convolve(env, np.ones(int(0.25 * SR)) / int(0.25 * SR), mode="same")
MUS = MUS * (1 - env) + flt(MUS, "low", 500) * env

# tensión del tiburón: dron grave + latidos que se aceleran
dF = T["END"] - T["F"]
t = tt(dF)
drone = (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 58.3 * t)) * np.minimum(1, t / 0.4)
add(MUS, drone, T["F"], 0.22)
tb = L["h16"]["ini"] + 0.75  # mordida
beat_t = T["F"] + 0.1
gap = 0.55
while beat_t < tb - 0.05:
    add(MUS, kick(), beat_t, 0.5)
    add(MUS, kick(), beat_t + 0.16, 0.3)
    beat_t += gap
    gap = max(0.28, gap * 0.85)

# riser hacia "Entregado"
ok_t = L["h14"]["ini"] + 1.25
d = ok_t - L["h13"]["ini"]
t = tt(d)
rs = flt(rng.standard_normal(len(t)), "band", [800, 6000]) * (t / d) ** 2 * 0.25
rs += np.sin(2 * np.pi * np.cumsum(300 + 900 * (t / d) ** 2) / SR) * (t / d) ** 2 * 0.08
add(MUS, rs, L["h13"]["ini"])

# ---------------- efectos ----------------
def whoosh(d=0.5, lo=400, hi=5000):
    t = tt(d)
    return flt(rng.standard_normal(len(t)), "band", [lo, hi]) * np.sin(np.pi * t / d) ** 2


def blip(f0, f1, d=0.12):
    t = tt(d)
    return np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f1, len(t))) / SR) * np.exp(-t * 18)


def bubble():
    d = 0.08 + rng.random() * 0.06
    t = tt(d)
    f = 500 + rng.random() * 700
    return np.sin(2 * np.pi * np.cumsum(f * (1 + 2.5 * t / d)) / SR) * np.exp(-t * 35)


def splash():
    t = tt(1.2)
    return flt(rng.standard_normal(len(t)), "low", 2500) * np.exp(-t * 4) * 0.8


def zap(d=0.45):
    t = tt(d)
    saw = 2 * ((t * (180 + 900 * t)) % 1) - 1
    return (saw * 0.4 + flt(rng.standard_normal(len(t)), "high", 3000) * 0.5) * np.exp(-t * 6) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 37 * t)))


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
        sq = np.sign(np.sin(2 * np.pi * 150 * t)) * np.exp(-t * 4)
        out[int(off * SR): int(off * SR) + len(t)] += flt(sq, "low", 2000)
    return out


add(SFX, blip(700, 1400), 1.25, 0.35)                         # mensaje enviado
add(SFX, whoosh(1.1, 300, 4000), 2.2, 0.5)                     # sale volando
add(SFX, whoosh(0.4), T["B"] - 0.15, 0.3)
add(SFX, buzz(), L["h4"]["ini"], 0.35)                          # X roja
add(SFX, whoosh(0.7, 200, 3000), T["C"] - 0.6, 0.45)           # cae al mar
add(SFX, splash(), T["C"] + 0.02, 0.5)
for k in range(28):
    add(SFX, bubble(), T["C"] + 0.1 + rng.random() * 2.0, 0.18)
add(SFX, zap(0.6), T["C"] + 2.2, 0.3)                           # entra al cable
add(SFX, whoosh(0.35), T["C2"] - 0.1, 0.25)
add(SFX, whoosh(0.35), T["D"] - 0.1, 0.25)
add(SFX, blip(600, 900), T["D"] + 0.3, 0.3)                     # marcador Valparaíso
t9, t10 = L["h9"]["ini"], L["h10"]["ini"]
t = tt(t10 - t9)
add(SFX, np.sin(2 * np.pi * np.cumsum(220 + 440 * t / t[-1]) / SR) * 0.15 * np.sin(np.pi * t / t[-1]), t9)  # se dibuja el cable
add(SFX, blip(600, 900), t10 - 0.3, 0.3)                        # marcador Los Ángeles
tk = t10
for k in range(18):                                            # contador de km
    add(SFX, blip(2200, 2000, 0.03), tk, 0.12)
    tk += 0.03 + 0.06 * (k / 18) ** 2
add(SFX, whoosh(0.8, 500, 8000), T["E"] - 0.2, 0.4)            # entra a la fibra
t = tt(T["F"] - T["E"])
add(SFX, flt(rng.standard_normal(len(t)), "band", [1500, 9000]) * 0.05 * np.minimum(1, t / 0.5) * np.minimum(1, (t[-1] - t) / 0.3), T["E"])
add(SFX, ding(), ok_t, 0.5)                                     # entregado
add(SFX, whoosh(0.4), T["F"] - 0.15, 0.3)
add(SFX, boom(), tb, 0.6)                                       # mordida
add(SFX, zap(0.9), tb, 0.55)
add(SFX, flt(rng.standard_normal(int(0.25 * SR)), "band", [300, 3000]) * np.exp(-tt(0.25) * 12), tb, 0.6)
for k in range(9):                                             # glitch final
    tg = T["END"] - 0.85 + k * 0.09 + rng.random() * 0.03
    add(SFX, flt(rng.standard_normal(int(0.05 * SR)), "high", 1500) * 0.5, tg, 0.4)

# ---------------- cierre: música del video principal desde su "drop" (26 s) ----------------
promo = rd(promo_p)
start_src = 26.0 - 0.02
seg_len = N - int(T["END"] * SR)
piece = promo[int(start_src * SR): int(start_src * SR) + seg_len]
fade_in = np.minimum(1, np.arange(len(piece)) / (0.02 * SR))
add(MUS, piece * fade_in, T["END"], 0.45)

# ---------------- voz y mezcla ----------------
voz = rd(voz_p)
VOZ = np.zeros(N)
VOZ[: len(voz)] = voz
# compresión lateral: la música baja cuando habla el narrador
e = np.abs(VOZ)
e = np.convolve(e, np.ones(int(0.05 * SR)) / int(0.05 * SR), mode="same")
duck = 1 - 0.55 * np.clip(e / 0.08, 0, 1)
duck = np.convolve(duck, np.ones(int(0.12 * SR)) / int(0.12 * SR), mode="same")
mix = MUS * duck * 0.9 + SFX * 0.9 + VOZ * 1.0
# reverb corta para pegar música y efectos
ir = rng.standard_normal(int(0.9 * SR)) * np.exp(-tt(0.9) * 6)
ir /= np.sqrt(np.sum(ir ** 2))
mix += fftconvolve((MUS + SFX) * 0.15, ir)[:N] * 0.4
mix = flt(mix, "high", 30)
end = int((DUR - 0.6) * SR)
mix[end:] *= np.linspace(1, 0, N - end) ** 2
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 1.4
mix = np.tanh(mix) / np.tanh(1.4) * 0.9
mix = mix[: int(DUR * SR)]
st = np.stack([mix, mix], axis=1)
with wave.open(out_p, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype("<i2").tobytes())
print("audio:", out_p, f"{DUR:.2f} s")
