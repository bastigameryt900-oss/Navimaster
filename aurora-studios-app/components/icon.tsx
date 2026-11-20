import { ICONS, type IconKey } from "./icon-data";

type Props = {
  name: IconKey;
  className?: string;
  /** Texto para lectores de pantalla. Sin él, el ícono es decorativo. */
  label?: string;
};

export function Icon({ name, className = "size-5", label }: Props) {
  const icon = ICONS[name];
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={icon.brand ? "currentColor" : "none"}
      stroke={icon.brand ? "none" : "currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}
