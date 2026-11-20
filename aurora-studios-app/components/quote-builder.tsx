"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import { Field, Select, field } from "./form";
import { Icon } from "./icon";
import {
  clearQuoteDetails,
  quote,
  setQuoteDetail,
  useQuoteDetails,
  useQuoteItems,
  type QuoteDetails,
  type QuoteItem,
} from "@/lib/quote";
import { COUNTRIES, SERVICES, SITE, formatCLP, getService, whatsappLink } from "@/lib/site";

const DEADLINES = ["Lo antes posible", "En 2 a 4 semanas", "En 1 a 2 meses", "Sin apuro"];
const CURRENCIES = ["Pesos chilenos (CLP)", "Dólares (USD)", "La moneda de mi país"];

type Line = { name: string; option: string | null; price: number | null };

function toLines(items: QuoteItem[]): Line[] {
  return items.flatMap((i) => {
    const s = getService(i.serviceId);
    if (!s) return [];
    const o = s.options.find((x) => x.id === i.optionId);
    return [{ name: s.name, option: o?.label ?? null, price: o?.price ?? null }];
  });
}

function buildMessage(lines: Line[], d: QuoteDetails) {
  const subtotal = lines.reduce((sum, l) => sum + (l.price ?? 0), 0);
  const pending = lines.some((l) => l.price === null);
  const out = ["Hola Aurora Studios, quiero cotizar un proyecto.", ""];
  if (lines.length) {
    out.push("Servicios:");
    for (const l of lines) {
      out.push(`• ${l.name}${l.option ? ` (${l.option})` : ""}: ${l.price !== null ? formatCLP(l.price) : "a cotización"}`);
    }
    if (subtotal > 0) out.push("", `Subtotal referencial: ${formatCLP(subtotal)} CLP${pending ? " + servicios a cotización" : ""}`);
    out.push("");
  }
  const fields: [string, string][] = [
    ["Nombre", d.name],
    ["País", d.country],
    ["Negocio o proyecto", d.business],
    ["Plazo", d.deadline],
    ["Moneda preferida", d.currency],
    ["Idea", d.idea],
  ];
  for (const [k, v] of fields) if (v.trim()) out.push(`${k}: ${v.trim()}`);
  out.push("", `(Enviado desde la app de ${SITE.domain})`);
  return out.join("\n");
}

