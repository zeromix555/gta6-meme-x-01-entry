// gta6-meme-x-01 entry (Node 22, standard library only).
// Copies POST.json — the address of the X post that is this entry — from the
// repository root to the output directory, where the gate reads it. The post
// itself is the entry: the house reads it from X (first picture + text) and
// hands it to the judge. Nothing this program writes about the post is judged.
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const sourcePath = join(BOT_DIR, 'POST.json');
const outputPath = join(OUTPUT_DIR, 'POST.json');

let text: string;
try {
  text = readFileSync(sourcePath, 'utf8');
} catch (err) {
  console.error(`POST.json could not be read from ${sourcePath}: ${(err as Error).message}`);
  process.exit(1);
}

let parsed: unknown;
try {
  parsed = JSON.parse(text);
} catch (err) {
  console.error(`POST.json is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}

if (typeof parsed !== 'object' || parsed === null || typeof (parsed as { url?: unknown }).url !== 'string') {
  console.error('POST.json must be a JSON object with a string "url" field');
  process.exit(1);
}

const url = (parsed as { url: string }).url;
const xPost = /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/[^/]+\/(status|statuses)\/\d+$/.test(url)
  || /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/i\/web\/status\/\d+$/.test(url);
if (!xPost) {
  console.error('POST.json "url" must be an X post address (https://x.com/<handle>/status/<id>)');
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(outputPath, text);
