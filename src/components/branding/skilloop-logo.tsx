type SkilloopzLogoProps = {
  className?: string;
  compact?: boolean;
};

export function SkilloopzLogo({
  className = "",
  compact = false,
}: SkilloopzLogoProps) {
  return (
    <img
      src="/brand/skilloop-wordmark.png"
      alt="skilloopz"
      className={`h-auto w-auto object-contain ${compact ? "max-h-7 max-w-[7.75rem]" : "max-h-10 max-w-[11.5rem]"} ${className}`}
    />
  );
}