function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="tile p-5 sm:p-7" aria-labelledby={`paso-${n}`}>
      <h2 id={`paso-${n}`} className="flex items-center gap-3 text-lg font-bold">
        <span className="grid size-8 place-items-center rounded-full bg-sun text-sm font-extrabold text-ink">{n}</span>
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function AddChips({ exclude }: { exclude: Set<string> }) {
  const rest = SERVICES.filter((s) => !exclude.has(s.id));
  if (!rest.length) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {rest.map((s) => (
        <li key={s.id}>
          <button
            type="button"
            onClick={() => quote.add(s.id)}
            className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:border-line-strong hover:text-cream"
          >
            <span style={{ color: s.accent }}>
              <Icon name={s.icon} className="size-4" />
            </span>
            {s.name}
            <Icon name="plus" className="size-3.5" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function QuoteBuilder() {
  const items = useQuoteItems();
  const details = useQuoteDetails();
  const [copied, setCopied] = useState(false);

  const lines = toLines(items);
  const subtotal = lines.reduce((sum, l) => sum + (l.price ?? 0), 0);
  const pending = lines.filter((l) => l.price === null).length;
  const canSend = lines.length > 0 || details.idea.trim().length > 0;
  const message = buildMessage(lines, details);
  const inQuote = new Set(items.map((i) => i.serviceId));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    quote.clear();
    clearQuoteDetails();
  };

  const bind = (k: keyof QuoteDetails) => ({
    value: details[k],
    onChange: (e: { target: { value: string } }) => setQuoteDetail(k, e.target.value),
  });

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px] lg:items-start">
      <div className="space-y-5">
        <Step n="1" title="Servicios">
          {items.length === 0 ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-dashed border-line-strong p-6 text-center">
                <Icon name="clipboard-list" className="mx-auto size-8 text-faint" />
                <p className="mt-3 font-semibold">Tu cotización está vacía</p>
                <p className="mt-1 text-sm text-muted">
                  Agrega servicios aquí abajo o desde{" "}
                  <Link href="/servicios" className="font-semibold text-sun underline-offset-4 hover:underline">
                    Servicios
                  </Link>
                  . También puedes solo contarnos tu idea.
                </p>
              </div>
              <AddChips exclude={inQuote} />
            </div>
          ) : (
            <div className="space-y-5">
              <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
                {items.map((i) => {
                  const s = getService(i.serviceId);
                  if (!s) return null;
                  return (
                    <li key={s.id} className="flex flex-col gap-4 bg-ink/40 p-4 sm:flex-row sm:items-center">
                      <div className="flex flex-1 items-center gap-3">
                        <span
                          className="grid size-11 shrink-0 place-items-center rounded-xl"
                          style={{ background: `color-mix(in oklab, ${s.accent} 16%, transparent)`, color: s.accent }}
                        >
                          <Icon name={s.icon} className="size-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold">{s.name}</p>
                          <p className="text-xs text-faint">{s.kicker}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.options.length ? (
                          <div className="flex flex-1 rounded-full border border-line p-1" role="radiogroup" aria-label={`Opción de ${s.name}`}>
                            {s.options.map((o) => {
                              const active = o.id === i.optionId;
                              return (
                                <button
                                  key={o.id}
                                  type="button"
                                  role="radio"
                                  aria-checked={active}
                                  onClick={() => quote.setOption(s.id, o.id)}
                                  className={`flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                                    active ? "bg-cream text-ink" : "text-muted hover:text-cream"
                                  }`}
                                >
                                  {o.label} · {formatCLP(o.price)}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="flex-1 rounded-full border border-dashed border-line-strong px-4 py-2 text-center text-xs font-semibold text-mint">
                            A cotización
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => quote.remove(s.id)}
                          aria-label={`Quitar ${s.name}`}
                          className="grid size-9 shrink-0 place-items-center rounded-full text-faint transition-colors hover:bg-cream/5 hover:text-cream"
                        >
                          <Icon name="x" className="size-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div>
                <p className="mb-3 text-sm font-semibold text-muted">Agregar más</p>
                <AddChips exclude={inQuote} />
              </div>
            </div>
          )}
        </Step>

        <Step n="2" title="Cuéntanos de ti">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="cot-nombre" label="Nombre">
              <input id="cot-nombre" {...bind("name")} autoComplete="name" placeholder="¿Cómo te llamas?" className={field} />
            </Field>
            <Field id="cot-pais" label="País">
              <Select id="cot-pais" {...bind("country")} placeholder="Elige tu país" options={COUNTRIES} />
            </Field>
            <Field id="cot-negocio" label="Negocio o proyecto" className="sm:col-span-2">
              <input
                id="cot-negocio"
                {...bind("business")}
                placeholder="Ej.: tienda de ropa, academia, canal de YouTube…"
                className={field}
              />
            </Field>
            <Field id="cot-idea" label="Tu idea" className="sm:col-span-2">
              <textarea
                id="cot-idea"
                {...bind("idea")}
                rows={4}
                placeholder="Cuéntanos qué tienes en mente, qué te gustaría lograr y cualquier referencia que te guste."
                className={`${field} resize-y`}
              />
            </Field>
            <Field id="cot-plazo" label="Plazo deseado">
              <Select id="cot-plazo" {...bind("deadline")} placeholder="Sin definir" options={DEADLINES} />
            </Field>
            <Field id="cot-moneda" label="Moneda para cotizar">
              <Select id="cot-moneda" {...bind("currency")} placeholder="Sin preferencia" options={CURRENCIES} />
            </Field>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-faint">
            <Icon name="lock" className="size-3.5" />
            Tus datos se guardan solo en este dispositivo hasta que nos envíes el mensaje.
          </p>
        </Step>
      </div>

      <aside className="lg:sticky lg:top-24" aria-labelledby="paso-3">
        <div
          className="tile tile-glow overflow-hidden p-5 sm:p-7"
          style={{ "--accent": "var(--color-sun)" } as CSSProperties}
        >
          <h2 id="paso-3" className="flex items-center gap-3 text-lg font-bold">
            <span className="grid size-8 place-items-center rounded-full bg-sun text-sm font-extrabold text-ink">3</span>
            Resumen y envío
          </h2>

          {lines.length > 0 ? (
            <ul className="mt-6 space-y-3 text-sm">
              {lines.map((l) => (
                <li key={l.name} className="flex items-start justify-between gap-4">
                  <span>
                    <span className="font-semibold">{l.name}</span>
                    {l.option && <span className="block text-xs text-faint">{l.option}</span>}
                  </span>
                  <span className={`shrink-0 font-semibold ${l.price === null ? "text-mint" : ""}`}>
                    {l.price !== null ? formatCLP(l.price) : "A cotización"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-sm text-muted">Aún no agregas servicios. Puedes enviarnos solo tu idea.</p>
          )}

          <div className="mt-6 border-t border-line pt-5">
            <div className="flex items-end justify-between gap-4">
              <span className="text-sm text-muted">Subtotal referencial</span>
              <span className="display text-4xl" aria-live="polite">
                {formatCLP(subtotal)}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-faint">
              {pending > 0 && (
                <>
                  + {pending} {pending === 1 ? "servicio" : "servicios"} a cotización.{" "}
                </>
              )}
              Valores en CLP. Te confirmamos el precio final, en tu moneda si lo prefieres, antes de empezar.
            </p>
          </div>

          <div className="mt-6 space-y-2.5">
            <a
              href={canSend ? whatsappLink(message) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!canSend}
              onClick={(e) => !canSend && e.preventDefault()}
              className={`flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 font-bold transition-transform ${
                canSend ? "bg-wa text-ink hover:-translate-y-0.5" : "cursor-not-allowed bg-cream/10 text-faint"
              }`}
            >
              <Icon name="whatsapp" className="size-5" />
              Enviar por WhatsApp
            </a>
            <button
              type="button"
              onClick={copy}
              disabled={!canSend}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/5 disabled:cursor-not-allowed disabled:text-faint"
            >
              <Icon name={copied ? "check" : "copy"} className="size-4" />
              <span aria-live="polite">{copied ? "Resumen copiado" : "Copiar resumen"}</span>
            </button>
            {!canSend && (
              <p className="text-center text-xs text-faint">Agrega un servicio o cuéntanos tu idea para enviar.</p>
            )}
          </div>

          {(items.length > 0 || Object.values(details).some((v) => v)) && (
            <button
              type="button"
              onClick={reset}
              className="mx-auto mt-5 flex items-center gap-1.5 text-xs font-semibold text-faint transition-colors hover:text-cream"
            >
              <Icon name="trash" className="size-3.5" />
              Vaciar cotización
            </button>
          )}
        </div>

        <ul className="mt-4 space-y-2 px-2 text-sm text-muted">
          {["Precio confirmado antes de empezar", "Sin cobros sorpresa", "Tu material sigue siendo tuyo"].map((g) => (
            <li key={g} className="flex items-center gap-2">
              <Icon name="shield-check" className="size-4 text-mint" />
              {g}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
