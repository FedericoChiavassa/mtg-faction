import type { fetchAllFactions } from '@/features/factions/api';

export function matchesFaction(
  faction: Awaited<ReturnType<typeof fetchAllFactions>>[number],
  search: string,
) {
  const q = search.toLowerCase().trim();
  if (!q) return true;

  const tokens = q.split(/\s+/);

  return tokens.every(t => faction.identity.some(i => i.startsWith(t)));
}
