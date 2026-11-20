"use client";

import { useState, useSyncExternalStore } from "react";
import { Icon } from "./icon";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Mode = "hidden" | "prompt" | "ios";

let deferred: InstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

// Se registra al cargar el módulo para no perder el evento si llega antes de montar.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    installed = true;
    emit();
  });
}

function getMode(): Mode {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (installed || standalone) return "hidden";
  if (deferred) return "prompt";
  const ua = navigator.userAgent;
  const iOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  return iOS ? "ios" : "hidden";
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function useInstallMode() {
  return useSyncExternalStore(subscribe, getMode, () => "hidden" as Mode);
}

async function runPrompt() {
  if (!deferred) return;
  const event = deferred;
  await event.prompt();
  await event.userChoice.catch(() => null);
  deferred = null;
  emit();
}

function IosSteps() {
  return (
    <ol className="space-y-1.5 text-sm text-muted">
      <li className="flex gap-2">
        <span className="font-bold text-sun">1.</span>
        <span>
          Toca <Icon name="share" className="mx-0.5 inline size-4 align-[-3px] text-cream" /> <b className="text-cream">Compartir</b> en
          Safari.
        </span>
      </li>
      <li className="flex gap-2">
        <span className="font-bold text-sun">2.</span>
        <span>
          Elige <b className="text-cream">Agregar a inicio</b>.
        </span>
      </li>
    </ol>
  );
}

export function InstallButton({ variant = "compact" }: { variant?: "compact" | "card" }) {
  const mode = useInstallMode();
  const [showIos, setShowIos] = useState(false);

  if (mode === "hidden") return null;

  if (variant === "card") {
    return (
      <div className="tile tile-glow p-6" style={{ ["--accent" as string]: "var(--color-mint)" }}>
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-mint/15 text-mint">
            <Icon name="download" className="size-6" />
          </span>
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-bold">Lleva Aurora Studios en tu celular</h3>
              <p className="mt-1 text-sm text-muted">
                Instala esta app en tu pantalla de inicio y vuelve a tu cotización cuando quieras, desde cualquier país.
              </p>
            </div>
            {mode === "prompt" ? (
              <button
                type="button"
                onClick={runPrompt}
                className="inline-flex items-center gap-2 rounded-full bg-mint px-5 py-2.5 text-sm font-bold text-ink"
              >
                <Icon name="download" className="size-4" />
                Instalar app
              </button>
            ) : (
              <IosSteps />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={mode === "prompt" ? runPrompt : () => setShowIos((v) => !v)}
        aria-expanded={mode === "ios" ? showIos : undefined}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-3.5 text-sm font-semibold text-cream transition-colors hover:bg-cream/5"
      >
        <Icon name="download" className="size-4 text-mint" />
        Instalar
      </button>
      {mode === "ios" && showIos && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-line-strong bg-ink-3 p-4 shadow-2xl">
          <p className="mb-2 text-sm font-bold">Instala la app en tu iPhone</p>
          <IosSteps />
        </div>
      )}
    </div>
  );
}
