import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import {
  ArrowRight,
  Flag,
  Info,
  Layers,
  Mail,
  Menu,
  ScrollText,
  Swords,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/container';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
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
  'sticky flex h-12 w-full max-w-none flex-row items-center border-b bg-background',
);

const navLinks = [
  { to: '/factions', label: 'Factions', icon: Flag },
  { to: '/cards', label: 'Cards', icon: Layers },
  { to: '/rules', label: 'Rules', icon: ScrollText },
  { to: '/about', label: 'About', icon: Info },
  { to: '/contact', label: 'Contact', icon: Mail, hideOnDesktop: true },
];

const Logo = () => (
  <Link to="/" className="relative flex items-center gap-2 max-md:ml-2">
    <Swords className="size-5 max-md:absolute max-md:right-[calc(100%+8px)]" />
    <span className="text-lg font-semibold tracking-tight">Faction</span>
  </Link>
);

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className={cn(HeaderStyle(), 'top-0 z-50')}>
      <Container className="flex w-full items-center">
        <div className="hidden items-center gap-2 md:flex">
          <Logo />
          <p className="mt-0.75 text-xs text-muted-foreground/50">
            ·&nbsp;&nbsp;MTG format
          </p>
        </div>

        {/* Desktop nav */}
        <NavigationMenu className="ml-auto hidden md:flex">
          <NavigationMenuList>
            {navLinks
              .filter(({ hideOnDesktop }) => !hideOnDesktop)
              .map(({ to, label }) => (
                <NavigationMenuItem key={to}>
                  <NavigationMenuLink
                    render={
                      <Link to={to} className={cn(linkStyle())}>
                        {label}
                      </Link>
                    }
                  />
                </NavigationMenuItem>
              ))}
          </NavigationMenuList>
        </NavigationMenu>

        <Separator
          orientation="vertical"
          className="mx-2 my-3 hidden md:block"
        />
        <ThemeToggle className="-mr-0.5 hidden md:flex" />

        {/* Mobile drawer */}
        <div className="flex flex-1 items-center justify-between md:hidden">
          <Drawer open={open} direction="left" onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <div className="flex-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="-ml-3"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
              </div>
            </DrawerTrigger>
            <DrawerContent className="w-64">
              <DrawerHeader className="pb-0">
                <DrawerTitle className="flex items-center gap-2">
                  <Swords className="size-4" />
                  Faction
                </DrawerTitle>
                <p className="pt-2 text-xs font-medium text-muted-foreground">
                  Magic: The Gathering format
                </p>
              </DrawerHeader>

              <Separator className="mt-4" />

              <nav className="flex flex-col gap-2.5 p-4">
                {navLinks.map(({ to, label, icon: Icon }) => (
                  <Button
                    key={to}
                    variant="outline"
                    nativeButton={false}
                    className="gap-2 shadow-none"
                    render={
                      <Link to={to} onClick={() => setOpen(false)}>
                        <Icon className="shrink-0 text-muted-foreground" />
                        <span>{label}</span>
                        <ArrowRight
                          size={10}
                          className="ml-auto shrink-0 text-muted-foreground"
                        />
                      </Link>
                    }
                  />
                ))}
              </nav>

              <div className="mt-auto border-t p-4">
                <p className="text-xs text-muted-foreground/50">
                  Factions is a community format for Magic: The Gathering
                  centered on creature types, featuring unique faction-based
                  deck-building.
                </p>
              </div>
            </DrawerContent>
          </Drawer>

          <Logo />

          <div className="flex flex-1 items-center justify-end">
            <ThemeToggle className="-mr-3" />
          </div>
        </div>
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
