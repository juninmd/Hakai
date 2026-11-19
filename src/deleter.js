// Removes a file or directory tree, shortening deep paths by renaming subfolders to siblings first.
// Uses lstat so symlinks are unlinked, never followed (following would delete the link target's contents).
const fs = require('fs');

function createDeleter({ root, reporter }) {
  let folderCounter = 0;

  function removeDir(dirPath) {
    folderCounter += 1;
    for (const name of fs.readdirSync(dirPath)) {
      const child = dirPath + '/' + name;
      try {
        if (!fs.lstatSync(child).isDirectory()) {
          fs.unlinkSync(child);
          reporter.onDelete(child);
        } else {
          const shortPath = root + folderCounter;
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
