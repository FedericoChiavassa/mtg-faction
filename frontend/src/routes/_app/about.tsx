import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowRight,
  CircleDot,
  FlaskConical,
  Info,
  Shuffle,
} from 'lucide-react';

import { Container } from '@/components/layout/container';
import {
  PageHeader,
  PageHeaderCaption,
  PageHeaderTitle,
} from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const Route = createFileRoute('/_app/about')({
  component: AboutRoute,
});

// ─── Route ───────────────────────────────────────────────────────────────────

function AboutRoute() {
  return (
    <>
      {/* Page header */}
      <PageHeader>
        <PageHeaderCaption>Format</PageHeaderCaption>
        <PageHeaderTitle icon={Info}>About</PageHeaderTitle>
      </PageHeader>

      {/* Body */}
      <Container className="pt-10 pb-20 max-md:pb-15">
        <article className="max-w-[68ch] space-y-10">
          {/* About the Format */}
          <Section id="about" title="About the Format">
            <p>
              Faction is a community-created Magic: The Gathering format
              centered around creature-type combinations.
            </p>
            <p>
              Each deck is defined by a specific Faction, creating a unique card
              pool and new deckbuilding challenges and constraints.
            </p>
            <p>
              The format aims to create a diverse deckbuilding environment
              compared to traditional formats, enforcing flavorful deck
              construction across the entire Magic card pool.
            </p>
            <div className="flex gap-4 pt-1">
              <Link
                to="/rules"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground underline-offset-4 hover:underline"
              >
                Read the rules
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/factions"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground underline-offset-4 hover:underline"
              >
                Browse factions
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Section>

          <Separator />

          {/* Current Status */}
          <Section id="status" icon={FlaskConical} title="Current Status">
            <p>Faction is a new and experimental format.</p>
            <p>
              The rules and card pool have not been extensively playtested, and
              the format is still in its early stages. As more games are played,
              balance issues may emerge.
            </p>
            <p>Because of this:</p>
            <ProseList
              items={[
                'The rules may evolve over time',
                'Certain cards may eventually be banned or restricted',
                'Additional clarifications or rule adjustments may be introduced',
              ]}
            />
          </Section>

          <Separator />

          {/* Possible Future Changes */}
          <Section id="future" icon={Shuffle} title="Possible Future Changes">
            <p>
              Several adjustments are being considered to improve the viability
              of certain factions.
            </p>
            <div className="space-y-3 pt-1">
              <ChangeCard title="Changeling support">
                Cards with Changeling could become playable in any Faction. This
                may help factions that currently have very few creature cards
                available, while also giving them access to additional
                non-creature cards.
              </ChangeCard>
              <ChangeCard title="Generic creature-type references">
                Non-creature cards that do not reference a specific creature
                type but include the text &quot;creature type&quot; could become
                playable in any Faction. This could help factions that currently
                have limited non-creature card options.
              </ChangeCard>
              <ChangeCard title="Adding keywords">
                Some keywords associated with specific creature types could be
                added, allowing more cards to become playable in related
                factions.
              </ChangeCard>
              <ChangeCard title="Format fragmentation">
                The format could eventually introduce different tiers based on
                the number of creature and non-creature cards available to each
                faction.
              </ChangeCard>
            </div>
            <p className="text-[13px] text-muted-foreground/60 italic">
              These ideas are exploratory and may evolve as the format develops.
            </p>
          </Section>

          <Separator />

          {/* Website Roadmap */}
          <Section id="roadmap" icon={CircleDot} title="Website Roadmap">
            <p>
              This website is also a work in progress and may gain additional
              features in the future.
            </p>
            <p>Possible upgrades include:</p>
            <ProseList
              items={[
                'Filtering the Faction card pool by other format legalities (Standard, Modern, Commander, etc.)',
                'Supporting variants of the format based on those legality filters',
                'Additional tools for browsing factions and their available cards',
              ]}
            />
          </Section>

          <Separator />

          {/* Closing */}
          <Section id="closing" title="Closing">
            <p>
              Faction is still in its early stages, and the format may continue
              to evolve based on community play and feedback.
            </p>
            <p>
              Whether you want to share new ideas, report technical issues, or
              suggest improvements to the ruleset or the website, send us a
              message.
            </p>

            <Link
              to="/contact"
              className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground underline-offset-4 hover:underline"
            >
              Get in touch
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Section>
        </article>
      </Container>
    </>
  );
}

// ─── Primitives ──────────────────────────────────────────────────────────────

function Section({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function ProseList({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul className="list-inside list-disc space-y-1.5 marker:text-xs marker:text-muted-foreground/40">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function ChangeCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card size="sm" className="shadow-none">
      <CardContent className="space-y-1">
        <p className="text-[13px] font-semibold text-foreground">{title}</p>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {children}
        </p>
      </CardContent>
    </Card>
  );
}
