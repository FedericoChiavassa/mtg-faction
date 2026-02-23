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

import { Separator } from '../ui/separator';

const linkStyle = cva(
  'px-2.5 py-1.5 hover:bg-muted focus:not-hover:bg-transparent',
);

const HeaderStyle = cva(
  'sticky flex h-12 w-full max-w-none flex-row items-center border-b border-border/40 bg-background',
);

export function SiteHeader() {
  return (
    <header className={cn(HeaderStyle(), 'top-0 z-50')}>
      <Container className="flex w-full items-center">
        <Link to="/" className="flex items-center gap-2">
          <Swords />
          <span className="text-xl font-semibold tracking-tight">Faction</span>
        </Link>

        <NavigationMenu className="ml-auto">
          <NavigationMenuList>
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
                  <Link to="/factions" className={cn(linkStyle())}>
                    Factions
                  </Link>
                }
              />
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                render={
                  <Link to="/rules" className={cn(linkStyle())}>
                    Rules
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
        <Separator className="mx-2 my-3" orientation="vertical" />
        <ThemeToggle className="-mr-0.5" />
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
