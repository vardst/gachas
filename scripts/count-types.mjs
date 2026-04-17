// Quick sanity check — mirrors classifyCombo from src/data/types.ts
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

const types = new Map();
for (const d of distributions) for (const b of banners) for (const g of guarantees) for (const c of currencies) {
  if (!isValid(d, b, g, c)) continue;
  const key = classify(d, b, g);
  if (!types.has(key)) types.set(key, 0);
  types.set(key, types.get(key) + 1);
}
console.log(`Total types: ${types.size}`);
const sorted = [...types.entries()].sort((a, b) => b[1] - a[1]);
for (const [k, n] of sorted) console.log(`  ${k.padEnd(30)} ${n} combos`);
const namedKeys = ['hoyoverse-standard','genshin-radiance','granblue-classic','arknights-limited','anniversary-megabanner','dragalia-box','festival-box','sekai-step-up','festival-step-up','solo-leveling-model','transparent-reveal','sugoroku-track'];
const named = [...types.keys()].filter(k => namedKeys.includes(k)).length;
const generic = types.size - named;
console.log(`\nNamed: ${named}, Generic: ${generic}, Total files: ${types.size}`);
