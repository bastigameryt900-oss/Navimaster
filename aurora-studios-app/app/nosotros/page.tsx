import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/icon";
import type { IconKey } from "@/components/icon-data";
import { LogoMark } from "@/components/logo";
import { CtaBand, PageHero, Reviews, SectionHeading, btn } from "@/components/ui";
import { COUNTRIES, GUARANTEES, SERVICES, SITE, STEPS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce Aurora Studios: estudio de desarrollo digital e inteligencia artificial, parte del Grupo Aurora Studios América Latina, que trabaja con clientes de cualquier país.",
};

const FACTS: { label: string; value: string; icon: IconKey }[] = [
  { label: "Pertenecemos al", value: SITE.group, icon: "network" },
  { label: "Trabajamos en", value: "Cualquier país", icon: "globe" },
  { label: "Modalidad", value: "100% en línea", icon: "video" },
  { label: "Líneas de servicio", value: `${SERVICES.length} especialidades`, icon: "layout-grid" },
];

const VALUES: { title: string; text: string; icon: IconKey; color: string }[] = [
  { title: "Claridad", text: "Precio confirmado antes de empezar y sin cobros sorpresa.", icon: "badge-check", color: "var(--color-sun)" },
  { title: "Cercanía", text: "Te explicamos todo en simple y te acompañamos en cada paso.", icon: "heart", color: "var(--color-sunset)" },
  { title: "Calidad", text: "Probamos cada entrega antes de pasártela.", icon: "shield-check", color: "var(--color-mint)" },
  { title: "Innovación", text: "Usamos inteligencia artificial y herramientas modernas para llegar más lejos.", icon: "sparkles", color: "var(--color-violet)" },
  { title: "Respeto", text: "Tu material y tus ideas siguen siendo tuyos.", icon: "lock", color: "var(--color-sky)" },
  { title: "Sin fronteras", text: "Atendemos a clientes de cualquier país con la misma dedicación.", icon: "globe", color: "#ff7ad9" },
];

const REMOTE: { title: string; text: string; icon: IconKey }[] = [
  { title: "100% en línea", text: "Todo el proceso es digital: conversación, avances, entrega y soporte.", icon: "globe" },
  { title: "WhatsApp y videollamada", text: "Hablamos por donde te acomode; nuestro WhatsApp recibe mensajes de cualquier país.", icon: "whatsapp" },
  { title: "Tu moneda", text: "Precios base en CLP; te cotizamos en tu moneda o en dólares (USD).", icon: "coins" },
  { title: "Tu horario", text: "Coordinamos reuniones y entregas según tu zona horaria.", icon: "clock" },
  { title: "Entregas digitales", text: "Recibes archivos, accesos y sitios publicados, listos para usar.", icon: "download" },
  { title: "Pensado para tu público", text: "Adaptamos textos, moneda y contacto a las personas de tu país.", icon: "users" },
];

const AREAS: { title: string; text: string; icon: IconKey; color: string }[] = [
  { title: "Desarrollo web", text: "Páginas rápidas, modernas y adaptadas a celulares.", icon: "globe", color: "#ffd43b" },
  { title: "Comunidades y bots", text: "Bots de Discord con comandos, moderación y roles.", icon: "discord", color: "#8b93ff" },
  { title: "Video y contenido", text: "Reels y videos para YouTube, editados o creados desde cero.", icon: "clapperboard", color: "#ff9f45" },
  { title: "Apps y software", text: "Apps para iPhone y Android, y programas para Windows.", icon: "smartphone", color: "#7ddfb0" },
  { title: "Videojuegos", text: "Juegos para PC y celular a partir de tu idea.", icon: "gamepad-2", color: "#ff7ad9" },
  { title: "IA y automatización", text: "Chatbots, integraciones y sistemas a medida.", icon: "brain-circuit", color: "#b9a6ff" },
];

