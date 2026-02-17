import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { Swords } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/Container';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

const linkStyle = cva(
  'px-2.5 py-1.5 hover:bg-muted focus:not-hover:bg-transparent',
);

export function Navbar() {
  return (
    <header className="sticky top-0 z-100 flex h-12 w-full flex-row items-center border-b border-border/40 bg-background">
      <Container className="w-full">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                render={
                  <Link
                    to="/"
                    className="hover:bg-muted focus:not-hover:bg-transparent"
                  >
                    <Swords className="size-5" />
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
      </Container>
    </header>
  );
}
