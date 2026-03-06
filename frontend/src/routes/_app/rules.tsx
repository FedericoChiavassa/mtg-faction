import { useEffect } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowRight,
  Check,
  Flag,
  Hash,
  Layers,
  type LucideIcon,
  OctagonAlert,
  OctagonX,
  PawPrint,
  SendToBack,
  Sparkles,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Container } from '@/components/layout/container';
import {
  PageHeader,
  PageHeaderCaption,
  PageHeaderTitle,
} from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const Route = createFileRoute('/_app/rules')({
  component: RulesRoute,
});

// ─── Route ───────────────────────────────────────────────────────────────────

function RulesRoute() {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('scroll-smooth');
    return () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      root.classList.remove('scroll-smooth');
    };
  }, []);

  return (
    <>
      <PageHeader>
        <div className="flex items-end justify-between gap-4">
          <div>
            <PageHeaderCaption>Format</PageHeaderCaption>
            <PageHeaderTitle>Rules</PageHeaderTitle>
          </div>
          {/* <Badge
            variant="outline"
            className="mb-0.5 hidden text-xs text-muted-foreground sm:flex"
          >
            v0.1
          </Badge> */}
        </div>
      </PageHeader>

      {/* Body */}
      <Container className="py-10">
        <div className="flex gap-12">
          <TableOfContents />

          <article className="max-w-[68ch] min-w-0 flex-1 space-y-10">
            {/* 1. Overview */}
            <RuleSection number={1} id="overview" title="Overview">
              <p>
                In Faction{' '}
                <Highlight>each deck is built around a Faction</Highlight>,
                which is a combination of creature types.
              </p>
              <p>You may include:</p>
              <RuleList
                items={[
                  <>
                    Creature cards whose creature types exactly match your
                    chosen Faction
                  </>,
                  <>
                    Non-creature cards that mention one or more creature types{' '}
                    from your Faction
                  </>,
                ]}
              />
            </RuleSection>

            <Separator />

            {/* 2. Deck Size */}
            <RuleSection
              number={2}
              icon={Layers}
              id="deck-size"
              title="Deck Size"
            >
              <p>Two deck size variants are allowed:</p>
              <div className="space-y-1.5 pl-1">
                <RuleList>
                  {[
                    { size: '60-card', side: '15' },
                    { size: '40-card', side: '10' },
                  ].map(({ size, side }) => (
                    <li key={size}>
                      <span>
                        Minimum{' '}
                        <strong className="font-semibold text-foreground">
                          {size}
                        </strong>{' '}
                        deck with up to{' '}
                        <strong className="font-semibold text-foreground">
                          {side} cards
                        </strong>{' '}
                        in the sideboard
                      </span>
                    </li>
                  ))}
                </RuleList>
              </div>
              <div>
                Up to 4 copies of each card are allowed, except for basic lands
              </div>
            </RuleSection>

            <Separator />

            {/* 3. Choosing a Faction */}
            <RuleSection
              number={3}
              icon={Flag}
              id="choosing-a-faction"
              title="Choosing a Faction"
            >
              <p>
                A Faction is the full{' '}
                <Highlight>combination of creature types</Highlight> that appear
                on a creature card&apos;s type line.
              </p>
              <p>Examples:</p>
              <Card className="p-4 shadow-none">
                <CardContent className="p-0">
                  <div className="flex flex-wrap gap-2">
                    <TypeBadge>Human</TypeBadge>
                    <TypeBadge>Human Wizard Sorcerer</TypeBadge>
                    <TypeBadge>Elf Druid</TypeBadge>
                  </div>
                </CardContent>
              </Card>
              <p>
                Your deck&apos;s legality depends on the creature types
                contained in your chosen Faction.
              </p>
              <div className="pt-1">
                <Link
                  to="/factions"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground underline-offset-4 hover:underline"
                >
                  Browse all factions
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </RuleSection>

            <Separator />

            {/* 4. Creature Cards */}
            <RuleSection
              number={4}
              icon={PawPrint}
              id="creature-cards"
              title="Creature Cards"
            >
              <p>
                You may include any creature card whose creature types{' '}
                <strong className="font-semibold text-foreground">
                  exactly match
                </strong>{' '}
                your chosen Faction.
              </p>
              <p>
                Examples for the Faction <TypeBadge>Human Wizard</TypeBadge>:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="gap-4 py-4 shadow-none">
                  <CardHeader className="px-4">
                    <CardTitle className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-muted-foreground/70 uppercase">
                      <Check className="h-3 w-3 text-foreground" />
                      Allowed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-2">
                    <TypeBadge>Human Wizard</TypeBadge>
                  </CardContent>
                </Card>
                <Card className="gap-4 py-4 shadow-none">
                  <CardHeader className="px-4">
                    <CardTitle className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-muted-foreground/70 uppercase">
                      <X className="h-3 w-3 text-foreground" />
                      Not allowed
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 px-4 pb-2">
                    {[
                      'Human',
                      'Wizard',
                      'Human Cleric',
                      'Human Wizard Warrior',
                    ].map(t => (
                      <div key={t}>
                        <TypeBadge>{t}</TypeBadge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </RuleSection>

            <Separator />

            {/* 5. Non-Creature Cards */}
            <RuleSection
              number={5}
              icon={Sparkles}
              id="non-creature-cards"
              title="Non-Creature Cards"
            >
              <p>
                You may include any non-creature card (including lands) that
                <Highlight>
                  {' '}
                  mentions your Faction or part of your Faction
                </Highlight>{' '}
                in its:
              </p>
              <RuleList items={['Name', 'Type line', 'Oracle text']} />
              <p className="text-[13px] text-muted-foreground/60 italic">
                Flavor text is ignored.
              </p>
              <p>
                Example for the Faction <TypeBadge>Human Wizard</TypeBadge>:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="gap-4 py-4 shadow-none">
                  <CardHeader className="px-4">
                    <CardTitle className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-muted-foreground/70 uppercase">
                      <Check className="h-3 w-3 text-foreground" />
                      Allowed if card mentions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 px-4 pb-2">
                    {['Human', 'Wizard', 'Human Wizard'].map(t => (
                      <div key={t}>
                        <TypeBadge>{t}</TypeBadge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="gap-4 py-4 shadow-none">
                  <CardHeader className="px-4">
                    <CardTitle className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-muted-foreground/70 uppercase">
                      <X className="h-3 w-3 text-foreground" />
                      Not allowed if card mentions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <TypeBadge>Human Wizard Warrior</TypeBadge>
                  </CardContent>
                </Card>
              </div>

              {/* 5a. Nested Types — subsection */}
              <div
                id="nested-types"
                className="mt-5 scroll-mt-24 space-y-3 rounded-md border border-border bg-muted/40 px-4 py-4"
              >
                <div className="flex items-center gap-2">
                  <OctagonAlert className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Nested Types
                  </p>
                </div>
                <p className="text-sm leading-relaxed">
                  If a non-creature card references both a creature type and a
                  more specific combination containing that type,{' '}
                  <Highlight>only the more specific</Highlight> combination is
                  considered.
                </p>
                <Card className="p-4 shadow-none">
                  <CardContent className="space-y-2 px-0 text-[13px]">
                    <p className="text-muted-foreground">
                      If a non-creature card references both{' '}
                      <TypeBadge>Elf</TypeBadge> and{' '}
                      <TypeBadge>Elf Warrior</TypeBadge>:
                    </p>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="text-foreground">
                        Only <TypeBadge>Elf Warrior</TypeBadge> is used
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </RuleSection>

            <Separator />

            {/* 6. Cards Without Creature Types */}
            <RuleSection
              number={6}
              icon={OctagonX}
              id="no-creature-types"
              title="Cards Without Creature Types"
            >
              <p>
                Cards that do not reference any creature type cannot be included
                in any deck.
              </p>
              <Card className="gap-4 py-4 shadow-none">
                <CardHeader className="px-4">
                  <CardTitle className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-muted-foreground/70 uppercase">
                    <OctagonAlert className="h-3 w-3 text-foreground" />
                    Exception
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2 px-4 pb-2 text-sm">
                  <Check className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span>Basic lands</span>
                </CardContent>
              </Card>
            </RuleSection>

            <Separator />

            {/* 7. Double-Faced Cards */}
            <RuleSection
              id="dfc"
              number={7}
              icon={SendToBack}
              title="Double-Faced Cards"
            >
              <ul className="space-y-6">
                {/* Creature / Creature */}
                <li className="space-y-3">
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase">
                    Creature / Creature
                  </p>
                  <RuleList
                    items={[
                      "If the faces have the same creature types, that's the faction.",
                      "If one face's combination is a subset of the other, only the larger combination is used.",
                      'Otherwise, the card has no faction.',
                    ]}
                  />
                  <p>Examples:</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        label: 'Example 1',
                        faceA: 'Elf Warrior',
                        faceB: 'Elf',
                        result: <TypeBadge>Elf Warrior</TypeBadge>,
                      },
                      {
                        label: 'Example 2',
                        faceA: 'Human Wizard',
                        faceB: 'Elf',
                        result: (
                          <span className="text-muted-foreground">
                            No faction
                          </span>
                        ),
                      },
                    ].map(({ label, faceA, faceB, result }) => (
                      <Card key={label} className="gap-4 py-4 shadow-none">
                        <CardContent className="space-y-1.5 px-4 pb-0 text-[13px]">
                          <div className="flex items-center gap-2">
                            <span className="w-12 shrink-0 text-xs text-muted-foreground/60">
                              Face A
                            </span>
                            <TypeBadge>{faceA}</TypeBadge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-12 shrink-0 text-xs text-muted-foreground/60">
                              Face B
                            </span>
                            <TypeBadge>{faceB}</TypeBadge>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2 border-t border-border pt-3">
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            {result}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </li>

                {/* Creature / Non-Creature */}
                <li className="space-y-2">
                  <p className="inline text-xs font-semibold tracking-widest uppercase">
                    Creature / Non-Creature
                  </p>
                  <RuleList
                    items={[
                      'The card uses the faction of the creature face only.',
                    ]}
                  />
                </li>

                {/* Non-Creature / Non-Creature */}
                <li className="space-y-2">
                  <p className="inline text-xs font-semibold tracking-widest uppercase">
                    Non-Creature / Non-Creature
                  </p>
                  <RuleList
                    items={[
                      'The card follows the same rules as a normal non-creature card.',
                    ]}
                  />
                </li>
              </ul>
            </RuleSection>

            <Separator />

            {/* 8. Example */}
            <RuleSection number={8} id="example" title="Example">
              <p>
                If your Faction is <TypeBadge>Human Wizard</TypeBadge>:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="gap-4 py-4 shadow-none">
                  <CardHeader className="px-4">
                    <CardTitle className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-muted-foreground/70 uppercase">
                      <Check className="h-3 w-3 text-foreground" />
                      You may include
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-2 text-[13px]">
                    <RuleList
                      items={[
                        <span key={1} className="inline-flex flex-col gap-1.5">
                          Creature cards that are exactly
                          <TypeBadge>Human Wizard</TypeBadge>
                        </span>,
                        <span key={2} className="inline-flex flex-col gap-1.5">
                          Non-creature cards mentioning
                          <div className="flex flex-col gap-1.5">
                            <TypeBadge>Human</TypeBadge>
                            <TypeBadge>Wizard</TypeBadge>
                            <TypeBadge>Human Wizard</TypeBadge>
                          </div>
                        </span>,
                      ]}
                    />
                  </CardContent>
                </Card>
                <Card className="gap-4 py-4 shadow-none">
                  <CardHeader className="px-4">
                    <CardTitle className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-muted-foreground/70 uppercase">
                      <X className="h-3 w-3 text-foreground" />
                      You may not include
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-2 text-[13px]">
                    <RuleList
                      items={[
                        <span key={1} className="inline-flex flex-col gap-1.5">
                          Creatures like
                          <div className="flex flex-col gap-1.5">
                            <TypeBadge>Human</TypeBadge>
                            <TypeBadge>Human Cleric</TypeBadge>
                            <TypeBadge>Human Wizard Warrior</TypeBadge>
                          </div>
                        </span>,
                        <span key={2} className="inline-flex flex-col gap-1.5">
                          Non-creature cards mentioning{' '}
                          <TypeBadge>Human Wizard Warrior</TypeBadge>
                        </span>,
                        <span key={3}>
                          Cards that mention no creature types
                        </span>,
                      ]}
                    />
                  </CardContent>
                </Card>
              </div>
            </RuleSection>
          </article>
        </div>
      </Container>
    </>
  );
}

// ─── Primitives ──────────────────────────────────────────────────────────────

function TypeBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn('px-1.5 py-0 font-mono text-xs font-medium', className)}
    >
      {children}
    </Badge>
  );
}

function RuleList(
  props:
    | { items?: (string | React.ReactNode)[]; children?: never }
    | { children?: React.ReactNode; items?: never },
) {
  const { items, children } = props;
  return (
    <ul className="list-inside list-disc space-y-1.5 marker:text-xs marker:text-muted-foreground/40">
      {items?.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
      {children}
    </ul>
  );
}

function RuleSection({
  id,
  number,
  title,
  children,
  icon: Icon,
}: {
  id: string;
  number: number;
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <section id={id} className="group scroll-mt-21.5">
      <a
        href={`#${id}`}
        className="group/a mb-4 flex items-baseline gap-3 no-underline"
      >
        <span className="w-5 shrink-0 text-[11px] font-semibold tracking-widest text-muted-foreground/50 uppercase tabular-nums">
          {String(number).padStart(2, '0')}
        </span>
        <h2 className="flex items-center text-base font-semibold text-foreground transition-colors duration-150 group-hover/a:text-foreground/80">
          {title}
          {Icon && <Icon className="ml-1.5 size-3.5" />}
        </h2>
        <Hash className="ml-auto h-3 w-3 shrink-0 self-center text-muted-foreground/30 opacity-0 transition-opacity group-hover:opacity-100" />
      </a>
      <div className="space-y-3 pl-8 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function Highlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('font-semibold text-foreground', className)}>
      {children}
    </span>
  );
}

// ─── Table of Contents ───────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'overview', title: 'Overview', indent: false },
  { id: 'deck-size', title: 'Deck Size', indent: false },
  { id: 'choosing-a-faction', title: 'Choosing a Faction', indent: false },
  { id: 'creature-cards', title: 'Creature Cards', indent: false },
  { id: 'non-creature-cards', title: 'Non-Creature Cards', indent: false },
  // { id: 'nested-types', title: 'Nested Types', indent: true },
  {
    id: 'no-creature-types',
    title: 'Cards Without Creature Types',
    indent: false,
  },
  { id: 'dfc', title: 'Double-Faced Cards', indent: false },
  { id: 'example', title: 'Example', indent: false },
];

function TableOfContents() {
  return (
    <nav className="sticky top-24 hidden w-48 shrink-0 self-start lg:block">
      <p className="mb-3 text-[10px] font-semibold tracking-[0.15em] text-muted-foreground/60 uppercase">
        Contents
      </p>
      <ol className="space-y-px">
        {SECTIONS.map(({ id, title, indent }) => (
          <li key={id} className={indent ? 'ml-4' : ''}>
            <a
              href={`#${id}`}
              className="group flex items-baseline gap-2 py-1 text-[13px] text-muted-foreground transition-colors duration-100 hover:text-foreground"
            >
              {!indent && (
                <span className="w-4 shrink-0 text-[11px] text-muted-foreground/30 tabular-nums group-hover:text-muted-foreground/50">
                  {SECTIONS.filter(s => !s.indent).findIndex(s => s.id === id) +
                    1}
                </span>
              )}
              {indent && <span className="w-4 shrink-0" />}
              {title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
