import fs from 'node:fs';
import path from 'node:path';

const TOKENS_CSS_PATH = path.resolve(process.cwd(), 'src/theme/tokens.css');

function hexToRgb(hex) {
  const clean = hex.replace('#', '').trim();
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function getRelativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const srgb = v / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(hex1, hex2) {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function runContrastCheck() {
  const css = fs.readFileSync(TOKENS_CSS_PATH, 'utf8');
  const blockRegex = /:root\[data-theme="([^"]+)"\]\[data-resolved-mode="([^"]+)"\]\s*\{([\s\S]*?)\}/g;

  const expectedThemes = ['dawn', 'campus', 'meadow', 'ocean', 'royal', 'slate'];
  const expectedModes = ['light', 'dark'];
  const foundPairs = new Set();
  const failures = [];

  let match;
  while ((match = blockRegex.exec(css)) !== null) {
    const [, theme, mode, body] = match;
    foundPairs.add(`${theme}:${mode}`);

    const vars = {};
    const varRegex = /--token-([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g;
    let varMatch;
    while ((varMatch = varRegex.exec(body)) !== null) {
      vars[varMatch[1]] = varMatch[2].toUpperCase();
    }

    const checks = [
      { pair: 'ink on surface', fg: 'ink', bg: 'surface', min: 4.5 },
      { pair: 'ink on surface-2', fg: 'ink', bg: 'surface-2', min: 4.5 },
      { pair: 'ink on surface-card', fg: 'ink', bg: 'surface-card', min: 4.5 },
      { pair: 'ink-muted on surface', fg: 'ink-muted', bg: 'surface', min: 4.5 },
      { pair: 'ink-muted on surface-2', fg: 'ink-muted', bg: 'surface-2', min: 4.5 },
      { pair: 'ink-muted on surface-card', fg: 'ink-muted', bg: 'surface-card', min: 4.5 },
      { pair: 'on-primary on primary-600', fg: 'on-primary', bg: 'primary-600', min: 4.5 },
      { pair: 'on-primary on primary-700', fg: 'on-primary', bg: 'primary-700', min: 4.5 },
      { pair: 'on-accent on accent', fg: 'on-accent', bg: 'accent', min: 4.5 },
      { pair: 'on-accent-soft on accent-soft', fg: 'on-accent-soft', bg: 'accent-soft', min: 4.5 },
      { pair: 'on-success on success', fg: 'on-success', bg: 'success', min: 4.5 },
      { pair: 'on-success-soft on success-soft', fg: 'on-success-soft', bg: 'success-soft', min: 4.5 },
      { pair: 'on-warning on warning', fg: 'on-warning', bg: 'warning', min: 4.5 },
      { pair: 'on-warning-soft on warning-soft', fg: 'on-warning-soft', bg: 'warning-soft', min: 4.5 },
      { pair: 'on-danger on danger', fg: 'on-danger', bg: 'danger', min: 4.5 },
      { pair: 'on-danger-soft on danger-soft', fg: 'on-danger-soft', bg: 'danger-soft', min: 4.5 },
      { pair: 'line border on surface', fg: 'line', bg: 'surface', min: 3.0 },
      { pair: 'ring focus on surface', fg: 'ring', bg: 'surface', min: 3.0 },
    ];

    if (mode === 'light') {
      checks.push({ pair: 'primary-700 link on surface', fg: 'primary-700', bg: 'surface', min: 4.5 });
      checks.push({ pair: 'primary-700 link on surface-card', fg: 'primary-700', bg: 'surface-card', min: 4.5 });
    } else {
      checks.push({ pair: 'primary-300 link on surface', fg: 'primary-300', bg: 'surface', min: 4.5 });
      checks.push({ pair: 'primary-300 link on surface-card', fg: 'primary-300', bg: 'surface-card', min: 4.5 });
    }

    for (const chk of checks) {
      const fgHex = vars[chk.fg];
      const bgHex = vars[chk.bg];
      if (!fgHex || !bgHex) {
        failures.push(`[${theme}/${mode}] Missing token for check "${chk.pair}": ${chk.fg} or ${chk.bg}`);
        continue;
      }
      const ratio = getContrastRatio(fgHex, bgHex);
      if (ratio < chk.min) {
        failures.push(
          `[${theme}/${mode}] ${chk.pair}: ${fgHex} on ${bgHex} = ${ratio.toFixed(2)}:1 (required >= ${chk.min}:1)`
        );
      }
    }
  }

  for (const t of expectedThemes) {
    for (const m of expectedModes) {
      if (!foundPairs.has(`${t}:${m}`)) {
        failures.push(`Missing theme+mode CSS block for [${t}/${m}] in src/theme/tokens.css`);
      }
    }
  }

  return {
    checkedCombinations: foundPairs.size,
    failures,
  };
}

// Run standalone if executed directly
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (isDirectRun) {
  const result = runContrastCheck();
  if (result.failures.length > 0) {
    console.error('❌ WCAG Contrast Check FAILED:');
    for (const f of result.failures) console.error('  -', f);
    process.exit(1);
  }
  console.log(`✅ WCAG Contrast Check PASSED across all ${result.checkedCombinations} theme×mode combinations (text >= 4.5:1, UI >= 3.0:1).`);
}
