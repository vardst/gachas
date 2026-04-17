// Generates one .tsx file per gacha TYPE (not per combo).
// Types = 12 named flavors + ~27 generic buckets (distribution × guarantee-family).
// Each file is a thin wrapper that delegates to TypePlayer with the right typeKey.
// The manifest maps every combo slug -> its type file (for URL routing).

import { writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '..', 'src', 'components', 'gachas');
const INDEX_FILE = join(OUT_DIR, 'index.ts');

// --- Axes (mirrors src/data/primitives.ts) ---
const distributions = ['flat', 'step_up', 'box', 'preview', 'sugoroku', 'wishlist'];
const banners = ['standard', 'limited', 'weapon', 'fes', 'collab', 'dual'];
const guarantees = ['pure', 'batch', 'hard', 'soft', 'pity_5050', 'pity_7030', 'radiance', 'spark_only', 'spark_pity', 'shards', 'shards_pity', 'full_suite'];
const currencies = ['single', 'dual', 'tickets'];

function isValid(d, b, g, c) {
  if (d === 'preview') {
    if (['pity_5050', 'pity_7030', 'radiance', 'full_suite'].includes(g)) return false;
    if (c === 'tickets') return false;
  }
  if (d === 'box') {
    if (['spark_only', 'spark_pity', 'full_suite'].includes(g)) return false;
  }
  if (d === 'wishlist') {
    if (['pity_5050', 'pity_7030', 'radiance'].includes(g)) return false;
  }
  if (['pity_5050', 'pity_7030', 'radiance', 'full_suite'].includes(g)) {
    if (b === 'standard') return false;
  }
  if (d === 'sugoroku' && g === 'full_suite') return false;
  if (b === 'collab' && c === 'single') return false;
  if (b === 'dual' && ['pure', 'batch', 'hard', 'soft', 'spark_only', 'shards'].includes(g)) return false;
  if (b === 'weapon' && g === 'pure') return false;
  return true;
}

function guaranteeFamily(g) {
  if (g === 'pure') return 'pure';
  if (g === 'batch') return 'batch';
  if (g === 'full_suite') return 'full';
  if (['hard', 'soft', 'pity_5050', 'pity_7030', 'radiance'].includes(g)) return 'pity';
  if (['spark_only', 'spark_pity'].includes(g)) return 'spark';
  return 'shards';
}

function classify(d, b, g) {
  if (d === 'flat' && b === 'limited' && g === 'pity_5050') return 'hoyoverse-standard';
  if (d === 'flat' && b === 'limited' && g === 'radiance') return 'genshin-radiance';
  if (d === 'flat' && b === 'standard' && g === 'spark_only') return 'granblue-classic';
  if (d === 'flat' && b === 'limited' && g === 'spark_pity') return 'arknights-limited';
  if (d === 'flat' && b === 'fes' && g === 'full_suite') return 'anniversary-megabanner';
  if (d === 'box' && b === 'standard' && g === 'batch') return 'dragalia-box';
  if (d === 'box' && b === 'fes') return 'festival-box';
  if (d === 'step_up' && b === 'limited' && g === 'spark_pity') return 'sekai-step-up';
  if (d === 'step_up' && b === 'fes') return 'festival-step-up';
  if (d === 'wishlist' && b === 'limited' && g === 'spark_pity') return 'solo-leveling-model';
  if (d === 'preview' && b === 'limited') return 'transparent-reveal';
  if (d === 'sugoroku') return 'sugoroku-track';
  return `${d}-${guaranteeFamily(g)}`;
}

function pascal(s) {
  return s.split(/[-_]/).map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join('');
}

const NAMED_KEYS = new Set([
  'hoyoverse-standard', 'genshin-radiance', 'granblue-classic', 'arknights-limited',
  'anniversary-megabanner', 'dragalia-box', 'festival-box', 'sekai-step-up',
  'festival-step-up', 'solo-leveling-model', 'transparent-reveal', 'sugoroku-track',
]);

// Named files are either hand-crafted (we skip regenerating if file exists and starts with a
// "HAND-CRAFTED" marker) or generated as a simple stub that delegates to TypePlayer.
const HAND_CRAFTED_MARKER = '// HAND-CRAFTED';

