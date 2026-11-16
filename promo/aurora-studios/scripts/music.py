"""Banda sonora original del video (sintetizada, sin samples externos).

120 BPM, 58 s, en Fa mayor (I–V–vi–IV). Los golpes caen en los cortes del video:
4 s (gancho), 8 s (servicios), 24 s (apps y juegos), 26 s (nuevos servicios), 50 s (cierre).

Uso: python3 scripts/music.py out/musica.wav     (requiere numpy y scipy)
"""
import sys
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, lfilter, sosfilt

SR = 44100
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
DUR = 58.5
N = int(DUR * SR)
rng = np.random.default_rng(7)

L = np.zeros(N)
R = np.zeros(N)
SEND = np.zeros(N)  # bus de reverb (mono)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def add(sig, t0, gain=1.0, pan=0.0, rev=0.0):
    i0 = int(round(t0 * SR))
    if i0 >= N:
        return
    sig = sig[: N - i0]
    gl, gr = np.sqrt((1 - pan) / 2) * 1.414, np.sqrt((1 + pan) / 2) * 1.414
    L[i0 : i0 + len(sig)] += sig * gain * gl
    R[i0 : i0 + len(sig)] += sig * gain * gr
    if rev:
        SEND[i0 : i0 + len(sig)] += sig * gain * rev


def tt(d):
    return np.arange(int(d * SR)) / SR


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def saw(f, t, phase=0.0):
    return 2 * ((f * t + phase) % 1) - 1


# ---------------- armonía ----------------
PROG = {  # acordes por compás
    "F": dict(pad=[53, 57, 60, 65], bass=41, arp=[65, 69, 72, 77]),
    "C": dict(pad=[52, 55, 60, 64], bass=36, arp=[64, 67, 72, 76]),
    "Dm": dict(pad=[50, 53, 57, 62], bass=38, arp=[62, 65, 69, 74]),
    "Bb": dict(pad=[50, 53, 58, 62], bass=34, arp=[62, 65, 70, 74]),
}
ORDER = ["F", "C", "Dm", "Bb"]


def chord_at(bar):
    if bar >= 28:
        return PROG["F"]  # acorde final
    return PROG[ORDER[(bar - 2) % 4]]  # el gancho (compás 2) cae en Fa


NBARS = int(np.ceil(DUR / BAR))
KICKS = []  # tiempos de bombo, para el "sidechain"


def section(t):
    if t < 4:
        return "intro"
    if t < 8:
        return "hook"
    if t < 24:
        return "a"
    if t < 26:
        return "break"
    if t < 42:
        return "b"
    if t < 50:
        return "c"
    if t < 56:
        return "outro"
    return "end"


# ---------------- instrumentos ----------------
def pad_note(m, d, bright):
    t = tt(d)
    f = hz(m)
    x = sum(saw(f * (1 + det), t, ph) for det, ph in [(-0.006, 0.1), (0, 0.5), (0.0065, 0.8)]) / 3
    x = lp(x, 400 + 2600 * bright)
    a = np.minimum(1, t / 0.35) * np.minimum(1, (d - t) / 0.4)
    return x * a


def pluck(m, d=0.22):
    t = tt(d)
    f = hz(m)
    x = 0.6 * saw(f, t) + 0.4 * np.sign(np.sin(2 * np.pi * f * t))
    env = np.exp(-t * 16)
    x = lp(x * env, 3800)
    return x * np.minimum(1, t / 0.004)


def bass_note(m, d):
    t = tt(d)
    f = hz(m)
    x = np.sin(2 * np.pi * f * t) + 0.35 * lp(saw(f, t), 300)
    env = np.minimum(1, t / 0.01) * np.exp(-t * 3) * np.minimum(1, (d - t) / 0.03)
    return x * env


def kick():
    t = tt(0.42)
    f = 46 + 90 * np.exp(-t * 32)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 6.5)
    click = hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 220) * 0.35
    return np.tanh((x + click) * 1.6)


