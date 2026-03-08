import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Shuffle } from 'lucide-react';

import { Container } from '@/components/layout/container';
import { SiteFooter } from '@/components/layout/site-footer';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useFactionList } from '@/features/factions/queries';
import { FactionCombobox } from '@/features/factions/ui/faction-combobox';

export const Route = createFileRoute('/')({
  component: HomeRoute,
});

function HomeRoute() {
  const navigate = Route.useNavigate();
  const { data: factionList, isLoading: isFactionListLoading } =
    useFactionList();

  return (
    <>
      <Container className="absolute z-50 flex h-12 items-center self-center bg-transparent">
        <ThemeToggle className="-mr-2 ml-auto" />
      </Container>

      <main className="relative flex min-h-dvh w-full flex-col overflow-hidden pt-60 pb-28 text-center">
        <div className="relative z-10 mx-auto max-w-3xl px-6">
          <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">
            Faction
          </h1>

          <p className="mt-6 text-xl text-muted-foreground">
            A community format for Magic: The Gathering.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Build decks around creature-type factions and explore a flavorful
            way to play Magic.
          </p>

          <div className="mx-auto mt-9 flex items-center justify-center gap-2">
            <FactionCombobox
              className="max-w-none text-start"
              placeholder="Select a faction to browse its cards..."
              onValueChange={selectedFaction => {
                void navigate({
                  to: '/cards',
                  search: {
                    faction: selectedFaction,
                  },
                  state: {
                    disablePlaceholderData: true,
                  },
                });
              }}
            />

            <Button
              size="icon"
              variant="outline"
              nativeButton={false}
              title="Random faction cards"
              disabled={isFactionListLoading}
              render={
                <Link
                  to="/cards"
                  state={{ disablePlaceholderData: true }}
                  search={() => ({
                    faction:
                      factionList?.[
                        Math.floor(Math.random() * factionList.length)
                      ].id,
                  })}
                />
              }
            >
              {isFactionListLoading ? <Spinner /> : <Shuffle />}
            </Button>
          </div>

          <div className="mt-10 flex justify-center gap-4">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link to={'/factions'} />}
            >
              Explore Factions
              <ArrowRight />
            </Button>

            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link to={'/rules'} />}
            >
              Read the Rules
            </Button>
          </div>

          <div className="mt-14">
            <Button
              size="xs"
              variant="link"
              nativeButton={false}
              render={<Link to={'/about'} />}
              className="text-muted-foreground"
            >
              About the format
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />

      {/* <BackgroundMagicAura /> */}
    </>
  );
}

// function BackgroundMagicAura() {
//   return (
//     <div
//       aria-hidden
//       data-slot="background-magic-aura"
//       className="pointer-events-none absolute inset-0 overflow-hidden"
//     >
//       {/* White */}
//       <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-yellow-200/10 blur-3xl" />

//       {/* Blue */}
//       <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />

//       {/* Black */}
//       <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-purple-900/10 blur-3xl" />

//       {/* Red */}
//       <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />

//       {/* Green (center glow) */}
//       <div className="absolute top-1/2 left-1/2 h-128 w-lg -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/5 blur-3xl" />
//     </div>
//   );
// }
