import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { InstallButton } from "@/components/install-app";
import { QuickMessage } from "@/components/quick-message";
import { PageHero } from "@/components/ui";
import { SITE, instagramLink, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbele a Aurora Studios por WhatsApp o Instagram desde cualquier país.",
};

export default function ContactoPage() {
  return (
    <>
      <PageHero
        kicker="Contacto"
        title={
          <>
            Hablemos, <span className="text-aurora">estés donde estés.</span>
          </>
        }
        lead="Escríbenos desde cualquier país. Te respondemos con una cotización clara y sin cobros sorpresa."
      />

      <div className="mx-auto grid max-w-6xl gap-5 px-4 pb-24 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <a
            href={whatsappLink("Hola Aurora Studios, quiero cotizar un proyecto.")}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block overflow-hidden rounded-[1.5rem] bg-wa p-7 text-ink sm:p-8"
          >
            <Icon name="whatsapp" className="absolute -bottom-8 -right-8 size-44 opacity-15 transition-transform group-hover:rotate-6" />
            <p className="kicker opacity-70">WhatsApp</p>
            <p className="display mt-3 text-4xl sm:text-5xl">{SITE.whatsappDisplay}</p>
            <p className="mt-3 max-w-xs text-sm font-medium opacity-80">
              La forma más rápida de cotizar. Funciona desde cualquier país.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-cream">
              Abrir WhatsApp
              <Icon name="arrow-right" className="size-4" />
            </span>
          </a>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="tile tile-glow group block p-6" style={{ ["--accent" as string]: "#ff9f45" }}>
              <Icon name="instagram" className="size-7 text-sunset" />
              <p className="mt-5 text-xs text-faint">Instagram</p>
              <p className="font-bold">@{SITE.instagram}</p>
            </a>
            <Link href="/cotizar" className="tile tile-glow group block p-6" style={{ ["--accent" as string]: "#ffd43b" }}>
              <Icon name="clipboard-list" className="size-7 text-sun" />
              <p className="mt-5 text-xs text-faint">Cotizador</p>
              <p className="font-bold">Arma tu cotización</p>
            </Link>
          </div>

          <div className="tile flex items-start gap-4 p-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mint/12 text-mint">
              <Icon name="globe" className="size-5" />
            </span>
            <div>
              <h2 className="font-bold">Atención 100% en línea</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Trabajamos con clientes de cualquier país por WhatsApp y videollamada. Somos parte del {SITE.group}.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <QuickMessage />
          <InstallButton variant="card" />
        </div>
      </div>
    </>
  );
}
