import { cn } from '@/lib/utils';

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      data-slot="container"
      className={cn('mx-auto w-full max-w-262 px-6 max-md:px-4', className)}
    >
      {children}
    </div>
  );
}
