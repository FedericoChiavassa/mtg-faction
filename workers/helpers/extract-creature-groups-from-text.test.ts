import { describe, expect, it } from 'vitest';

import type { CreatureTypeSet } from './extract-creature-groups-from-text';
import { extractCreatureGroupsFromText } from './extract-creature-groups-from-text';

// Minimal test fixture for creature type set
const creatureTypeSet: CreatureTypeSet = {
  singularSet: new Set([
    'elf',
    'wizard',
    'dragon',
    'time lord',
    "c'tan",
    'ox',
    'assembly-worker',
  ]),
  pluralMap: new Map([
    ['elf', 'elf'],
    ['elves', 'elf'],
    ['wizard', 'wizard'],
    ['wizards', 'wizard'],
    ['dragon', 'dragon'],
    ['dragons', 'dragon'],
    ['time lord', 'time lord'],
    ['time lords', 'time lord'],
    ["c'tan", "c'tan"],
    ["c'tans", "c'tan"],
    ['ox', 'ox'],
    ['oxen', 'ox'],
    ['assembly-worker', 'assembly-worker'],
    ['assembly-workers', 'assembly-worker'],
  ]),
  maxTypeLength: 2, // max words in any creature type
};

describe('extractCreatureGroupsFromText', () => {
  const testCases: Array<{
    name: string;
    input: string;
    expected: string[][];
  }> = [
    {
      name: 'single creature type',
      input: 'Elf',
      expected: [['elf']],
    },
    {
      name: 'multiple types in one segment',
      input: 'Elf Wizard',
      expected: [['elf', 'wizard']],
    },
    {
      name: 'multi-word type',
      input: 'Time Lord Wizard',
      expected: [['time lord', 'wizard']],
    },
    {
      name: 'plurals converted to singulars',
      input: 'Elves Wizards Dragons',
      expected: [['elf', 'wizard', 'dragon']],
    },
    {
      name: 'possessive forms',
      input: "Dragon's Elf's",
      expected: [['dragon', 'elf']],
    },
    {
      name: 'types with apostrophes',
      input: "c'tan Wizard's",
      expected: [["c'tan", 'wizard']],
    },
    {
      name: 'hyphenated types',
      input: 'Assembly-Worker Wizard',
      expected: [['assembly-worker', 'wizard']],
    },
    {
      name: 'removes unrelated text and punctuation',
      input: "Elf, Wizard! Dragon? Ox; Time Lord: assembly-worker. c'tan",
      expected: [
        ['elf'],
        ['wizard'],
        ['dragon'],
        ['ox'],
        ['time lord'],
        ['assembly-worker'],
        ["c'tan"],
      ],
    },
    {
      name: 'segment boundaries with unknown words',
      input: 'Elf unknown Dragon',
      expected: [['elf'], ['dragon']],
    },
    {
      name: 'empty string returns empty array',
      input: '',
      expected: [],
    },
  ];

  testCases.forEach(({ name, input, expected }) => {
    it(name, () => {
      const result = extractCreatureGroupsFromText(input, creatureTypeSet);
      expect(result).toEqual(expected);
    });
  });
});
