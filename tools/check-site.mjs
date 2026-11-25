#!/usr/bin/env node
/**
 * Zero-dependency static checks for the MC Notes site.
 *
 * Run:  node tools/check-site.mjs
 * Exit code 1 if any error is found; warnings do not fail the build.
 *
 * Checks:
 *  - local href/src references resolve to an existing file
 *  - every <img> has a non-empty alt
 *  - external links that open a new tab carry rel="noopener"
 *  - each page has the required head metadata and one <h1>
 *  - navigation targets all exist
 *  - images referenced nowhere are reported as orphans (warning only)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const errors = [];
const warnings = [];

const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};

const htmlFiles = walk(root).filter((f) => f.endsWith('.html')).sort();
if (htmlFiles.length === 0) {
  errors.push('No HTML files found.');
  report();
  process.exit(1);
}

const stripQuery = (ref) => ref.split('#')[0].split('?')[0];
const isRemote = (ref) => /^(https?:|mailto:|data:|\/\/|#)/i.test(ref);

// Absolute OG/asset URLs that point back at this GitHub Pages site.
const SITE_ORIGIN = 'https://i-am-cie.github.io';
const SITE_PREFIX = '/personal-project/';
const siteLocalPath = (ref) => {
  try {
    const url = new URL(ref);
    if (url.origin !== SITE_ORIGIN || !url.pathname.startsWith(SITE_PREFIX)) return null;
    return decodeURIComponent(url.pathname.slice(SITE_PREFIX.length));
  } catch {
    return null;
  }
};

const tagAttr = (tag, attr) => {
  const m = tag.match(new RegExp(`\\b${attr}\\s*=\\s*"([^"]*)"`, 'i'));
  return m ? m[1] : null;
};

const REQUIRED_META = [
  ['title', /<title>[^<\s]/i],
  ['meta[name=description]', /<meta\s+name="description"\s+content="[^"]{10,}"/i],
  ['meta[property=og:title]', /<meta\s+property="og:title"\s+content="[^"]+"/i],
  ['meta[property=og:description]', /<meta\s+property="og:description"\s+content="[^"]+"/i],
  ['meta[property=og:url]', /<meta\s+property="og:url"\s+content="[^"]+"/i],
  ['meta[property=og:image]', /<meta\s+property="og:image"\s+content="[^"]+"/i],
  ['meta[name=viewport]', /<meta\s+name="viewport"/i],
  ['meta charset', /<meta\s+charset=/i],
];

const referencedLocal = new Set();
const ids = new Map();

for (const file of htmlFiles) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');

  // --- head metadata & heading structure ---
  for (const [label, re] of REQUIRED_META) {
    if (!re.test(html)) errors.push(`${rel}: missing ${label}`);
  }
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1Count === 0) warnings.push(`${rel}: no <h1> on the page`);
  if (h1Count > 1) errors.push(`${rel}: ${h1Count} <h1> elements; expected one`);

  // --- resources ---
  const tags = html.match(/<(img|a|link|script|source|meta)\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const lower = tag.toLowerCase();
    let src;
    if (/^<meta\b/i.test(tag)) {
      const property = tagAttr(tag, 'property') || tagAttr(tag, 'name') || '';
      if (!/^(og:image|twitter:image)$/i.test(property)) continue;
      src = tagAttr(tag, 'content');
    } else {
      src = tagAttr(tag, 'src') ?? tagAttr(tag, 'href');
    }
    if (!src) continue;
    const ref = src.trim();
    if (!ref) continue;

    // Absolute URL pointing back at this site: resolve it like a local path.
    const backRef = siteLocalPath(ref);
    if (backRef) {
      const target = path.join(root, backRef);
      if (!fs.existsSync(target)) {
        errors.push(`${rel}: site asset does not exist: ${ref}`);
      }
      referencedLocal.add(backRef);
      continue;
    }

    if (isRemote(ref)) {
      if (/target\s*=\s*"_blank"/i.test(tag)) {
        const relAttr = tagAttr(tag, 'rel') || '';
        if (!/noopener/.test(relAttr)) {
          errors.push(`${rel}: external link opens in a new tab without rel="noopener": ${ref}`);
        }
      }
      continue;
    }

    const local = stripQuery(ref);
    if (!local) continue;
    const target = path.normalize(path.join(path.dirname(file), local));
    if (!fs.existsSync(target)) {
      errors.push(`${rel}: local reference does not exist: ${ref}`);
    }
    referencedLocal.add(path.relative(root, target).replace(/\\/g, '/'));

    if (/^<img\b/i.test(tag)) {
      const alt = tagAttr(tag, 'alt');
      if (alt === null || alt.trim() === '') {
        errors.push(`${rel}: <img> without an alt attribute: ${ref}`);
      }
    }

    const id = tagAttr(tag, 'id');
    if (id) {
      if (ids.has(id)) errors.push(`${rel}: duplicate id "${id}" (also in ${ids.get(id)})`);
      else ids.set(id, rel);
    }
  }
}

// --- orphan images (warning only) ---
const allImages = walk(root)
  .filter((f) => /\.(jpe?g|png|svg|webp|gif)$/i.test(f))
  .map((f) => path.relative(root, f).replace(/\\/g, '/'));
for (const img of allImages) {
  if (!referencedLocal.has(img)) warnings.push(`${img}: image is not referenced by any page`);
}

// --- internal navigation consistency ---
const pageNames = new Set(htmlFiles.map((f) => path.basename(f)));
for (const file of htmlFiles) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/href="([^"]+\.html)[^"]*"/gi)) {
    const target = stripQuery(m[1].split('/').pop());
    if (target && !pageNames.has(target)) {
      errors.push(`${rel}: navigation target ${target} does not exist`);
    }
  }
}

report();

function report() {
  for (const w of warnings) console.warn(`warn  ${w}`);
  for (const e of errors) console.error(`error ${e}`);
  console.log(`\n${htmlFiles.length} pages checked: ${errors.length} error(s), ${warnings.length} warning(s).`);
  if (errors.length) process.exitCode = 1;
}
