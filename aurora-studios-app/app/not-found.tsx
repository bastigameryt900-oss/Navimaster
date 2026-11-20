import Link from "next/link";
import { Icon } from "@/components/icon";
import { LogoMark } from "@/components/logo";
import { btn } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <div className="aurora" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="relative mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
        <LogoMark className="size-20" />
        <p className="kicker mt-8 text-sun">Error 404</p>
        <h1 className="display mt-3 text-5xl sm:text-6xl">Esta página se fue a otro país.</h1>
        <p className="mt-4 text-muted">No encontramos lo que buscabas, pero tu próxima idea sí tiene lugar aquí.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className={btn.primary}>
            <Icon name="house" className="size-5" />
            Volver al inicio
          </Link>
          <Link href="/servicios" className={btn.ghost}>
            Ver servicios
          </Link>
        </div>
      </div>
    </section>
  );
}
