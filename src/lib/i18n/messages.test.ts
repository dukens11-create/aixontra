import { describe, expect, it } from 'vitest';
import en from '../../locales/en.json';
import es from '../../locales/es.json';
import fr from '../../locales/fr.json';
import ht from '../../locales/ht.json';
import pt from '../../locales/pt.json';

function flatten(value: unknown, prefix = ''): Record<string, string | number> {
  if (Array.isArray(value)) {
    return { [prefix]: value.length };
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce<Record<string, string | number>>((accumulator, [key, nested]) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      return { ...accumulator, ...flatten(nested, nextPrefix) };
    }, {});
  }

  return { [prefix]: typeof value };
}

describe('translation messages', () => {
  it('keeps all locale files aligned with English', () => {
    const baseEntries = flatten(en);

    for (const locale of [es, fr, ht, pt]) {
      const localeEntries = flatten(locale);
      expect(localeEntries).toEqual(baseEntries);
    }
  });
});
