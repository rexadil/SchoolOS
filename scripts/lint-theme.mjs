import fs from 'node:fs';
import path from 'node:path';
import { runContrastCheck } from './check-contrast.mjs';

const ROOT = process.cwd();
const SCAN_TARGETS = [path.join(ROOT, 'src'), path.join(ROOT, 'index.html')];
const ALLOWED_TOKEN_DIR = path.join(ROOT, 'src', 'theme') + path.sep;

const HARDCODED_COLOR_RULES = [
  {
    name: 'Tailwind named palette class',
    regex: /\b(?:bg|text|border|ring|from|to|via|fill|stroke|divide|decoration|outline|shadow|accent)-(?:stone|amber|emerald|orange|slate|rose|red|pink|cyan|sky|blue|indigo|purple|teal|gray|zinc|neutral|green|yellow|lime|violet|fuchsia)-(?:\d{2,3})(?:\/\d{1,3})?\b/g,
  },
  {
    name: 'Hardcoded bg-white / text-white / bg-black / text-black',
    regex: /\b(?:bg|text|border)-(?:white|black)(?:\/\d{1,3})?\b/g,
  },
  {
    name: 'Raw hex color literal',
    regex: /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g,
  },
];

// Exclude HTML anchor links like #journey, #apply, #status, #admin, #contact, #teachers, #gallery, #why-us, #daily-life, #printable-admission-token
const ALLOWED_HASH_IDS = new Set([
  '#fff',
  '#000',
]);

function walkFiles(targetPath) {
  const results = [];
  if (!fs.existsSync(targetPath)) return results;
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    if (!targetPath.startsWith(ALLOWED_TOKEN_DIR) && /\.(ts|tsx|css|html)$/.test(targetPath)) {
      results.push(targetPath);
    }
    return results;
  }
  for (const entry of fs.readdirSync(targetPath, { withFileTypes: true })) {
    const full = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      if (full + path.sep === ALLOWED_TOKEN_DIR) continue;
      results.push(...walkFiles(full));
    } else if (entry.isFile() && /\.(ts|tsx|css|html)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function isLikelyHexColor(line, matchIndex, matchText) {
  // Ignore URL hash fragments (#admin, #apply, #top), CSS IDs (#printable-admission-token), or SVG url(#grad)
  const before = line.slice(0, matchIndex);
  if (/(?:href=|id=|url\(|querySelector\(|pushState\(|hash\s*=|includes\(|startsWith\()/.test(before)) {
    return false;
  }
  // Ignore 3-char matches that appear in normal text/URLs like #abc unless clearly hex color syntax
  const after = line.slice(matchIndex + matchText.length);
  if (/^[a-zA-Z0-9_-]/.test(after)) return false;
  if (matchText.length === 4) {
    // 3-char hex like #fff, #000
    const prevChar = matchIndex > 0 ? line[matchIndex - 1] : '';
    if (!/[\s:'"`(\[]/.test(prevChar)) return false;
  }
  return true;
}

const files = SCAN_TARGETS.flatMap(walkFiles);
const violations = [];

for (const file of files) {
  const rel = path.relative(ROOT, file);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }

    for (const rule of HARDCODED_COLOR_RULES) {
      rule.regex.lastIndex = 0;
      let m;
      while ((m = rule.regex.exec(line)) !== null) {
        if (rule.name === 'Raw hex color literal' && !isLikelyHexColor(line, m.index, m[0])) {
          continue;
        }
        violations.push(`${rel}:${idx + 1} [${rule.name}] -> ${m[0]}`);
      }
    }
  });
}

const contrast = runContrastCheck();

if (violations.length > 0) {
  console.error(`❌ lint:theme FAILED — Found ${violations.length} hardcoded color usage(s) outside src/theme/:`);
  for (const v of violations.slice(0, 50)) {
    console.error('  -', v);
  }
  if (violations.length > 50) {
    console.error(`  ... and ${violations.length - 50} more.`);
  }
  process.exit(1);
}

if (contrast.failures.length > 0) {
  console.error('❌ lint:theme FAILED — WCAG Contrast verification failed:');
  for (const f of contrast.failures) {
    console.error('  -', f);
  }
  process.exit(1);
}

console.log(
  `✅ lint:theme PASSED — 0 hardcoded color classes/hexes outside src/theme/, and all ${contrast.checkedCombinations} theme×mode contrast checks passed.`
);
