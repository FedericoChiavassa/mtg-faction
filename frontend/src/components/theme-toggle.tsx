import { Moon, Sun } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <Button
      size="icon"
      variant="ghost"
      title="Toggle Theme"
      className={cn('duration-0', className)}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <Sun className="preserve-animation-on-theme-change h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-transform duration-500 dark:scale-0 dark:-rotate-90" />
      <Moon className="preserve-animation-on-theme-change absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-transform duration-500 dark:scale-100 dark:rotate-0" />
    </Button>
  );
}