def clap():
    t = tt(0.32)
    n = bp(rng.standard_normal(len(t)), 900, 5200)
    env = np.zeros_like(t)
    for off in (0, 0.011, 0.022):
        env += (t >= off) * np.exp(-np.maximum(0, t - off) * 70)
    env += (t >= 0.03) * np.exp(-np.maximum(0, t - 0.03) * 14) * 0.6
    return n * env * 0.8


def hat(open_=False):
    t = tt(0.25 if open_ else 0.07)
    n = hp(rng.standard_normal(len(t)), 7000)
    return n * np.exp(-t * (14 if open_ else 70)) * 0.5


def crash(d=2.6):
    t = tt(d)
    n = hp(rng.standard_normal(len(t)), 4500)
    metal = sum(np.sin(2 * np.pi * f * t) for f in (3150, 4425, 5810, 7230)) * 0.05
    return (n * 0.6 + metal) * np.exp(-t * 2.2)


def boom(d=2.2):
    t = tt(d)
    f = 38 + 70 * np.exp(-t * 9)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4)
    return np.tanh(x * 1.4)


def riser(d):
    t = tt(d)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(n)
    blocks = 40
    zi = None
    for k in range(blocks):
        a, b = k * len(n) // blocks, (k + 1) * len(n) // blocks
        fc = 300 * (40 ** (k / blocks))
        bb, aa = butter(2, min(fc, 16000), "low", fs=SR)
        if zi is None:
            zi = np.zeros(max(len(aa), len(bb)) - 1)
        out[a:b], zi = lfilter(bb, aa, n[a:b], zi=zi)
    sweep = np.sin(2 * np.pi * np.cumsum(200 + 1400 * (t / d) ** 2) / SR) * 0.15
    return (out + sweep) * (t / d) ** 2.2


def whoosh(d=0.55):
    t = tt(d)
    n = rng.standard_normal(len(t))
    x = bp(n, 500, 6000)
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
    return x * env * 0.5


def shimmer():
    out = np.zeros(int(2.2 * SR))
    for k, m in enumerate([77, 81, 84, 89, 93]):
        t = tt(2.2 - k * 0.07)
        f = hz(m)
        x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.01 * t)) * np.exp(-t * 2.5)
        i0 = int(k * 0.07 * SR)
        out[i0 : i0 + len(x)] += x * 0.3
    return out


# ---------------- arreglo ----------------
for b in range(NBARS):
    t0 = b * BAR
    if t0 >= DUR:
        break
    ch = chord_at(b)
    sec = section(t0)
    # Pad (siempre, más brillante cuando hay energía)
    bright = {"intro": 0.15 + 0.2 * b, "hook": 0.45, "a": 0.55, "break": 0.3, "b": 0.75, "c": 0.6, "outro": 0.55, "end": 0.4}[sec]
    d = BAR + 0.4 if sec != "end" else DUR - t0
    for k, m in enumerate(ch["pad"]):
        add(pad_note(m, d, bright), t0, 0.07, pan=[-0.5, 0.3, -0.2, 0.5][k], rev=0.5)
    # Bajo en corcheas a contratiempo (hook en adelante, salvo el quiebre)
    if sec in ("hook", "a", "b", "c", "outro"):
        for e in range(8):
            if e % 2 == 1 or sec in ("b",):
                add(bass_note(ch["bass"] + (12 if e == 7 and sec == "b" else 0), BEAT / 2 * 0.95), t0 + e * BEAT / 2, 0.30)
    # Arpegio en semicorcheas
    if sec in ("a", "b", "c", "break", "outro"):
        pat = [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 2, 3, 1, 2]
        g = {"a": 0.075, "b": 0.11, "c": 0.08, "break": 0.06, "outro": 0.07}[sec]
        for s in range(16):
            if sec == "a" and s % 2 == 1 and b % 2 == 0:
                continue
            m = ch["arp"][pat[s]]
            add(pluck(m), t0 + s * BEAT / 4, g, pan=(-0.45 if s % 2 else 0.45), rev=0.35)
    # Batería
    for q in range(4):
        tb = t0 + q * BEAT
        if sec == "hook" and q in (0, 2) or sec in ("a", "b", "c", "outro"):
            add(kick(), tb, 0.85)
            KICKS.append(tb)
        if sec in ("a", "b", "c", "outro") and q in (1, 3):
            add(clap(), tb, 0.5, rev=0.25)
        if sec in ("hook", "a", "c", "outro"):
            add(hat(open_=(sec != "hook" and q == 3)), tb + BEAT / 2, 0.32, pan=0.3)
        if sec == "b":
            for s in range(4):
                add(hat(open_=(s == 2)), tb + s * BEAT / 4, 0.26 if s % 2 else 0.18, pan=0.3 if s % 2 else -0.2)

