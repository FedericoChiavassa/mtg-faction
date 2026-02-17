import type { fetchFactionList } from '@/features/factions/api';

export function searchMatchesFaction(
  faction: Awaited<ReturnType<typeof fetchFactionList>>[number],
  search: string,
) {
  const q = search.toLowerCase().trim();
  if (!q) return true;

  const tokens = q.split(/\s+/);

  return tokens.every(t => faction.identity.some(i => i.startsWith(t)));
}
