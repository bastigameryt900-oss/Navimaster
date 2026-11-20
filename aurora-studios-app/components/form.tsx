import type { ReactNode } from "react";
import { Icon } from "./icon";

export const field =
  "mt-1.5 w-full rounded-2xl border border-line bg-ink/60 px-4 py-3 text-[15px] text-cream placeholder:text-faint transition-colors focus:border-sun focus:outline-none";

export function Field({ id, label, className, children }: { id: string; label: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Select({
  id,
  value,
  onChange,
  placeholder,
  options,
}: {
  id: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <span className="relative block">
      <select id={id} value={value} onChange={onChange} className={`${field} appearance-none pr-10`}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Icon name="chevron-down" className="pointer-events-none absolute right-4 top-1/2 mt-0.5 size-4 -translate-y-1/2 text-faint" />
    </span>
  );
}
