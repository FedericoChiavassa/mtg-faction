import { cn } from '@/lib/utils';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      data-slot="container"
      className={cn('mx-auto max-w-7xl px-6', className)}
    >
      {children}
    </div>
  );
}
