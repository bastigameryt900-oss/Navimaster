type Props = { className?: string; title?: string };

/** Logo de Aurora Studios: la “A” y el sol que sale, sobre la baldosa tinta. */
export function LogoMark({ className = "size-9", title }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect width="100" height="100" rx="24" fill="#15141b" />
      <rect x="1" y="1" width="98" height="98" rx="23" fill="none" stroke="#fff" strokeOpacity=".16" strokeWidth="2" />
      <g transform="translate(50 50) scale(0.6) translate(-50 -50)">
        <path
          d="M16.5 81L50 15l33.5 66"
          fill="none"
          stroke="#fdfcf9"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M33.5 89a16.5 16.5 0 0 1 33 0z" fill="#ffd43b" />
      </g>
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className={compact ? "size-8" : "size-9"} />
      <span className="leading-none">
        <span className="block text-[15px] font-extrabold tracking-tight [font-stretch:88%]">Aurora Studios</span>
        {!compact && <span className="mt-1 block text-[9px] font-bold tracking-[0.32em] text-sunset">AI DEVELOPMENT</span>}
      </span>
    </span>
  );
}