function genericTemplate(typeKey) {
  const componentName = pascal(typeKey);
  return `// AUTO-GENERATED: generic bucket type.
import { buildTypeEntry } from '../../lib/TypePlayer';

const ${componentName} = buildTypeEntry('${typeKey}');
export default ${componentName};
`;
}

function namedStubTemplate(typeKey) {
  const componentName = pascal(typeKey);
  return `// AUTO-GENERATED: named-flavor stub. Replace with a custom UI.
// Remove the ${HAND_CRAFTED_MARKER.replace('// ', '')} marker if regenerating via codegen.
import { buildTypeEntry } from '../../lib/TypePlayer';

const ${componentName} = buildTypeEntry('${typeKey}');
export default ${componentName};
`;
}

function main() {
  // Clean and recreate output dir.
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  // Enumerate combos and group by type key.
  const slugsByType = new Map();
  const typesInOrder = [];
  for (const d of distributions) {
    for (const b of banners) {
      for (const g of guarantees) {
        for (const c of currencies) {
          if (!isValid(d, b, g, c)) continue;
          const slug = `${d}-${b}-${g}-${c}`;
          const typeKey = classify(d, b, g);
          if (!slugsByType.has(typeKey)) {
            slugsByType.set(typeKey, []);
            typesInOrder.push(typeKey);
          }
          slugsByType.get(typeKey).push(slug);
        }
      }
    }
  }

  // Write type files.
  const typeFiles = [];
  for (const typeKey of typesInOrder) {
    const isNamed = NAMED_KEYS.has(typeKey);
    const content = isNamed ? namedStubTemplate(typeKey) : genericTemplate(typeKey);
    const file = join(OUT_DIR, `${typeKey}.tsx`);
    writeFileSync(file, content);
    typeFiles.push({ typeKey, file, isNamed });
  }

  // Build manifest: slug -> lazy-loaded type component.
  const slugToType = {};
  for (const [typeKey, slugs] of slugsByType.entries()) {
    for (const slug of slugs) slugToType[slug] = typeKey;
  }

  const indexLines = [
    '// AUTO-GENERATED by scripts/generate-gachas.mjs — do not edit.',
    "import { lazy, type LazyExoticComponent, type ComponentType } from 'react';",
    '',
    'export interface TypeComponentProps { slug: string }',
    '',
    ...typesInOrder.map(k => `const ${pascal(k)} = lazy(() => import('./${k}'));`),
    '',
    'export const typeComponents: Record<string, LazyExoticComponent<ComponentType<TypeComponentProps>>> = {',
    ...typesInOrder.map(k => `  '${k}': ${pascal(k)},`),
    '};',
    '',
    'export const slugToType: Record<string, string> = {',
    ...Object.entries(slugToType).map(([slug, t]) => `  '${slug}': '${t}',`),
    '};',
    '',
    'export function getTypeForSlug(slug: string): string | undefined {',
    '  return slugToType[slug];',
    '}',
    '',
    'export function getTypeComponent(typeKey: string): LazyExoticComponent<ComponentType<TypeComponentProps>> | undefined {',
    '  return typeComponents[typeKey];',
    '}',
    '',
    'export function resolveBySlug(slug: string): { typeKey: string; Component: LazyExoticComponent<ComponentType<TypeComponentProps>> } | null {',
    '  const typeKey = getTypeForSlug(slug);',
    '  if (!typeKey) return null;',
    '  const Component = getTypeComponent(typeKey);',
    '  if (!Component) return null;',
    '  return { typeKey, Component };',
    '}',
    '',
  ];
  writeFileSync(INDEX_FILE, indexLines.join('\n'));

  const named = typeFiles.filter(t => t.isNamed).length;
  const generic = typeFiles.length - named;
  console.log(`Generated ${typeFiles.length} type files (${named} named + ${generic} generic)`);
  console.log(`Covering ${Object.keys(slugToType).length} combos via slugToType manifest`);
  console.log(`Manifest: ${INDEX_FILE}`);
}

main();
