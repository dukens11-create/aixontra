import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const localesDir = path.join(root, 'src', 'locales');
const baseLocale = 'en';
const supportedLocales = ['en', 'ht', 'fr', 'es', 'pt'];

function flatten(value, prefix = '') {
  if (Array.isArray(value)) {
    return { [prefix]: value.length };
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((acc, [key, nested]) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      return { ...acc, ...flatten(nested, nextPrefix) };
    }, {});
  }

  return { [prefix]: typeof value };
}

function readLocale(locale) {
  const filePath = path.join(localesDir, `${locale}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const baseEntries = flatten(readLocale(baseLocale));
const missingEntries = [];
const mismatchedEntries = [];

for (const locale of supportedLocales) {
  const currentEntries = flatten(readLocale(locale));
  for (const [key, baseShape] of Object.entries(baseEntries)) {
    if (!(key in currentEntries)) {
      missingEntries.push(`${locale}: ${key}`);
      continue;
    }

    if (currentEntries[key] !== baseShape) {
      mismatchedEntries.push(`${locale}: ${key} expected ${baseShape} received ${currentEntries[key]}`);
    }
  }
}

if (missingEntries.length > 0 || mismatchedEntries.length > 0) {
  if (missingEntries.length > 0) {
    console.error('Missing translation entries:');
    console.error(missingEntries.join('\n'));
  }

  if (mismatchedEntries.length > 0) {
    console.error('Mismatched translation shapes:');
    console.error(mismatchedEntries.join('\n'));
  }

  process.exit(1);
}

console.log(`Validated translation completeness for ${supportedLocales.length} locales.`);
