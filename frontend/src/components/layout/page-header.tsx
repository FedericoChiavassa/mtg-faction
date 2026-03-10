import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Container } from './container';

export function PageHeader({ children }: { children: React.ReactNode }) {
  return (
    <div data-slot="page-header" className={'bg-card outline outline-border'}>
      <Container className="py-5">{children}</Container>
    </div>
  );
}

export function PageHeaderCaption({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <p
      data-slot="page-header-caption"
      className={cn(
        'mb-0.5 text-[11px] font-semibold tracking-[0.15em] text-muted-foreground uppercase',
        className,
      )}
    >
      {children}
    </p>
  );
}

export function PageHeaderTitle({
  children,
  className,
  icon: Icon,
}: {
  children: string;
  className?: string;
  icon?: LucideIcon;
}) {
  return (
    <h1
      data-slot="page-header-title"
      className={cn(
        'flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground',
        className,
      )}
    >
      {Icon && <Icon className="size-5 shrink-0 text-muted-foreground" />}
      <span>{children}</span>
    </h1>
  );
}
