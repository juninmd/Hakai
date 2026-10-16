#!/usr/bin/env node
const fs = require('fs');
const { createDeleter } = require('./src/deleter');
const { createAnimator } = require('./src/animator');

const target = process.argv[2];
if (!target) {
  console.log('[HAKAI] Utilize `$ hakai "<caminho>"` (Não se esqueça das aspas)');
  process.exit(0);
}
if (!fs.existsSync(target)) {
  console.log('[HAKAI] O caminho ' + target + ' não existe.');
  process.exit(0);
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
animator.finish('[HAKAI] Exclusão concluída: ' + target);
errors.forEach((message) => console.error(message));
