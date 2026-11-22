// Preload for cli tests: simulates a file the OS refuses to delete (EACCES).
const fs = require('fs');
const original = fs.unlinkSync;
fs.unlinkSync = (target, ...rest) => {
  if (String(target).endsWith('locked.txt')) {
    throw Object.assign(new Error(`EACCES: permission denied, unlink '${target}'`), { code: 'EACCES' });
  }
  return original(target, ...rest);
};
