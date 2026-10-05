#!/usr/bin/env node
/**
 * Fails when styling bypasses the design tokens in src/styles/theme.css.
 *
 * Tailwind is the styling system, but its stock palette and arbitrary values
 * sit one autocomplete away from any component, which is how a token system
 * quietly dies. This check keeps theme.css the only source of visual values.
 *
 * Docs: docs/design/tokens.md
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'src');

/** theme.css defines the tokens, so it is the one place raw values belong. */
const ALLOWED_RAW_VALUES = new Set(['src/styles/theme.css']);

/**
 * Still light-themed; converting them is a visual redesign, not a token swap.
 * Delete these entries as each form is redesigned — do not add to this list.
 */
const PENDING_REDESIGN = new Set([
  'src/components/LoginForm.tsx',
  'src/components/SigninForm.tsx',
  'src/pages/AuthPage.tsx',
]);

const STOCK_HUES =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|' +
  'teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const COLOR_PROPS =
  'bg|text|border|from|to|via|ring|outline|divide|placeholder|decoration|caret|accent|shadow|fill|stroke';

const RULES = [
  {
    name: 'stock-palette',
    // bg-red-500, text-gray-400, border-blue-500 …
    re: new RegExp(`\\b(?:${COLOR_PROPS})-(?:${STOCK_HUES})-(?:50|[1-9]00|950)\\b`, 'g'),
    hint: 'use a brand token (bg-action, text-ink-muted, border-line, text-success …)',
  },
  {
    name: 'black-white',
    re: new RegExp(`\\b(?:${COLOR_PROPS})-(?:black|white)\\b`, 'g'),
    hint: 'use bg-canvas / bg-surface / text-ink / text-on-action instead',
  },
  {
    name: 'arbitrary-color',
    // bg-[#F5F5F5], text-[rgb(…)]
    re: /\b(?:[a-z-]+)-\[(?:#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/g,
    hint: 'add the value to theme.css and use the generated utility',
  },
  {
    name: 'raw-hex',
    re: /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?\b/g,
    hint: 'colors belong in src/styles/theme.css only',
    appliesTo: (rel) => !ALLOWED_RAW_VALUES.has(rel),
  },
];

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const files = walk(SRC).filter((f) => /\.(tsx?|jsx?|css)$/.test(f));

let failures = 0;
let skipped = 0;

for (const file of files) {
  const rel = relative(ROOT, file);
  if (PENDING_REDESIGN.has(rel)) {
    skipped += 1;
    continue;
  }

  const lines = readFileSync(file, 'utf8').split('\n');
  for (const rule of RULES) {
    if (rule.appliesTo && !rule.appliesTo(rel)) continue;
    lines.forEach((line, i) => {
      for (const match of line.matchAll(rule.re)) {
        failures += 1;
        console.error(
          `${rel}:${i + 1}  ${match[0]}\n    ${rule.name}: ${rule.hint}`,
        );
      }
    });
  }
}

if (skipped) {
  console.log(
    `\nlint:tokens — ${skipped} file(s) skipped pending redesign (see PENDING_REDESIGN).`,
  );
}

if (failures) {
  console.error(`\nlint:tokens failed: ${failures} violation(s).`);
  process.exit(1);
}

console.log(`lint:tokens passed — ${files.length - skipped} file(s) clean.`);
