import Link from "next/link";
import { Icon } from "./icon";
import { Wordmark } from "./logo";
import { SERVICES, SITE, instagramLink, whatsappLink } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-line bg-ink-2/60 pb-32 md:pb-0">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 space-y-4 md:col-span-1">
          <Wordmark />
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            Estudio de desarrollo digital e inteligencia artificial. Parte del {SITE.group}.
          </p>
          <p className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-mint">
            <Icon name="globe" className="size-3.5" />
            Trabajamos en cualquier país
          </p>
        </div>

        <div>
          <h2 className="kicker mb-4 text-faint">Servicios</h2>
          <ul className="space-y-2.5 text-sm">
            {SERVICES.slice(0, 6).map((s) => (
              <li key={s.id}>
                <Link href={`/servicios#${s.id}`} className="text-muted transition-colors hover:text-cream">
                  {s.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/servicios" className="font-semibold text-sun">
                Ver todo
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="kicker mb-4 text-faint">Estudio</h2>
          <ul className="space-y-2.5 text-sm">
            {[
              ["/nosotros", "Nosotros"],
              ["/nosotros#grupo", "Grupo Aurora Studios"],
              ["/nosotros#paises", "Cualquier país"],
              ["/nosotros#preguntas", "Preguntas frecuentes"],
              ["/cotizar", "Cotizar"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-muted transition-colors hover:text-cream">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 md:col-span-1">
          <h2 className="kicker mb-4 text-faint">Contacto</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted hover:text-cream">
                <Icon name="whatsapp" className="size-4 text-wa" />
                {SITE.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted hover:text-cream">
                <Icon name="instagram" className="size-4 text-sunset" />@{SITE.instagram}
              </a>
            </li>
            <li>
              <a href={SITE.url} className="flex items-center gap-2 text-muted hover:text-cream">
                <Icon name="globe" className="size-4 text-sky" />
                {SITE.domain}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {year} {SITE.name} · {SITE.group}
          </p>
          <p>Atención 100% en línea · Precios en CLP, cotizamos en tu moneda</p>
        </div>
      </div>
    </footer>
  );
}
