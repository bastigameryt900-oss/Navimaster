"use client";

import { useState } from "react";
import { Icon } from "./icon";
import { Field, Select, field } from "./form";
import { COUNTRIES, SITE, whatsappLink } from "@/lib/site";

export function QuickMessage() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [text, setText] = useState("");

  const message = [
    `Hola Aurora Studios${name.trim() ? `, soy ${name.trim()}` : ""}${country && country !== "Otro país" ? ` y te escribo desde ${country}` : ""}.`,
    text.trim(),
    "",
    `(Enviado desde la app de ${SITE.domain})`,
  ]
    .filter((l, i) => l || i > 0)
    .join("\n");

  const ready = text.trim().length > 0;

  return (
    <form
      className="tile p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
      }}
    >
      <h2 className="text-xl font-bold">Envíanos un mensaje</h2>
      <p className="mt-1 text-sm text-muted">Se abrirá WhatsApp con tu mensaje listo para enviar.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field id="msj-nombre" label="Nombre">
          <input id="msj-nombre" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Tu nombre" className={field} />
        </Field>
        <Field id="msj-pais" label="País">
          <Select id="msj-pais" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Elige tu país" options={COUNTRIES} />
        </Field>
        <Field id="msj-texto" label="Mensaje" className="sm:col-span-2">
          <textarea
            id="msj-texto"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            required
            placeholder="¿En qué te podemos ayudar?"
            className={`${field} resize-y`}
          />
        </Field>
      </div>
      <button
        type="submit"
        disabled={!ready}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-wa px-6 py-3.5 font-bold text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-cream/10 disabled:text-faint disabled:hover:translate-y-0 sm:w-auto"
      >
        <Icon name="send" className="size-4" />
        Enviar por WhatsApp
      </button>
    </form>
  );
}
