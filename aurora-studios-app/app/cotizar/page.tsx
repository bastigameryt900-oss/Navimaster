import type { Metadata } from "next";
import { QuoteBuilder } from "@/components/quote-builder";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Cotizar",
  description: "Arma tu cotización con Aurora Studios y envíala por WhatsApp desde cualquier país.",
};

export default function CotizarPage() {
  return (
    <>
      <PageHero
        kicker="Cotizador"
        title={
          <>
            Arma tu proyecto. <span className="text-aurora">Te respondemos con todo claro.</span>
          </>
        }
        lead="Elige servicios, cuéntanos tu idea y envíanos la cotización por WhatsApp. Funciona desde cualquier país y queda guardada en este dispositivo."
      />
      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <QuoteBuilder />
      </div>
    </>
  );
}
