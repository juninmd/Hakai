const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createDeleter } = require('../src/deleter');

function fakeReporter() {
  return { deleted: [], errors: [], onDelete(p) { this.deleted.push(p); }, onError(m) { this.errors.push(m); } };
}

function makeTree() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'hakai-'));
  const root = path.join(base, 'alvo');
  fs.mkdirSync(path.join(root, 'sub', 'deep'), { recursive: true });
  fs.writeFileSync(path.join(root, 'a.txt'), 'a');
  fs.writeFileSync(path.join(root, 'sub', 'deep', 'b.txt'), 'b');
  return { base, root };
}

test('removes a whole directory tree and reports every deletion', () => {
  const { base, root } = makeTree();
  const reporter = fakeReporter();
  createDeleter({ root, reporter }).run();
  assert.strictEqual(fs.existsSync(root), false);
  assert.strictEqual(reporter.deleted.length, 5);
  assert.deepStrictEqual(reporter.errors, []);
  fs.rmSync(base, { recursive: true, force: true });
});

test('removes a single file', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'hakai-'));
  const file = path.join(base, 'solo.txt');
  fs.writeFileSync(file, 'x');
  const reporter = fakeReporter();
  createDeleter({ root: file, reporter }).run();
  assert.strictEqual(fs.existsSync(file), false);
  assert.deepStrictEqual(reporter.deleted, [file]);
  fs.rmSync(base, { recursive: true, force: true });
});

test('reports errors through the reporter and keeps going', () => {
  const { base, root } = makeTree();
  const reporter = fakeReporter();
  const realUnlink = fs.unlinkSync;
  fs.unlinkSync = (p) => {
    if (p.endsWith('a.txt')) throw new Error('EBUSY: fake');
    return realUnlink(p);
  };
  try {
    assert.throws(() => createDeleter({ root, reporter }).run(), /not empty|ENOTEMPTY/);
  } finally {
    fs.unlinkSync = realUnlink;
  }
  assert.ok(reporter.errors.some((m) => m.includes('EBUSY')));
  fs.rmSync(base, { recursive: true, force: true });
});

test('a file that cannot be deleted stays at its original path, not in a renamed sibling', () => {
  const { base, root } = makeTree();
  const reporter = fakeReporter();
  const realUnlink = fs.unlinkSync;
  fs.unlinkSync = (p) => {
    if (p.endsWith('b.txt')) throw new Error('EBUSY: fake');
    return realUnlink(p);
  };
  try {
    assert.throws(() => createDeleter({ root, reporter }).run(), /not empty|ENOTEMPTY/);
  } finally {
    fs.unlinkSync = realUnlink;
  }
  assert.ok(fs.existsSync(path.join(root, 'sub', 'deep', 'b.txt')));
  assert.deepStrictEqual(fs.readdirSync(base), ['alvo']);
  fs.rmSync(base, { recursive: true, force: true });
});

test('unlinks symlinks without following them into the target', (t) => {
  const { base, root } = makeTree();
  const outside = path.join(base, 'fora');
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside, 'importante.txt'), 'keep');
  try {
    fs.symlinkSync(outside, path.join(root, 'link'), 'dir');
  } catch {
    fs.rmSync(base, { recursive: true, force: true });
    return t.skip('symlinks not permitted on this system');
  }
  const reporter = fakeReporter();
  createDeleter({ root, reporter }).run();
  assert.strictEqual(fs.existsSync(root), false);
  assert.strictEqual(fs.readFileSync(path.join(outside, 'importante.txt'), 'utf8'), 'keep');
  assert.deepStrictEqual(reporter.errors, []);
  fs.rmSync(base, { recursive: true, force: true });
});

test('a symlink passed as root is removed without touching its target', (t) => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'hakai-'));
  const outside = path.join(base, 'fora');
  fs.mkdirSync(outside);
  fs.writeFileSync(path.join(outside, 'importante.txt'), 'keep');
  const link = path.join(base, 'link');
  try {
    fs.symlinkSync(outside, link, 'dir');
  } catch {
    fs.rmSync(base, { recursive: true, force: true });
    return t.skip('symlinks not permitted on this system');
  }
  createDeleter({ root: link, reporter: fakeReporter() }).run();
  assert.strictEqual(fs.existsSync(link), false);
  assert.strictEqual(fs.existsSync(path.join(outside, 'importante.txt')), true);
  fs.rmSync(base, { recursive: true, force: true });
});

test('does not clobber or fail on siblings named like the shortened paths', () => {
  const { base, root } = makeTree();
  const sibDir = path.join(base, 'alvo1');
  fs.mkdirSync(sibDir);
  const sibFile = path.join(base, 'alvo2');
  fs.writeFileSync(sibFile, 'keep');
  const reporter = fakeReporter();
  createDeleter({ root, reporter }).run();
  assert.strictEqual(fs.existsSync(root), false);
  assert.deepStrictEqual(reporter.errors, []);
  assert.strictEqual(fs.existsSync(sibDir), true);
  assert.strictEqual(fs.readFileSync(sibFile, 'utf8'), 'keep');
  fs.rmSync(base, { recursive: true, force: true });
});

test('a trailing slash on the root does not place shortened folders inside it', () => {
  const { base, root } = makeTree();
  const reporter = fakeReporter();
  createDeleter({ root: root + '/', reporter }).run();
  assert.strictEqual(fs.existsSync(root), false);
  assert.deepStrictEqual(reporter.errors, []);
  fs.rmSync(base, { recursive: true, force: true });
});
