// gta6-meme-x-01 — entry bot (Node 22, standard library only, no network).
// The entry IS the X post named in POST.json: the house reads the post from X
// (its first picture + its text) and an AI judge scores it. This program only
// carries that address from the repo root to the output directory, where the
// gate picks it up. Deterministic: same input file, same output bytes.
//
// Grader-style run:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const botDir = resolve(process.env.MAKEFUN_BOT_DIR ?? '/bot');
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

const src = join(botDir, 'POST.json');
const dst = join(outDir, 'POST.json');

function fail(msg: string, err?: unknown): never {
  const detail = err instanceof Error ? `: ${err.message}` : '';
  console.error(`gta6-meme-x-01: ${msg}${detail}`);
  process.exit(1);
}

if (!existsSync(src)) {
  fail(`POST.json not found at ${src}`);
}

const raw = readFileSync(src, 'utf8');

let data: unknown;
try {
  data = JSON.parse(raw);
} catch (err) {
  fail('POST.json is not valid JSON', err);
}

if (typeof data !== 'object' || data === null || Array.isArray(data)) {
  fail('POST.json must be a JSON object');
}

const url = (data as Record<string, unknown>).url;
if (typeof url !== 'string' || url.length === 0) {
  fail('POST.json must carry a string "url" field');
}

// An X post address: https://x.com/<handle>/status/<digits> (or twitter.com).
const shape = /^https:\/\/(x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/[0-9]+$/;
if (!shape.test(url)) {
  fail(`POST.json "url" is not an X post address: ${url}`);
}

mkdirSync(dirname(dst), { recursive: true });
mkdirSync(outDir, { recursive: true });
writeFileSync(dst, raw);

// Round-trip check: the gate reads this file, so confirm what landed on disk
// is byte-for-byte the POST.json we were given.
const written = readFileSync(dst, 'utf8');
if (written !== raw) {
  fail(`output at ${dst} does not match ${src}`);
}
console.log(`gta6-meme-x-01: wrote ${dst}`);
