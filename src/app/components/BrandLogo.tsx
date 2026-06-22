interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

export function BrandLogo({
  className = '',
  imageClassName = '',
  priority = false,
}: BrandLogoProps) {
  return (
    <span className={`relative block shrink-0 overflow-hidden ${className}`}>
      <img
        src="/img/logo-white.png"
        alt="Staybridge London"
        width="1080"
        height="1350"
        decoding="async"
        loading={priority ? 'eager' : 'lazy'}
        className={`pointer-events-none absolute left-1/2 top-[57%] h-[200%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 select-none object-contain [mix-blend-mode:screen] ${imageClassName}`}
      />
    </span>
  );
}
