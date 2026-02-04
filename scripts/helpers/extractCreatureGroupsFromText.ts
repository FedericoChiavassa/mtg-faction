type CreatureTypeSet = {
  singularSet: Set<string>;
  pluralMap: Map<string, string>;
  maxTypeLength: number;
};

function normalizeTextForCreatureScan(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/\(.*?\)/g, '') // remove reminder text
      // Punctuation that is never part of a creature type → hard segment break.
      // Notably ABSENT: hyphen (-) and apostrophe (') — those can be structural
      // inside types like "Assembly-Worker" and "C'tan".
      .replace(/[.,;:!?]/g, '|')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

// ---------------------------------------------------------------------------
// Single-token lookup helper.
// Returns the singular creature type if `token` (or its plural form) is known,
// otherwise undefined.
// ---------------------------------------------------------------------------
function lookupType(
  token: string,
  singularSet: Set<string>,
  pluralMap: Map<string, string>,
): string | undefined {
  const singular = pluralMap.get(token);
  if (singular && singularSet.has(singular)) return singular;
  return undefined;
}

// ---------------------------------------------------------------------------
// Fallback matching for a single token that failed the main loop.
//
// Two-stage strategy, in order:
//   1. Strip a trailing possessive "'s" and retry as a whole token.
//      Handles: "dragon's" → "dragon", "assembly-worker's" → "assembly-worker",
//               "c'tan's" → "c'tan"
//   2. Sub-tokenize on [-'] and scan the resulting parts left-to-right.
//      Only runs when the token actually contains - or ' — otherwise the
//      split would reproduce the original token, which was already tried
//      in the main loop.
//      Handles: "non-elf" → ["non","elf"] → "elf" matches
//      Does NOT fire for "assembly-worker" or "c'tan" because those
//      match in the main loop before we ever reach this fallback.
//
// Returns matched types (may be empty).
// ---------------------------------------------------------------------------
function fallbackMatchToken(
  token: string,
  singularSet: Set<string>,
  pluralMap: Map<string, string>,
): string[] {
  // Stage 1 — possessive strip.
  // Only strip literal "'s" at the end; this preserves the internal apostrophe
  // in types like "c'tan" while correctly peeling "dragon's" → "dragon".
  if (token.endsWith("'s")) {
    const stripped = token.slice(0, -2);
    const hit = lookupType(stripped, singularSet, pluralMap);
    if (hit) return [hit];
  }

  // Stage 2 — sub-tokenize on hyphen or apostrophe.
  if (token.includes('-') || token.includes("'")) {
    const parts = token.split(/[-']/);
    const matched: string[] = [];
    for (const part of parts) {
      if (!part) continue; // skip empty strings from leading/trailing delimiters
      const hit = lookupType(part, singularSet, pluralMap);
      if (hit && !matched.includes(hit)) {
        matched.push(hit);
      }
    }
    return matched;
  }

  return [];
}

// Extract creature type groups from text
export function extractCreatureGroupsFromText(
  text: string,
  creatureTypeSet: CreatureTypeSet,
): string[][] {
  const { singularSet, pluralMap, maxTypeLength } = creatureTypeSet;
  const normalized = normalizeTextForCreatureScan(text);
  const segments = normalized
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);

  const results: string[][] = [];

  for (const segment of segments) {
    const tokens = segment.split(' ');
    let i = 0;
    let currentGroup: string[] = [];

    while (i < tokens.length) {
      let matched = false;

      // Try longest match first (handles multi-word types like "Time Lord").
      // Tokens are still intact here — hyphens and apostrophes have NOT been
      // stripped — so "assembly-worker" and "c'tan" match as whole tokens.
      for (
        let len = Math.min(maxTypeLength, tokens.length - i);
        len > 0;
        len--
      ) {
        const raw = tokens.slice(i, i + len).join(' ');
        const singular = lookupType(raw, singularSet, pluralMap);

        if (singular) {
          if (!currentGroup.includes(singular)) {
            currentGroup.push(singular);
          }
          i += len;
          matched = true;
          break;
        }
      }

      if (!matched) {
        // The current token (or token run) didn't match anything whole.
        // Before giving up and breaking the group, try the two-stage fallback
        // on the single token at position i.  This is where "non-elf" →
        // "elf" and "dragon's" → "dragon" are recovered.
        const fallbackHits = fallbackMatchToken(
          tokens[i],
          singularSet,
          pluralMap,
        );

        if (fallbackHits.length > 0) {
          for (const hit of fallbackHits) {
            if (!currentGroup.includes(hit)) {
              currentGroup.push(hit);
            }
          }
          // Matched via fallback — do NOT flush the group; keep accumulating.
        } else {
          // Truly unrecognised token — this is a group boundary.
          if (currentGroup.length > 0) {
            results.push([...currentGroup]);
            currentGroup = [];
          }
        }
        i++;
      }
    }

    if (currentGroup.length > 0) {
      results.push([...currentGroup]);
    }
  }

  return results;
}