const GROWTH = [
  {
    tag: "Los comienzos",
    title: "Presencia digital para negocios y creadores",
    text: "Empezamos con páginas web, bots de Discord, Reels y videos para YouTube: lo esencial para que una idea se vea y se use en internet.",
  },
  {
    tag: "Nuevas áreas",
    title: "Apps, programas y videojuegos",
    text: "Sumamos apps para iPhone y Android, programas para Windows, videojuegos y proyectos a medida con inteligencia artificial.",
  },
  {
    tag: "Hoy",
    title: `Parte del ${SITE.group}`,
    text: "Formamos parte del grupo y trabajamos con clientes de cualquier país, 100% en línea.",
  },
];

const FAQ = [
  {
    q: "¿Trabajan con clientes de otros países?",
    a: "Sí. Trabajamos 100% en línea con clientes de cualquier país. Conversamos por WhatsApp o videollamada y te entregamos todo de forma digital.",
  },
  {
    q: "¿Qué es el Grupo Aurora Studios América Latina?",
    a: "Es el grupo al que pertenece Aurora Studios. Gracias a él contamos con respaldo y una mirada regional para trabajar con clientes de toda América Latina y el mundo.",
  },
  {
    q: "¿En qué moneda están los precios?",
    a: "Los precios publicados están en pesos chilenos (CLP). Si estás en otro país, te cotizamos en tu moneda o en dólares (USD), y te confirmamos el valor antes de empezar.",
  },
  {
    q: "¿Las apps y los juegos tienen precio fijo?",
    a: "No. Como cada idea es distinta, las apps, los programas, los videojuegos y los proyectos a medida van a cotización. Cuéntanos tu idea en el cotizador y te respondemos con un valor claro.",
  },
  {
    q: "¿Cuánto se demora un proyecto?",
    a: "Depende del tipo de proyecto y de su alcance. El plazo queda definido en la cotización, antes de empezar.",
  },
  {
    q: "¿Qué incluye la página web con dominio anual?",
    a: "Incluye tu propio dominio (la dirección de tu página) por un año, además de una página adaptada a celulares y con botón directo a WhatsApp.",
  },
  {
    q: "¿Qué significa “con hosting” en los bots de Discord?",
    a: "Que nos encargamos de mantener tu bot encendido las 24 horas, para que funcione siempre sin que tengas que dejar un computador prendido.",
  },
  {
    q: "¿El material que entrego sigue siendo mío?",
    a: "Sí. Tu material sigue siendo tuyo, y el precio se confirma antes de empezar: sin cobros sorpresa.",
  },
];

