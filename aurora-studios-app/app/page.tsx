import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/icon";
import type { IconKey } from "@/components/icon-data";
import { LogoMark } from "@/components/logo";
import { CtaBand, Reviews, SectionHeading, Stars, btn } from "@/components/ui";
import { COUNTRIES, SERVICES, SITE, formatCLP, fromPrice } from "@/lib/site";

const INNER = SERVICES.slice(0, 4);
const OUTER = SERVICES.slice(4);

function Orbit() {
  const ring = (items: typeof SERVICES, radiusVar: string, spin: string) => (
    <div className={`orbit ${spin}`} style={{ inset: `calc(50% - var(${radiusVar}))` }}>
      {items.map((s, i) => (
        <span
          key={s.id}
          style={{ "--angle": `${(360 / items.length) * i + (radiusVar === "--r2" ? 20 : 0)}deg`, "--radius": `var(${radiusVar})` } as CSSProperties}
        >
          <span className="counter absolute -left-6 -top-6 grid size-12 place-items-center rounded-2xl border border-line-strong bg-ink-3/90 shadow-xl backdrop-blur sm:-left-7 sm:-top-7 sm:size-14">
            <span style={{ color: s.accent }}>
              <Icon name={s.icon} className="size-5 sm:size-6" />
            </span>
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[340px] [--r1:84px] [--r2:142px] sm:max-w-[440px] sm:[--r1:110px] sm:[--r2:188px]"
      aria-hidden
    >
      <div className="absolute inset-[18%] rounded-full bg-sun/25 blur-3xl" />
      <div className="absolute inset-[10%] rounded-full bg-violet/20 blur-3xl" />
      {ring(OUTER, "--r2", "orbit-spin-rev")}
      {ring(INNER, "--r1", "orbit-spin")}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <LogoMark className="size-24 drop-shadow-[0_20px_50px_rgb(255_212_59/0.35)] sm:size-28" />
      </div>
    </div>
  );
}

function CountryMarquee() {
  const list = COUNTRIES.filter((c) => c !== "Otro país");
  const row = (hidden?: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden}>
      {list.map((c) => (
        <li key={c} className="flex items-center gap-6 pr-6 text-lg font-semibold text-muted [font-stretch:85%] sm:text-xl">
          {c}
          <span className="size-1.5 rounded-full bg-sun" />
        </li>
      ))}
    </ul>
  );
  return (
    <section aria-label="Países donde trabajamos" className="border-y border-line bg-ink-2/50 py-5">
      <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee">
          {row()}
          {row(true)}
        </div>
      </div>
      <p className="sr-only">Trabajamos con clientes de cualquier país.</p>
    </section>
  );
}

const REMOTE: { icon: IconKey; title: string; text: string; color: string }[] = [
  { icon: "whatsapp", title: "Atención por WhatsApp", text: "Nos escribes desde tu país y conversamos tu idea enseguida.", color: "var(--color-wa)" },
  { icon: "video", title: "Reuniones por videollamada", text: "Revisamos avances cara a cara, sin importar la distancia.", color: "var(--color-sky)" },
  { icon: "coins", title: "Cotizamos en tu moneda", text: "Precios base en CLP; si estás fuera de Chile te cotizamos en tu moneda o en dólares.", color: "var(--color-sun)" },
  { icon: "clock", title: "A tu zona horaria", text: "Coordinamos entregas y reuniones según tu horario.", color: "var(--color-violet)" },
];

export default function Home() {
  return (
    <>
      {/* Portada */}
      <section className="relative overflow-hidden">
        <div className="aurora" aria-hidden>
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="grid-lines absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.15fr_1fr] lg:pb-24">
          <div>
            <Link
              href="/nosotros#grupo"
              className="reveal inline-flex max-w-full items-center gap-2 rounded-full border border-line-strong bg-ink/60 py-1.5 pl-1.5 pr-4 text-xs font-semibold backdrop-blur sm:text-sm"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-mint text-ink">
                <Icon name="network" className="size-3.5" />
              </span>
              <span className="truncate">Parte del {SITE.group}</span>
            </Link>
            <h1 className="display reveal mt-6 text-[3.4rem] [animation-delay:60ms] sm:text-7xl lg:text-[5.6rem]">
              Tecnología que impulsa tus ideas, <span className="text-aurora">en cualquier país.</span>
            </h1>
            <p className="reveal mt-6 max-w-xl text-base leading-relaxed text-muted [animation-delay:120ms] sm:text-lg">
              Somos Aurora Studios, un estudio de desarrollo digital e inteligencia artificial. Creamos páginas web, bots,
              videos, apps y videojuegos para negocios y creadores de toda América Latina y el mundo, 100% en línea.
            </p>
            <div className="reveal mt-8 flex flex-col gap-3 [animation-delay:180ms] sm:flex-row">
              <Link href="/cotizar" className={btn.primary}>
                <Icon name="clipboard-list" className="size-5" />
                Arma tu cotización
              </Link>
              <Link href="/nosotros" className={btn.ghost}>
                Conoce el estudio
                <Icon name="arrow-right" className="size-4" />
              </Link>
            </div>
            <ul className="reveal mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted [animation-delay:240ms]">
              <li className="flex items-center gap-2">
                <Stars className="size-3.5" />
                Reseñas 5 estrellas
              </li>
              <li className="flex items-center gap-2">
                <Icon name="badge-check" className="size-4 text-mint" />
                Precio confirmado antes de empezar
              </li>
              <li className="flex items-center gap-2">
                <Icon name="shield-check" className="size-4 text-mint" />
                Sin cobros sorpresa
              </li>
            </ul>
          </div>
          <Orbit />
        </div>
      </section>

      <CountryMarquee />

      {/* Servicios */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28" aria-labelledby="servicios-titulo">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            id="servicios-titulo"
            kicker="Lo que hacemos"
            title={
              <>
                Todo lo que tu idea necesita, <span className="text-aurora">en un solo estudio.</span>
              </>
            }
          />
          <Link href="/servicios" className={`${btn.ghost} shrink-0 self-start md:self-auto`}>
            Ver servicios y precios
            <Icon name="arrow-right" className="size-4" />
          </Link>
        </div>
        {/* Celular: lista compacta, como en una app */}
        <ul className="mt-10 divide-y divide-line overflow-hidden rounded-[1.5rem] border border-line sm:hidden">
          {SERVICES.map((s) => {
            const from = fromPrice(s);
            return (
              <li key={s.id}>
                <Link href={`/servicios#${s.id}`} className="flex items-center gap-4 bg-ink-2/40 p-4 active:bg-ink-3">
                  <span
                    className="grid size-12 shrink-0 place-items-center rounded-2xl"
                    style={{ background: `color-mix(in oklab, ${s.accent} 16%, transparent)`, color: s.accent }}
                  >
                    <Icon name={s.icon} className="size-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-bold leading-tight">{s.name}</span>
                      {s.isNew && <span className="rounded-full bg-mint px-1.5 py-0.5 text-[9px] font-bold text-ink">NUEVO</span>}
                    </span>
                    <span className="mt-0.5 block text-sm">
                      {from ? (
                        <>
                          <span className="text-faint">Desde </span>
                          <span className="font-semibold">{formatCLP(from)}</span>
                        </>
                      ) : (
                        <span className="font-semibold text-mint">A cotización</span>
                      )}
                    </span>
                  </span>
                  <Icon name="arrow-right" className="size-4 shrink-0 text-faint" />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Tablet y computador: grilla */}
        <ul className="mt-12 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => {
            const from = fromPrice(s);
            const featured = i === 0;
            const last = i === SERVICES.length - 1;
            return (
              <li key={s.id} className={featured ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : last ? "lg:col-span-3" : ""}>
                <Link
                  href={`/servicios#${s.id}`}
                  className={`tile tile-glow group flex h-full flex-col justify-between gap-8 p-6 transition-transform hover:-translate-y-1 ${
                    last ? "lg:flex-row lg:items-center lg:gap-10" : ""
                  }`}
                  style={{ "--accent": s.accent } as CSSProperties}
                >
                  <div className={last ? "lg:flex lg:items-center lg:gap-6" : ""}>
                    <div className="flex items-start justify-between">
                      <span
                        className="grid size-12 shrink-0 place-items-center rounded-2xl"
                        style={{ background: `color-mix(in oklab, ${s.accent} 16%, transparent)`, color: s.accent }}
                      >
                        <Icon name={s.icon} className="size-6" />
                      </span>
                      {s.isNew && <span className="rounded-full bg-mint px-2.5 py-1 text-[11px] font-bold text-ink">NUEVO</span>}
                    </div>
                    <div className={last ? "lg:mt-0" : ""}>
                      <p className={`kicker text-faint ${last ? "mt-6 lg:mt-0" : "mt-6"}`}>{s.kicker}</p>
                      <h3 className={`display mt-2 ${featured ? "text-4xl lg:text-6xl" : "text-3xl"}`}>{s.name}</h3>
                      <p className={`mt-3 text-sm leading-relaxed text-muted ${featured || last ? "" : "line-clamp-2"}`}>{s.description}</p>
                      {featured && (
                        <ul className="mt-6 hidden flex-wrap gap-2 lg:flex">
                          {s.features.map((f) => (
                            <li key={f} className="flex items-center gap-1.5 rounded-full bg-cream/5 px-3 py-1.5 text-xs font-medium">
                              <Icon name="check" className="size-3.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className={`flex items-center justify-between gap-4 text-sm ${last ? "lg:shrink-0" : ""}`}>
                    <span className="font-semibold">
                      {from ? (
                        <>
                          <span className="text-faint">Desde </span>
                          {formatCLP(from)}
                        </>
                      ) : (
                        <span className="text-mint">A cotización</span>
                      )}
                    </span>
                    <span className="grid size-9 place-items-center rounded-full border border-line transition-colors group-hover:bg-cream group-hover:text-ink">
                      <Icon name="arrow-right" className="size-4" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Cualquier país */}
      <section className="border-y border-line bg-ink-2/40" aria-labelledby="paises-titulo">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              id="paises-titulo"
              kicker="Sin fronteras"
              title={
                <>
                  Tu país no es un límite. <span className="text-aurora">Trabajamos en cualquiera.</span>
                </>
              }
              lead="Trabajamos 100% en línea con clientes de cualquier país. Nos cuentas tu idea por WhatsApp o videollamada, la convertimos en realidad y te la entregamos lista para usar."
            />
            <Link href="/nosotros#paises" className={`${btn.ghost} mt-8`}>
              Cómo trabajamos a distancia
              <Icon name="arrow-right" className="size-4" />
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {REMOTE.map((r) => (
              <li key={r.title} className="tile p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-cream/5" style={{ color: r.color }}>
                  <Icon name={r.icon} className="size-5" />
                </span>
                <h3 className="mt-5 font-bold">{r.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Cómo funciona la app */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28" aria-labelledby="app-titulo">
        <SectionHeading
          id="app-titulo"
          center
          kicker="Así funciona esta app"
          title={
            <>
              Tu cotización en <span className="text-aurora">tres toques.</span>
            </>
          }
          lead="Elige lo que necesitas, cuéntanos tu idea y envíanos todo armado por WhatsApp. Tu cotización queda guardada en este dispositivo para que vuelvas cuando quieras."
        />
        <ol className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            { n: "01", icon: "layout-grid" as IconKey, title: "Elige tus servicios", text: "Revisa precios y agrega lo que te interesa.", href: "/servicios", cta: "Ver servicios" },
            { n: "02", icon: "clipboard-list" as IconKey, title: "Cuéntanos tu idea", text: "Tu país, tu negocio y lo que tienes en mente.", href: "/cotizar", cta: "Ir al cotizador" },
            { n: "03", icon: "send" as IconKey, title: "Envíala por WhatsApp", text: "Te respondemos con una cotización clara.", href: "/contacto", cta: "Contacto" },
          ].map((s) => (
            <li key={s.n} className="tile relative overflow-hidden p-7">
              <span className="display pointer-events-none absolute -right-2 -top-4 text-[7rem] text-cream/[0.04]">{s.n}</span>
              <Icon name={s.icon} className="size-7 text-sun" />
              <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.text}</p>
              <Link href={s.href} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-sun">
                {s.cta}
                <Icon name="arrow-right" className="size-4" />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Grupo */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6" aria-labelledby="grupo-titulo">
        <Link
          href="/nosotros#grupo"
          className="tile tile-glow group grid gap-8 overflow-hidden p-8 sm:p-12 md:grid-cols-[auto_1fr_auto] md:items-center"
          style={{ "--accent": "var(--color-mint)" } as CSSProperties}
        >
          <span className="grid size-20 place-items-center rounded-3xl bg-mint/12 text-mint">
            <Icon name="network" className="size-10" />
          </span>
          <div>
            <p className="kicker text-mint">Respaldo regional</p>
            <h2 id="grupo-titulo" className="display mt-2 text-4xl sm:text-5xl">
              Parte del {SITE.group}
            </h2>
            <p className="mt-3 max-w-2xl text-muted">
              Aurora Studios pertenece al {SITE.group}. Eso significa respaldo, alcance y una misma forma de trabajar en
              cada proyecto, estés donde estés.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 font-semibold text-cream">
            Conócenos
            <Icon name="arrow-right" className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </section>

      {/* Reseñas */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28" aria-labelledby="clientes-titulo">
        <SectionHeading
          id="clientes-titulo"
          kicker="Clientes"
          title={
            <>
              Clientes reales, <span className="text-aurora">sitios reales.</span>
            </>
          }
        />
        <div className="mt-12">
          <Reviews />
        </div>
      </section>

      <CtaBand />
    </>
  );
}
