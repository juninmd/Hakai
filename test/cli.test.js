const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const APP = path.join(__dirname, '..', 'app.js');
const run = (...args) => spawnSync(process.execPath, [APP, ...args], { encoding: 'utf8' });

test('exits non-zero with the message on stderr when no path is given', () => {
  const res = run();
  assert.strictEqual(res.status, 2);
  assert.match(res.stderr, /Utilize/);
});

test('exits non-zero when the target does not exist', () => {
  const res = run(path.join(os.tmpdir(), 'hakai-missing-' + process.pid));
  assert.strictEqual(res.status, 1);
  assert.match(res.stderr, /não existe/);
});

test('exits zero after deleting an existing target', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hakai-cli-'));
  fs.writeFileSync(path.join(dir, 'a.txt'), 'a');
  const res = run(dir);
  assert.strictEqual(res.status, 0);
  assert.strictEqual(fs.existsSync(dir), false);
});

test('removes a dangling symlink instead of reporting it as missing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hakai-cli-'));
  const link = path.join(dir, 'dangling');
  fs.symlinkSync(path.join(dir, 'gone'), link);
  const res = run(link);
  assert.strictEqual(res.status, 0);
  assert.throws(() => fs.lstatSync(link));
  fs.rmSync(dir, { recursive: true });
});

test('does not report success when some entries could not be deleted', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hakai-cli-'));
  fs.writeFileSync(path.join(dir, 'a.txt'), 'a');
  fs.writeFileSync(path.join(dir, 'locked.txt'), 'b');
  const preload = path.join(__dirname, 'fixtures', 'failUnlink.js');
  const res = spawnSync(process.execPath, ['-r', preload, APP, dir], { encoding: 'utf8' });
  assert.strictEqual(res.status, 1);
  assert.doesNotMatch(res.stdout, /concluída/);
  assert.match(res.stdout, /Exclusão incompleta/);
  fs.rmSync(dir, { recursive: true });
});
