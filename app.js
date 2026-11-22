#!/usr/bin/env node
const fs = require('fs');
const { createDeleter } = require('./src/deleter');
const { createAnimator } = require('./src/animator');

const target = process.argv[2];
if (!target) {
  console.error('[HAKAI] Utilize `$ hakai "<caminho>"` (Não se esqueça das aspas)');
  process.exit(2);
}
// lstat, not existsSync: a dangling symlink is a real entry that existsSync reports as missing
if (!fs.lstatSync(target, { throwIfNoEntry: false })) {
  console.error('[HAKAI] O caminho ' + target + ' não existe.');
  process.exit(1);
}

const animator = createAnimator({ stream: process.stdout });
const errors = [];
const reporter = {
  onDelete: (path) => animator.step(path),
  onError: (message) => errors.push(message),
};

animator.start();
try {
  createDeleter({ root: target, reporter }).run();
} catch (e) {
  errors.push(e.message);
}
animator.finish(errors.length
  ? '[HAKAI] Exclusão incompleta: ' + target + ' (' + errors.length + ' erro(s))'
  : '[HAKAI] Exclusão concluída: ' + target);
errors.forEach((message) => console.error(message));
if (errors.length) process.exitCode = 1;
