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
