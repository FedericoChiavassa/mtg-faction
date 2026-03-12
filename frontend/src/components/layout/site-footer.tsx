import { Link } from '@tanstack/react-router';

import { Container } from '@/components/layout/container';

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <Container className="px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Faction
            </h3>
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              <p>A community format for Magic: The Gathering.</p>
              <p>
                Build decks around creature-type factions and explore a
                flavorful way to play Magic.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-3 text-sm">
            <h4 className="font-medium text-foreground">Explore</h4>
            <Link
              to="/"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>
            <Link
              to="/factions"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Factions
            </Link>
            <Link
              to="/cards"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Cards
            </Link>
            <Link
              to="/rules"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Rules
            </Link>
            <Link
              to="/about"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Contact
            </Link>
          </nav>

          {/* Legal */}
          <div className="text-xs text-muted-foreground">
            <h4 className="text-sm font-medium text-foreground">Legal</h4>
            <p className="mt-3">
              Faction is unofficial Fan Content permitted under the Wizards of
              the Coast Fan Content Policy.
            </p>
            <p className="mt-2">
              Not affiliated with or endorsed by Wizards of the Coast.
            </p>
            <p className="mt-2">
              Portions of the materials used are property of Wizards of the
              Coast. ©Wizards of the Coast LLC.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Faction. Community-created format.
        </div>
      </Container>
    </footer>
  );
}
