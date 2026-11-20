import type { Metadata } from "next";
import { Icon } from "@/components/icon";
import { ServiceCatalog } from "@/components/service-catalog";
import { CtaBand, PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Servicios y precios",
  description:
    "Páginas web, bots de Discord, Reels, videos para YouTube, apps para iPhone y Android, programas para Windows, videojuegos y proyectos con IA. Precios claros y cotización sin cobros sorpresa.",
};

export default function ServiciosPage() {
  return (
    <>
      <PageHero
        kicker="Servicios"
        title={
          <>
            Precios claros. <span className="text-aurora">Ideas sin límite.</span>
          </>
        }
        lead="Elige lo que necesitas y agrégalo a tu cotización. Los servicios con precio fijo muestran su valor; los proyectos de apps, juegos y desarrollo a medida los cotizamos según tu idea."
      >
        <p className="reveal mt-6 inline-flex items-start gap-2 rounded-2xl border border-line bg-ink-2/60 px-4 py-3 text-sm text-muted [animation-delay:180ms]">
          <Icon name="coins" className="mt-0.5 size-4 shrink-0 text-sun" />
          <span>
            Precios en pesos chilenos (CLP). Si estás en otro país, te cotizamos en tu moneda o en dólares (USD).
          </span>
        </p>
      </PageHero>
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <ServiceCatalog />
      </section>
      <CtaBand />
    </>
  );
}
