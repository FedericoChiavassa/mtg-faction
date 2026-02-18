import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { Swords } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/container';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

const linkStyle = cva(
  'px-2.5 py-1.5 hover:bg-muted focus:not-hover:bg-transparent',
);

const HeaderStyle = cva(
  'sticky flex h-12 w-full max-w-none flex-row items-center border-b border-border/40 bg-background',
);

export function SiteHeader() {
  return (
    <header className={cn(HeaderStyle(), 'top-0 z-50')}>
      <Container className="flex w-full">
        <NavigationMenu>
          <NavigationMenuList className="justify-start">
            <NavigationMenuItem>
              <NavigationMenuLink
                render={
                  <Link
                    to="/"
                    className="-ml-2 hover:bg-muted focus:not-hover:bg-transparent"
                  >
                    <Swords className="size-5" />
                  </Link>
                }
              />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                render={
                  <Link
                    to="/rules"
                    className={cn(linkStyle())}
                    activeProps={{ className: 'bg-muted' }}
                  >
                    Rules
                  </Link>
                }
              />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                render={
                  <Link to="/factions" className={cn(linkStyle())}>
                    Factions
                  </Link>
                }
              />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                render={
                  <Link to="/cards" className={cn(linkStyle())}>
                    Cards
                  </Link>
                }
              />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                render={
                  <Link to="/about" className={cn(linkStyle())}>
                    About
                  </Link>
                }
              />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <ThemeToggle className="-mr-2 ml-auto" />
      </Container>
    </header>
  );
}

export function SubHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="sub-header"
      className={cn(HeaderStyle(), 'top-12 z-40', className)}
    >
      <Container className="flex w-full">{children}</Container>
    </div>
  );
}
