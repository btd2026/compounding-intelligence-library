#!/usr/bin/env node
/**
 * build.js — scans prompts/ and writes data/prompts.json
 *
 * Parses YAML frontmatter (a tiny inline parser, no deps), computes
 * Roman-numeral filed dates and call numbers, and embeds the repo's
 * GitHub edit URL for each prompt.
 *
 * Run: node scripts/build.js
 * Reads:  prompts/*.md, config.json
 * Writes: data/prompts.json
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PROMPTS_DIR = path.join(ROOT, 'prompts');
const DATA_DIR = path.join(ROOT, 'data');
const OUTPUT = path.join(DATA_DIR, 'prompts.json');
const CONFIG_PATH = path.join(ROOT, 'config.json');

const REPO = process.env.GITHUB_REPOSITORY || '';
const BRANCH = process.env.GITHUB_REF_NAME || 'main';

const SHELF_ORDER = ['Discovery', 'Research', 'Outreach', 'Building', 'Reflection'];

const ROMAN_MONTHS = [
  'I', 'II', 'III', 'IV', 'V', 'VI',
  'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
];

function romanYear(year) {
  const map = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let result = '';
  let n = year;
  for (const [v, s] of map) {
    while (n >= v) { result += s; n -= v; }
  }
  return result;
}

function romanDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const month = ROMAN_MONTHS[d.getUTCMonth()];
  const year = romanYear(d.getUTCFullYear());
  return `${month}·${year}`;
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: text };
  const yaml = match[1];
  const body = match[2];
  const meta = {};
  for (const line of yaml.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const m = line.match(/^([^:]+):\s*(.*)$/);
    if (!m) continue;
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    meta[m[1].trim()] = val;
  }
  return { meta, body: body.trim() };
}

function callNumber(meta) {
  if (meta.call_number) return meta.call_number;
  const prefix = (meta.shelf || 'GEN').slice(0, 3).toUpperCase();
  const session = meta.session || '0';
  const lesson = meta.lesson || '0';
  return `${prefix} · ${session}.${lesson}`;
}

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (e) {
    console.warn('config.json missing or invalid, using defaults');
    return {
      owner: 'Your Name',
      collection_name: 'Your Reading Room',
      subtitle: 'a private library of prompts',
      cohort: 'Compounding Intelligence',
      year_roman: 'MMXXVI'
    };
  }
}

function main() {
  if (!fs.existsSync(PROMPTS_DIR)) {
    console.error('No prompts/ directory found.');
    process.exit(1);
  }
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const config = loadConfig();
  const files = fs.readdirSync(PROMPTS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  const prompts = files.map(filename => {
    const fullPath = path.join(PROMPTS_DIR, filename);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const { meta, body } = parseFrontmatter(raw);
    const id = filename.replace(/\.md$/, '');
    return {
      id,
      filename,
      title: meta.title || id.replace(/_/g, ' '),
      shelf: meta.shelf || 'Misc',
      session: meta.session || '',
      lesson: meta.lesson || '',
      call_number: callNumber(meta),
      summary: meta.summary || '',
      date_filed: meta.date_filed || '',
      date_filed_roman: romanDate(meta.date_filed),
      body,
      edit_url: REPO ? `https://github.com/${REPO}/edit/${BRANCH}/prompts/${filename}` : '',
      raw_url: REPO ? `https://github.com/${REPO}/blob/${BRANCH}/prompts/${filename}` : ''
    };
  });

  prompts.sort((a, b) => {
    const sa = SHELF_ORDER.indexOf(a.shelf);
    const sb = SHELF_ORDER.indexOf(b.shelf);
    const ia = sa === -1 ? 99 : sa;
    const ib = sb === -1 ? 99 : sb;
    if (ia !== ib) return ia - ib;
    const sesA = parseInt(a.session) || 0;
    const sesB = parseInt(b.session) || 0;
    if (sesA !== sesB) return sesA - sesB;
    const lesA = parseInt(a.lesson) || 0;
    const lesB = parseInt(b.lesson) || 0;
    return lesA - lesB;
  });

  const output = {
    config,
    shelf_order: SHELF_ORDER,
    prompts,
    repo: REPO,
    branch: BRANCH,
    generated_at: new Date().toISOString()
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  console.log(`Built ${prompts.length} prompts → ${path.relative(ROOT, OUTPUT)}`);
}

main();
