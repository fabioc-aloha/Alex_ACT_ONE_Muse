// Pure, testable pieces of the Git Data API push.
// No network here: the executor (gh-push.mjs) imports these.
import { createHash } from 'node:crypto';

/** Git blob SHA-1: sha1("blob <byte-length>\0" + content). */
export function blobSha(content) {
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(content);
  return createHash('sha1').update(Buffer.concat([
    Buffer.from(`blob ${buf.length}\0`, 'utf8'), buf,
  ])).digest('hex');
}

/**
 * Plan per-directory trees from flat file entries [{rel, mode, sha}].
 * Returns directories bottom-up (deepest first), each as
 * {dir, files: [{name, mode, sha}], subdirs: [name]}.
 * Empty directories are pruned (the API rejects empty trees); file-less
 * directories are kept when they have kept children, so subtrees link up.
 */
export function planTrees(entries) {
  const dirs = new Map(); // dir -> {files: [], subdirs: []}
  const ensure = (d) => {
    if (!dirs.has(d)) dirs.set(d, { dir: d, files: [], subdirs: [] });
    return dirs.get(d);
  };
  ensure('');
  for (const { rel, mode, sha } of entries) {
    const i = rel.lastIndexOf('/');
    const dir = i === -1 ? '' : rel.slice(0, i);
    const name = i === -1 ? rel : rel.slice(i + 1);
    ensure(dir).files.push({ name, mode, sha });
  }
  // Link children to parents, creating ancestors as needed.
  for (const d of [...dirs.keys()]) {
    let cur = d;
    while (cur !== '') {
      const parent = cur.includes('/') ? cur.slice(0, cur.lastIndexOf('/')) : '';
      const name = cur.includes('/') ? cur.slice(cur.lastIndexOf('/') + 1) : cur;
      const p = ensure(parent);
      if (!p.subdirs.includes(name)) p.subdirs.push(name);
      cur = parent;
    }
  }
  // Prune empties bottom-up, keeping file-less dirs with kept children.
  const depth = (d) => (d === '' ? -1 : d.split('/').length);
  const ordered = [...dirs.keys()].sort((a, b) => depth(b) - depth(a));
  const keep = new Set();
  for (const d of ordered) {
    const node = dirs.get(d);
    if (node.files.length > 0 || node.subdirs.some((s) => {
      const child = d === '' ? s : `${d}/${s}`;
      return keep.has(child);
    })) keep.add(d);
  }
  keep.add('');
  return ordered.filter((d) => keep.has(d)).map((d) => dirs.get(d));
}

/** Minimal argv parser for --key value / --flag. Repeated keys accumulate into arrays. */
export function parseArgs(argv) {
  const out = { _: [] };
  const set = (key, value) => {
    if (key in out) out[key] = [].concat(out[key], value);
    else out[key] = value;
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) set(key, true);
      else { set(key, next); i++; }
    } else out._.push(a);
  }
  return out;
}

/** True when every entry fits in one tree POST (avoids the large-tree timeout). */
export function fitsSingleTree(entries, limit = 200) {
  return entries.length <= limit;
}