# Redobles de preparación (antes de 24, 26 y 50)
for start, end in [(23.0, 24.0), (25.0, 26.0), (49.0, 50.0)]:
    n = int((end - start) / (BEAT / 4))
    for k in range(n):
        tk = start + k * BEAT / 4
        add(clap(), tk, 0.12 + 0.35 * k / n, pan=0.1)

# Efectos sincronizados con la imagen
add(boom(), 0.0, 0.35, rev=0.3)
add(shimmer(), 1.0, 0.6, pan=0.15, rev=0.8)
add(riser(2.0), 2.0, 0.22)
for tc in (4.0, 8.0, 26.0, 50.0):
    add(crash(), tc, 0.33, rev=0.4)
    add(boom(), tc, 0.55)
add(riser(1.6), 6.4, 0.16)
add(riser(1.9), 24.1, 0.22)
add(riser(1.0), 49.0, 0.18)
add(crash(3.5), 56.0, 0.28, rev=0.5)
add(boom(2.5), 56.0, 0.45)
add(shimmer(), 56.0, 0.5, pan=-0.1, rev=0.8)
for tw in (3.42, 7.58, 23.72, 25.66, 49.62):
    add(whoosh(), tw - 0.12, 0.22, pan=0.0, rev=0.2)
# Pequeños "ticks" en los cambios de escena de servicios
for tc in (12.0, 16.0, 20.0, 29.0, 32.0, 35.0, 38.0, 42.0, 46.0):
    add(whoosh(0.35), tc - 0.25, 0.14)

# ---------------- mezcla ----------------
# Sidechain: el bombo "empuja" pad y arpegio para dar groove.
duck = np.ones(N)
dk = 1 - 0.55 * np.exp(-tt(0.4) * 9)
for tk in KICKS:
    i0 = int(tk * SR)
    seg = dk[: max(0, min(len(dk), N - i0))]
    duck[i0 : i0 + len(seg)] = np.minimum(duck[i0 : i0 + len(seg)], seg)

ir_t = tt(2.2)
ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2)
ir = lp(ir, 6000)
ir /= np.sqrt(np.sum(ir ** 2))
wet = fftconvolve(lp(hp(SEND, 200), 8000), ir)[:N] * 0.35
L = (L + wet * 1.0) * (0.55 + 0.45 * duck)
R = (R + np.roll(wet, 331) * 1.0) * (0.55 + 0.45 * duck)

mix = np.stack([L, R], axis=1)
mix = hp(mix.T, 28).T
# Fundido final
fade = np.ones(N)
fs = int(56.6 * SR)
fade[fs:] = np.linspace(1, 0, N - fs) ** 1.5
mix *= fade[:, None]
# Limitador suave
mix = mix / (np.max(np.abs(mix)) + 1e-9) * 1.6
mix = np.tanh(mix) / np.tanh(1.6)
mix *= 10 ** (-1.0 / 20)

out = sys.argv[1] if len(sys.argv) > 1 else "out/musica.wav"
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("audio:", out, f"{DUR:.1f} s")
