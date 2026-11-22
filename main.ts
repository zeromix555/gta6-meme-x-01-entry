// gta6-meme-x-01 — v2 entry program (Node 22, standard library only, no network).
//
// The entry IS the X post named in POST.json: the house reads the post from X
// (its first picture + its text) and an AI judge scores it pairwise. This
// program only moves that post's address from the repo root into the output
// directory, where the gate picks it up. It does nothing else: no fetching,
// no rendering, no network. Same input bytes in -> same output bytes out.
//
// Grader-style run:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.env.MAKEFUN_BOT_DIR ?? '/bot');
const OUT = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

const INPUT = join(ROOT, 'POST.json');
const OUTPUT = join(OUT, 'POST.json');

const POST_SHAPE = /^https:\/\/(x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/[0-9]+$/;

function die(reason: string): never {
  console.error(`gta6-meme-x-01 v2: ${reason}`);
  process.exit(1);
}

function loadPost(): string {
  let text: string;
  try {
    text = readFileSync(INPUT, 'utf8');
  } catch {
    die(`cannot read ${INPUT}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text!);
  } catch {
    die('POST.json is not valid JSON');
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    die('POST.json must be a JSON object');
  }
  const url = (parsed as Record<string, unknown>).url;
  if (typeof url !== 'string' || !POST_SHAPE.test(url)) {
    die('POST.json "url" must be an X post address: https://x.com/<handle>/status/<digits>');
  }
  return text!;
}

function main(): void {
  const text = loadPost();
  mkdirSync(OUT, { recursive: true });
  writeFileSync(OUTPUT, text);
  // The gate reads this file, so prove what landed is byte-for-byte the input.
  if (readFileSync(OUTPUT, 'utf8') !== text) {
    die(`output at ${OUTPUT} differs from ${INPUT}`);
  }
  console.log(`gta6-meme-x-01 v2: wrote ${OUTPUT}`);
}

main();
