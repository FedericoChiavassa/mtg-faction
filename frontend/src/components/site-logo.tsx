import type { LucideProps } from 'lucide-react';

export const SiteLogo = ({
  size = 24,
  strokeWidth = 0.75,
  className,
  ...props
}: LucideProps) => {
  return (
    <svg
      fill="none"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        y="6"
        x="10"
        rx="2"
        width="10"
        height="14"
        fill="var(--color-foreground)"
        className="transition-transform duration-500 group-hover/card-swap:-translate-x-1.5 group-hover/card-swap:-translate-y-0.5"
      />
      <rect
        x="4"
        y="4"
        rx="2"
        width="10"
        height="14"
        fill="var(--color-background)"
        className="transition-transform duration-500 group-hover/card-swap:translate-x-1.5 group-hover/card-swap:translate-y-0.5"
      />
    </svg>
  );
};
