import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./icon";
import { REVIEWS, SITE, whatsappLink } from "@/lib/site";

export const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full bg-sun px-6 py-3.5 text-[15px] font-bold text-ink shadow-[0_10px_40px_-10px_var(--color-sun)] transition-transform hover:-translate-y-0.5 active:translate-y-0",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full border border-line-strong px-6 py-3.5 text-[15px] font-semibold text-cream transition-colors hover:bg-cream/5",
  wa: "inline-flex items-center justify-center gap-2 rounded-full bg-wa px-6 py-3.5 text-[15px] font-bold text-ink transition-transform hover:-translate-y-0.5",
};

export function SectionHeading({
  kicker,
  title,
  lead,
  center = false,
  id,
}: {
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  center?: boolean;
  id?: string;
}) {
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <p className="kicker text-sun">{kicker}</p>
      <h2 id={id} className="display mt-3 text-4xl sm:text-5xl md:text-6xl">
        {title}
      </h2>
      {lead && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{lead}</p>}
    </div>
  );
}

export function PageHero({ kicker, title, lead, children }: { kicker: string; title: ReactNode; lead: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div className="aurora opacity-70" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pt-20">
        <p className="kicker reveal text-sun">{kicker}</p>
        <h1 className="display reveal mt-4 max-w-4xl text-5xl [animation-delay:60ms] sm:text-6xl md:text-7xl">{title}</h1>
        <p className="reveal mt-5 max-w-2xl text-base leading-relaxed text-muted [animation-delay:120ms] sm:text-lg">{lead}</p>
        {children}
      </div>
    </section>
  );
}

export function Stars({ className = "size-4" }: { className?: string }) {
  return (
    <span className="flex text-sun" aria-label="5 de 5 estrellas" role="img">
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name="star" className={`${className} fill-current`} />
      ))}
    </span>
  );
}

export function Reviews() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {REVIEWS.map((r) => (
        <figure key={r.site} className="tile flex flex-col justify-between gap-8 p-7">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <Stars />
              <span className="inline-flex items-center gap-1.5 truncate rounded-full bg-cream/5 px-3 py-1 text-xs text-faint">
                <Icon name="lock" className="size-3" />
                {r.site}
              </span>
            </div>
            <blockquote className="display text-3xl leading-[1.05] sm:text-4xl">“{r.quote}”</blockquote>
          </div>
          <figcaption className="text-sm">
            <span className="font-bold">{r.author}</span>
            <span className="text-muted"> · {r.business}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function CtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="relative overflow-hidden rounded-[2rem] border border-line-strong bg-ink-2 px-6 py-14 text-center sm:px-12 sm:py-20">
        <div className="aurora opacity-80" aria-hidden>
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="relative">
          <p className="kicker text-mint">Desde cualquier país</p>
          <h2 className="display mx-auto mt-4 max-w-3xl text-5xl sm:text-7xl">
            ¿Tienes una idea? <span className="text-aurora">La hacemos realidad.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-muted">
            Cuéntanos qué necesitas y te respondemos con una cotización clara, sin cobros sorpresa.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/cotizar" className={btn.primary}>
              <Icon name="clipboard-list" className="size-5" />
              Arma tu cotización
            </Link>
            <a href={whatsappLink("Hola Aurora Studios, tengo una idea y quiero cotizarla.")} target="_blank" rel="noopener noreferrer" className={btn.wa}>
              <Icon name="whatsapp" className="size-5" />
              {SITE.whatsappDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
