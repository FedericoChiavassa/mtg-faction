import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Shuffle } from 'lucide-react';

import { Container } from '@/components/layout/container';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteLogo } from '@/components/site-logo';
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

      <main className="just relative flex min-h-dvh w-full flex-col items-center overflow-hidden pb-15 text-center">
        <div className="relative z-10 mx-auto mt-auto flex max-w-dvw flex-col px-4">
          <h1 className="relative left-4.5 mx-auto flex w-fit items-center justify-center gap-2 text-5xl font-semibold tracking-tight md:text-6xl">
            <Link
              to="/cards"
              className="absolute right-full mr-2 cursor-pointer"
            >
              <SiteLogo className="group/card-swap size-14" />
            </Link>
            Faction
          </h1>

          <p className="mt-6 text-2xl text-muted-foreground">
            A community format for{' '}
            <span className="text-pretty whitespace-nowrap">
              Magic: The Gathering
            </span>
          </p>

          <div className="mx-auto mt-9 flex max-w-full items-center justify-center gap-2 overflow-hidden max-md:mx-0">
            <FactionCombobox
              className="max-w-none text-start max-md:w-full"
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
        <p className="mt-auto px-4 text-sm text-pretty text-muted-foreground/50">
          Build decks around creature-type factions and explore a flavorful way
          to play Magic
        </p>
      </main>

      <SiteFooter />
    </>
  );
}
