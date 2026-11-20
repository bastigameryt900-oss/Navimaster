"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icon";
import type { IconKey } from "./icon-data";
import { Wordmark } from "./logo";
import { InstallButton } from "./install-app";
import { useQuoteItems } from "@/lib/quote";
import { SITE, whatsappLink } from "@/lib/site";

const NAV: { href: string; label: string; icon: IconKey }[] = [
  { href: "/", label: "Inicio", icon: "house" },
  { href: "/servicios", label: "Servicios", icon: "layout-grid" },
  { href: "/cotizar", label: "Cotizar", icon: "clipboard-list" },
  { href: "/nosotros", label: "Nosotros", icon: "users" },
  { href: "/contacto", label: "Contacto", icon: "message-circle" },
];

const isActive = (pathname: string, href: string) => {
  const path = pathname.replace(/\/+$/, "") || "/";
  return href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
};

export function SiteHeader() {
  const pathname = usePathname();
  const count = useQuoteItems().length;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Aurora Studios, inicio" className="shrink-0">
          <Wordmark />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {NAV.filter((n) => n.href !== "/cotizar").map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active ? "bg-cream/10 text-cream" : "text-muted hover:text-cream"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <InstallButton variant="compact" />
          <a
            href={whatsappLink("Hola Aurora Studios, quiero cotizar un proyecto.")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp ${SITE.whatsappDisplay}`}
            className="grid size-10 place-items-center rounded-full border border-line text-wa transition-colors hover:bg-wa/10 md:hidden"
          >
            <Icon name="whatsapp" className="size-5" />
          </a>
          <Link
            href="/cotizar"
            aria-current={isActive(pathname, "/cotizar") ? "page" : undefined}
            className="hidden items-center gap-2 rounded-full bg-sun px-4 py-2 text-sm font-bold text-ink transition-transform hover:-translate-y-0.5 md:inline-flex"
          >
            <Icon name="clipboard-list" className="size-4" />
            Mi cotización
            {count > 0 && (
              <span
                key={count}
                className="bump grid min-w-5 place-items-center rounded-full bg-ink px-1.5 text-xs text-sun"
              >
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function TabBar() {
  const pathname = usePathname();
  const count = useQuoteItems().length;

  return (
    <nav
      aria-label="Navegación de la app"
      className="fixed inset-x-0 bottom-0 z-50 px-3 md:hidden"
      style={{ paddingBottom: "max(0.75rem, var(--safe-bottom))" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 items-end rounded-[1.75rem] border border-line-strong bg-ink-2/85 px-1 pt-1.5 pb-1.5 shadow-[0_20px_50px_-12px_rgb(0_0_0/0.8)] backdrop-blur-xl">
        {NAV.map((n) => {
          const active = isActive(pathname, n.href);
          const center = n.href === "/cotizar";
          return (
            <li key={n.href} className="flex justify-center">
              <Link
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex w-full flex-col items-center gap-1 rounded-2xl py-1 text-[10.5px] font-semibold transition-colors ${
                  active ? "text-cream" : "text-faint"
                }`}
              >
                {center ? (
                  <span
                    className={`-mt-6 grid size-13 place-items-center rounded-full border-4 border-ink shadow-lg transition-transform ${
                      active ? "scale-105 bg-sun text-ink" : "bg-sun text-ink"
                    }`}
                  >
                    <Icon name={n.icon} className="size-5.5" />
                  </span>
                ) : (
                  <span
                    className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${active ? "bg-cream/12" : ""}`}
                  >
                    <Icon name={n.icon} className="size-5" />
                  </span>
                )}
                {n.label}
                {center && count > 0 && (
                  <span
                    key={count}
                    aria-label={`${count} en tu cotización`}
                    className="bump absolute -top-6 right-[calc(50%-2rem)] grid min-w-5 place-items-center rounded-full bg-mint px-1 text-[11px] font-bold text-ink ring-2 ring-ink"
                  >
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
