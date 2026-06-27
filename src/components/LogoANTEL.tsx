/**
 * LogoANTEL — wrapper del isotipo oficial ANTEL.
 * El SVG real vive en public/brand/Antel-logo.svg (Next.js sirve /public en root).
 */

interface LogoANTELProps {
  className?: string;
  showTagline?: boolean;
}

export function LogoANTEL({ className = "h-60 w-auto", showTagline = false }: LogoANTELProps) {
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/Antel-logo.svg"
        alt="ANTEL"
        className={className}
        style={{ objectFit: "contain" }}
      />
      {showTagline && (
        <p className="text-[10px] leading-tight text-muted-foreground">
          Empresas Uruguayas Inteligentes · Pulso PyME
        </p>
      )}
    </div>
  );
}
