const test = require('node:test');
const assert = require('node:assert');
const { renderFrame } = require('../src/hakaiFrame');

const base = { frame: 1, cols: 40, rows: 12, progress: 0.5, label: 'node_modules/x', count: 3 };

test('renderFrame returns one line per row', () => {
  const lines = renderFrame(base);
  assert.strictEqual(lines.length, base.rows);
});

test('renderFrame shows the count and the current label', () => {
  const lines = renderFrame(base);
  assert.match(lines[lines.length - 2], /HAKAI.*3 destruído/);
  assert.match(lines[lines.length - 1], /node_modules\/x/);
});

test('renderFrame truncates long labels to the terminal width', () => {
  const lines = renderFrame({ ...base, label: 'a'.repeat(200) });
  assert.ok(lines[lines.length - 1].length <= 40);
});

test('renderFrame keeps the label line within narrow terminal widths', () => {
  for (const cols of [1, 2, 3, 4, 5, 6, 20, 80]) {
    const lines = renderFrame({ ...base, cols, label: '/tmp/caminho-muito-longo' });
    assert.ok(lines[lines.length - 1].length <= cols, `cols=${cols}`);
  }
});

test('renderFrame leaves a short label unchanged', () => {
  const lines = renderFrame({ ...base, label: 'node_modules' });
  assert.strictEqual(lines[lines.length - 1], '  node_modules');
});

test('renderFrame grows the sphere as progress increases', () => {
  const filled = (progress) =>
    renderFrame({ ...base, progress })
      .slice(0, base.rows - 2)
      .join('')
      .replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '')
      .replace(/ /g, '').length;
  assert.ok(filled(1) > filled(0));
});
