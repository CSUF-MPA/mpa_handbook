#!/usr/bin/env node
/**
 * Checks scripts/handbook-data.js against the PDF handbook, which is the
 * source of truth. Run it after editing either one:
 *
 *   node tools/verify-against-pdf.mjs                 # uses the newest mpa_student_handbook_*.pdf
 *   node tools/verify-against-pdf.mjs path/to/x.pdf   # or a specific file
 *
 * What it checks
 *   - Public Administration Core and breadth lists (§9)
 *   - every concentration list: core, take-one / take-two, advisor-approved (§11)
 *   - every course title in the data appears somewhere in the PDF
 *   - the tuition figures used by the cost estimator (§7)
 *   - the 400-level course cap used by the Study Plan sketcher (§17)
 *
 * Exits non-zero on any mismatch. Needs `pdftotext` (poppler-utils on Linux,
 * `brew install poppler` on macOS).
 */

import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const DATA = require(join(ROOT, 'scripts', 'handbook-data.js'));

const pdfArg = process.argv[2];
const pdf = pdfArg
  ? resolve(pdfArg)
  : join(ROOT, readdirSync(ROOT).filter(f => /^mpa_student_handbook_.*\.pdf$/.test(f)).sort().pop() || '');

let raw;
try {
  raw = execFileSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
} catch (err) {
  console.error(`Could not run pdftotext on ${pdf}: ${err.message}`);
  process.exit(2);
}

// ------------------------------------------------------------ normalise text

const clean = s => s
  .replace(/­\s*/g, '')            // soft hyphens at line breaks
  .replace(/[‐-―−]/g, '-') // any dash -> hyphen
  .replace(/[‘’]/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

const lines = raw
  .split('\n')
  .filter(l => !/^\s*CSUF MPA Student Handbook\s+\d{4}-\d{4}\s*$/.test(l)) // running header
  .filter(l => !/^\s*[ivx\d]+\s*$/.test(l));                                // page numbers

const flat = clean(lines.join(' '));

// Bullet items between two heading strings (first match after `from`).
function bulletsBetween(start, end, from = 0) {
  const text = lines.join('\n');
  const s = text.indexOf(start, from);
  if (s < 0) throw new Error(`Heading not found in PDF: "${start}"`);
  const e = end ? text.indexOf(end, s + start.length) : text.length;
  if (e < 0) throw new Error(`Heading not found in PDF after "${start}": "${end}"`);
  const chunk = text.slice(s + start.length, e);
  const codes = [];
  for (const m of chunk.matchAll(/•\s+([A-Z]{3,4})(?:\/[A-Z]{3,4})?\s+(\d{3}[A-Z]?)\b/g)) {
    codes.push(`${m[1]} ${m[2]}`);
  }
  return { codes, end: e };
}

// ----------------------------------------------------------------- compare

const problems = [];
let checks = 0;

function sameSet(label, fromPdf, fromData) {
  checks += 1;
  const a = new Set(fromPdf);
  const b = new Set(fromData);
  const missing = [...a].filter(x => !b.has(x));
  const extra = [...b].filter(x => !a.has(x));
  if (fromData.length !== b.size) problems.push(`${label}: duplicate entries in data file`);
  if (missing.length) problems.push(`${label}: in PDF but not in data file -> ${missing.join(', ')}`);
  if (extra.length) problems.push(`${label}: in data file but not in PDF -> ${extra.join(', ')}`);
}

// §9 Public Administration Core
const core = bulletsBetween('Public Administration Core', 'And at least one of the following');
sameSet('PA core', core.codes, DATA.paCore);
const breadth = bulletsBetween('And at least one of the following', 'All core courses must be completed');
sameSet('PA core breadth (at least one of)', breadth.codes, DATA.breadth);

// §10 Internship
checks += 1;
if (!flat.includes(`${DATA.internship} Internship in Public Administration`)) {
  problems.push(`Internship course ${DATA.internship} not found in PDF`);
}

// §11 Concentrations
const text = lines.join('\n');
const concStart = text.indexOf('Concentration in Human Resources Management');
const afterConcentrations = '12.';

DATA.concentrations.forEach((c, i) => {
  const heading = `Concentration in ${c.name}`;
  const next = DATA.concentrations[i + 1];
  const stop = next ? `Concentration in ${next.name}` : afterConcentrations;
  const at = text.indexOf(heading, concStart);
  if (at < 0) {
    problems.push(`Heading "${heading}" not found in PDF`);
    return;
  }

  c.slots.forEach((slot, j) => {
    const nextLabel = c.slots[j + 1] ? c.slots[j + 1].label : 'Advisor-Approved Electives';
    try {
      const { codes } = bulletsBetween(slot.label, nextLabel, at);
      sameSet(`${c.short}: ${slot.label}`, codes, slot.from);
      checks += 1;
      if (slot.pick > slot.from.length) problems.push(`${c.short}: ${slot.label} asks for more courses than it lists`);
    } catch (err) {
      problems.push(`${c.short}: ${err.message}`);
    }
  });

  try {
    const { codes } = bulletsBetween('Advisor-Approved Electives', stop, at);
    sameSet(`${c.short}: Advisor-Approved Electives`, codes, c.advisor);
  } catch (err) {
    problems.push(`${c.short}: ${err.message}`);
  }
});

// Every course code and title in the data appears in the PDF.
for (const [code, info] of Object.entries(DATA.courses)) {
  checks += 1;
  const [subj, num] = code.split(' ');
  const codeRe = new RegExp(`\\b${subj}(?:/[A-Z]{3,4})? ${num}\\b|\\b[A-Z]{3,4}/${subj} ${num}\\b`);
  if (!codeRe.test(flat)) problems.push(`Course code ${code} does not appear in PDF`);
  if (!flat.includes(clean(info.title))) problems.push(`Title for ${code} not found in PDF: "${info.title}"`);
}

// Every course mentioned in a concentration list exists in the course table.
for (const c of DATA.concentrations) {
  for (const code of [...c.slots.flatMap(s => s.from), ...c.advisor]) {
    checks += 1;
    if (!DATA.courses[code]) problems.push(`${c.short} references ${code}, which has no entry in courses{}`);
  }
}

// §7 Cost of Degree
const money = n => `$${n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0 })}`;
for (const [label, n] of [
  ['0-6 unit tuition', DATA.costs.perSemester.upTo6],
  ['7+ unit tuition', DATA.costs.perSemester.sevenPlus],
  ['nonresident per-unit fee', DATA.costs.nonresidentPerUnit]
]) {
  checks += 1;
  if (!flat.includes(money(n))) problems.push(`Cost: ${label} ${money(n)} not found in PDF`);
}

// §17 400-level cap
checks += 1;
const words = ['zero', 'one', 'two', 'three', 'four', 'five'];
if (!flat.includes(`no more than ${words[DATA.rules.max400LevelCourses]} such courses`)) {
  problems.push(`400-level cap of ${DATA.rules.max400LevelCourses} courses not found in PDF wording`);
}

// §8 36 units
checks += 1;
if (!flat.includes(`requires ${DATA.rules.totalUnits} units`)) problems.push(`Total of ${DATA.rules.totalUnits} units not found in PDF`);

// ------------------------------------------------------------------ report

const name = pdf.split('/').pop();
if (problems.length) {
  console.error(`✗ ${problems.length} mismatch(es) between scripts/handbook-data.js and ${name}:\n`);
  problems.forEach(p => console.error(`  - ${p}`));
  process.exit(1);
}
console.log(`✓ scripts/handbook-data.js matches ${name} (${checks} checks)`);