export default function NosotrosPage() {
  return (
    <>
      <PageHero
        kicker="Nosotros"
        title={
          <>
            Un estudio digital <span className="text-aurora">sin fronteras.</span>
          </>
        }
        lead={`Aurora Studios es un estudio de desarrollo digital e inteligencia artificial que forma parte del ${SITE.group}. Diseñamos y desarrollamos tecnología para negocios, emprendedores y creadores de cualquier país.`}
      >
        <dl className="reveal mt-10 grid gap-3 [animation-delay:180ms] sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((f) => (
            <div key={f.label} className="tile flex items-center gap-3 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cream/5 text-sun">
                <Icon name={f.icon} className="size-5" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs text-faint">{f.label}</dt>
                <dd className="text-sm font-bold leading-snug">{f.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </PageHero>

      {/* Quiénes somos */}
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_1.1fr]" aria-labelledby="quienes">
        <div>
          <SectionHeading
            id="quienes"
            kicker="Quiénes somos"
            title={
              <>
                Diseño, código e IA <span className="text-aurora">al servicio de tu idea.</span>
              </>
            }
          />
          <div className="mt-8 flex items-center gap-4">
            <LogoMark className="size-16" />
            <div>
              <p className="text-lg font-extrabold [font-stretch:88%]">Aurora Studios</p>
              <p className="text-xs font-bold tracking-[0.3em] text-sunset">AI DEVELOPMENT</p>
            </div>
          </div>
        </div>
        <div className="space-y-5 text-base leading-relaxed text-muted sm:text-lg">
          <p>
            <span className="font-semibold text-cream">Somos un estudio creativo y tecnológico.</span> Nuestro sello es{" "}
            <em className="not-italic text-sun">AI Development</em>: unimos diseño, desarrollo e inteligencia artificial
            para crear soluciones que funcionan de verdad y que cualquier persona puede usar.
          </p>
          <p>
            Empezamos ayudando a negocios y creadores a tener presencia digital con páginas web, bots de Discord y
            contenido para redes. Hoy también creamos apps para iPhone y Android, programas para Windows, videojuegos y
            proyectos a medida con inteligencia artificial.
          </p>
          <p>
            Creemos que la buena tecnología no debería depender de dónde vives. Por eso trabajamos completamente en
            línea, con clientes de cualquier país, y con la misma cercanía con la que conversaríamos en persona.
          </p>
        </div>
      </section>

      {/* Grupo */}
      <section id="grupo" className="scroll-mt-20 border-y border-line bg-ink-2/40" aria-labelledby="grupo-titulo">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="relative overflow-hidden rounded-[2rem] border border-line-strong bg-ink p-8 sm:p-12">
            <div className="aurora opacity-60" aria-hidden>
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="relative grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
              <div>
                <p className="kicker text-mint">Nuestro grupo</p>
                <h2 id="grupo-titulo" className="display mt-3 text-4xl sm:text-6xl">
                  Parte del <span className="text-aurora">{SITE.group}</span>
                </h2>
                <p className="mt-5 max-w-xl text-muted sm:text-lg">
                  Aurora Studios pertenece al {SITE.group}. Ser parte de un grupo con mirada latinoamericana nos da
                  respaldo y alcance para acompañar proyectos en cualquier país.
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  { icon: "shield-check" as IconKey, title: "Respaldo de grupo", text: `Cada proyecto cuenta con el respaldo del ${SITE.group}.` },
                  { icon: "globe" as IconKey, title: "Alcance regional", text: "Pensamos en clientes de toda América Latina y del mundo." },
                  { icon: "badge-check" as IconKey, title: "Un mismo estándar", text: "Precios claros y las mismas garantías, sin importar tu país." },
                ].map((b) => (
                  <li key={b.title} className="flex gap-4 rounded-2xl border border-line bg-ink-2/70 p-4 backdrop-blur">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mint/12 text-mint">
                      <Icon name={b.icon} className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-bold">{b.title}</h3>
                      <p className="mt-0.5 text-sm text-muted">{b.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Misión y visión */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="proposito">
        <SectionHeading
          id="proposito"
          kicker="Propósito"
          title={
            <>
              Lo que nos mueve <span className="text-aurora">cada día.</span>
            </>
          }
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[
            {
              icon: "target" as IconKey,
              tag: "Misión",
              text: "Impulsar las ideas de negocios, emprendedores y creadores con tecnología accesible, bien hecha y explicada con claridad, estén donde estén.",
              accent: "var(--color-sun)",
            },
            {
              icon: "eye" as IconKey,
              tag: "Visión",
              text: "Ser el estudio digital de referencia en América Latina para quienes quieren llevar su idea a internet, a un celular o a un videojuego, sin fronteras.",
              accent: "var(--color-violet)",
            },
          ].map((m) => (
            <article key={m.tag} className="tile tile-glow p-7 sm:p-9" style={{ "--accent": m.accent } as CSSProperties}>
              <span style={{ color: m.accent }}>
                <Icon name={m.icon} className="size-8" />
              </span>
              <h3 className="kicker mt-6 text-faint">{m.tag}</h3>
              <p className="display mt-3 text-3xl leading-[1.05] sm:text-4xl">{m.text}</p>
            </article>
          ))}
        </div>

        <h3 className="kicker mt-16 text-sun">Nuestros valores</h3>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v) => (
            <li key={v.title} className="tile p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-cream/5" style={{ color: v.color }}>
                <Icon name={v.icon} className="size-5" />
              </span>
              <h4 className="mt-5 text-lg font-bold">{v.title}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{v.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Cualquier país */}
      <section id="paises" className="scroll-mt-20 border-y border-line bg-ink-2/40" aria-labelledby="paises-titulo">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionHeading
            id="paises-titulo"
            kicker="Dónde trabajamos"
            title={
              <>
                Trabajamos en <span className="text-aurora">cualquier país.</span>
              </>
            }
            lead="No importa si estás en México, Argentina, España, Estados Unidos o en cualquier otro lugar: el proceso es el mismo, la atención es la misma y los resultados también."
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REMOTE.map((r) => (
              <li key={r.title} className="tile flex gap-4 p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sky/10 text-sky">
                  <Icon name={r.icon} className="size-5" />
                </span>
                <div>
                  <h3 className="font-bold">{r.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{r.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <p className="text-sm font-semibold text-muted">Algunos de los países desde donde nos pueden escribir:</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {COUNTRIES.filter((c) => c !== "Otro país").map((c) => (
                <li key={c} className="rounded-full border border-line px-3.5 py-1.5 text-sm text-muted">
                  {c}
                </li>
              ))}
              <li className="rounded-full bg-mint px-3.5 py-1.5 text-sm font-bold text-ink">y cualquier otro país</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Qué hacemos */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="areas">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            id="areas"
            kicker="Especialidades"
            title={
              <>
                Seis áreas, <span className="text-aurora">un solo equipo.</span>
              </>
            }
          />
          <Link href="/servicios" className={`${btn.ghost} shrink-0 self-start md:self-auto`}>
            Ver precios
            <Icon name="arrow-right" className="size-4" />
          </Link>
        </div>
        <ul className="mt-10 grid gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((a) => (
            <li key={a.title} className="bg-ink p-6 sm:p-7">
              <span style={{ color: a.color }}>
                <Icon name={a.icon} className="size-7" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{a.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{a.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Cómo hemos crecido */}
      <section className="border-y border-line bg-ink-2/40" aria-labelledby="historia">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionHeading
            id="historia"
            kicker="Nuestra historia"
            title={
              <>
                Cómo hemos <span className="text-aurora">crecido.</span>
              </>
            }
          />
          <ol className="relative mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
            <span
              className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-mint via-violet to-sun md:inset-x-0 md:top-[19px] md:bottom-auto md:h-px md:w-auto md:bg-gradient-to-r"
              aria-hidden
            />
            {GROWTH.map((g, i) => (
              <li key={g.tag} className="relative pl-14 md:pl-0 md:pt-14">
                <span className="absolute left-0 top-0 grid size-10 place-items-center rounded-full border-4 border-ink bg-cream text-sm font-extrabold text-ink">
                  {i + 1}
                </span>
                <p className="kicker text-sun">{g.tag}</p>
                <h3 className="mt-2 text-xl font-bold">{g.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{g.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Cómo trabajamos */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="proceso">
        <SectionHeading
          id="proceso"
          kicker="Cómo trabajamos"
          title={
            <>
              De tu idea <span className="text-aurora">a la entrega.</span>
            </>
          }
        />
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="tile p-6">
              <span className="display text-5xl text-sun">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{s.detail}</p>
            </li>
          ))}
        </ol>
        <ul className="mt-6 flex flex-wrap gap-3">
          {GUARANTEES.map((g) => (
            <li key={g} className="inline-flex items-center gap-2 rounded-full bg-mint/10 px-4 py-2 text-sm font-semibold text-mint">
              <Icon name="shield-check" className="size-4" />
              {g}
            </li>
          ))}
        </ul>
      </section>

      {/* Clientes */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24" aria-labelledby="clientes">
        <SectionHeading
          id="clientes"
          kicker="Clientes"
          title={
            <>
              Lo que dicen <span className="text-aurora">de nosotros.</span>
            </>
          }
        />
        <div className="mt-10">
          <Reviews />
        </div>
      </section>

      {/* Preguntas */}
      <section id="preguntas" className="scroll-mt-20 border-t border-line" aria-labelledby="faq">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_1.5fr]">
          <SectionHeading
            id="faq"
            kicker="Preguntas frecuentes"
            title={
              <>
                Todo lo que <span className="text-aurora">quieres saber.</span>
              </>
            }
            lead="¿Te queda alguna duda? Escríbenos por WhatsApp y te respondemos."
          />
          <div className="divide-y divide-line overflow-hidden rounded-[1.5rem] border border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group bg-ink-2/40 open:bg-ink-2">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-5 font-semibold sm:px-6">
                  {f.q}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-line transition-transform group-open:rotate-45">
                    <Icon name="plus" className="size-4" />
                  </span>
                </summary>
                <p className="px-5 pb-6 text-[15px] leading-relaxed text-muted sm:px-6">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
