// Removes a file or directory tree, shortening deep paths by renaming subfolders to siblings first.
// Uses lstat so symlinks are unlinked, never followed (following would delete the link target's contents).
const fs = require('fs');

function createDeleter({ root, reporter }) {
  const base = root.replace(/[\\/]+$/, '') || root;
  let folderCounter = 0;

  // Never reuse a name that already exists beside the root: rename would clobber it or fail.
  function nextShortPath() {
    let candidate;
    do {
      folderCounter += 1;
      candidate = base + folderCounter;
    } while (isTaken(candidate));
    return candidate;
  }

  function isTaken(p) {
    try {
      fs.lstatSync(p);
      return true;
    } catch {
      return false;
    }
  }

  function removeDir(dirPath) {
    for (const name of fs.readdirSync(dirPath)) {
      const child = dirPath + '/' + name;
      try {
        if (!fs.lstatSync(child).isDirectory()) {
          fs.unlinkSync(child);
          reporter.onDelete(child);
        } else {
          const shortPath = nextShortPath();
          fs.renameSync(child, shortPath);
          removeDir(shortPath);
        }
      } catch (e) {
        reporter.onError(e.message);
      }
    }
    fs.rmdirSync(dirPath);
    reporter.onDelete(dirPath);
  }

  return {
    run() {
      if (!fs.lstatSync(root).isDirectory()) {
        fs.unlinkSync(root);
        reporter.onDelete(root);
        return;
      }
      removeDir(root);
    },
  };
}

module.exports = { createDeleter };
