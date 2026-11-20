"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { Icon } from "./icon";
import { quote, useQuoteItems } from "@/lib/quote";
import { CATEGORIES, SERVICES, formatCLP, type CategoryId, type Service } from "@/lib/site";

function ServiceCard({ service: s }: { service: Service }) {
  const items = useQuoteItems();
  const inQuote = items.find((i) => i.serviceId === s.id);
  const [picked, setPicked] = useState<string | null>(null);
  const optionId = inQuote?.optionId ?? picked ?? s.options[0]?.id ?? null;

  const choose = (id: string) => (inQuote ? quote.setOption(s.id, id) : setPicked(id));

  return (
    <article
      id={s.id}
      className="tile tile-glow flex scroll-mt-24 flex-col p-6 sm:p-7"
      style={{ "--accent": s.accent } as CSSProperties}
      aria-labelledby={`${s.id}-titulo`}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className="grid size-14 place-items-center rounded-2xl"
          style={{ background: `color-mix(in oklab, ${s.accent} 16%, transparent)`, color: s.accent }}
        >
          <Icon name={s.icon} className="size-7" />
        </span>
        {s.isNew && <span className="rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-ink">NUEVO</span>}
      </div>

      <p className="kicker mt-6 text-faint">{s.kicker}</p>
      <h2 id={`${s.id}-titulo`} className="display mt-2 text-4xl">
        {s.name}
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{s.description}</p>

      <ul className="mt-5 flex flex-wrap gap-2">
        {s.features.map((f) => (
          <li key={f} className="flex items-center gap-1.5 rounded-full bg-cream/5 px-3 py-1.5 text-xs font-medium">
            <Icon name="check" className="size-3.5" />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        {s.options.length > 0 ? (
          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-faint">Elige una opción</legend>
            <div className="grid grid-cols-2 gap-2">
              {s.options.map((o) => {
                const active = o.id === optionId;
                return (
                  <label
                    key={o.id}
                    className={`cursor-pointer rounded-2xl border p-3.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sun ${
                      active ? "border-transparent bg-cream text-ink" : "border-line hover:border-line-strong"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`${s.id}-opcion`}
                      value={o.id}
                      checked={active}
                      onChange={() => choose(o.id)}
                      className="sr-only"
                    />
                    <span className={`block text-xs font-semibold ${active ? "text-ink/70" : "text-muted"}`}>{o.label}</span>
                    <span className="mt-0.5 block text-xl font-extrabold [font-stretch:85%]">{formatCLP(o.price)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : (
          <div className="flex items-center justify-between rounded-2xl border border-dashed border-line-strong p-4">
            <span className="text-sm text-muted">Precio</span>
            <span className="text-lg font-extrabold text-mint [font-stretch:85%]">A cotización</span>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {inQuote ? (
            <>
              <Link
                href="/cotizar"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-mint px-5 py-3 text-sm font-bold text-ink"
              >
                <Icon name="check" className="size-4" />
                En tu cotización
              </Link>
              <button
                type="button"
                onClick={() => quote.remove(s.id)}
                aria-label={`Quitar ${s.name} de la cotización`}
                className="grid size-11 place-items-center rounded-full border border-line text-muted transition-colors hover:text-cream"
              >
                <Icon name="trash" className="size-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => quote.add(s.id, optionId)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-sun px-5 py-3 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5"
            >
              <Icon name="plus" className="size-4" />
              {s.options.length ? "Agregar a mi cotización" : "Agregar para cotizar"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function ServiceCatalog() {
  const [filter, setFilter] = useState<CategoryId | "todos">("todos");
  const items = useQuoteItems();
  const shown = filter === "todos" ? SERVICES : SERVICES.filter((s) => s.category === filter);

  return (
    <>
      <div className="sticky top-16 z-30 -mx-4 border-b border-line bg-ink/80 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="no-scrollbar flex gap-2 overflow-x-auto" role="group" aria-label="Filtrar servicios">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilter(c.id)}
              aria-pressed={filter === c.id}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filter === c.id ? "bg-cream text-ink" : "border border-line text-muted hover:text-cream"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shown.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>

      {items.length > 0 && (
        <div className="pointer-events-none sticky bottom-28 z-30 mt-8 flex justify-center md:bottom-6">
          <Link
            href="/cotizar"
            className="reveal pointer-events-auto inline-flex items-center gap-3 rounded-full border border-line-strong bg-ink-3/95 py-2 pl-2 pr-5 text-sm font-semibold shadow-2xl backdrop-blur"
          >
            <span className="grid size-9 place-items-center rounded-full bg-sun font-bold text-ink">{items.length}</span>
            {items.length === 1 ? "servicio" : "servicios"} en tu cotización · Continuar
            <Icon name="arrow-right" className="size-4" />
          </Link>
        </div>
      )}
    </>
  );
}
