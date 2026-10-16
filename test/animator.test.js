const test = require('node:test');
const assert = require('node:assert');
const { createAnimator } = require('../src/animator');

function fakeStream(isTTY) {
  return {
    isTTY,
    columns: 40,
    rows: 10,
    chunks: [],
    write(text) {
      this.chunks.push(text);
      return true;
    },
  };
}

test('non-TTY stream receives only the final message', () => {
  const stream = fakeStream(false);
  const animator = createAnimator({ stream });
  animator.start();
  animator.step('a');
  animator.step('b');
  const total = animator.finish('done');
  assert.deepStrictEqual(stream.chunks, ['done\n']);
  assert.strictEqual(total, 2);
});

test('TTY stream draws frames throttled by the clock', () => {
  const stream = fakeStream(true);
  let clock = 0;
  const animator = createAnimator({ stream, fps: 10, now: () => clock });
  animator.start();
  const before = stream.chunks.length;
  clock = 1000;
  animator.step('a');
  clock = 1010;
  animator.step('b');
  clock = 1200;
  animator.step('c');
  assert.strictEqual(stream.chunks.length - before, 2);
});

test('finish on TTY draws a final frame and restores the cursor', () => {
  const stream = fakeStream(true);
  const animator = createAnimator({ stream });
  animator.start();
  animator.finish('bye');
  const last = stream.chunks.slice(-3);
  assert.match(last[0], /HAKAI/);
  assert.strictEqual(last[1], '\x1b[?25h');
  assert.strictEqual(last[2], 'bye\n');
});
