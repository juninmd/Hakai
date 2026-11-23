// Removes a file or directory tree, shortening deep paths by renaming subfolders to siblings first.
// Uses lstat so symlinks are unlinked, never followed (following would delete the link target's contents).
const fs = require('fs');
const path = require('path');

function createDeleter({ root, reporter }) {
  // Absolute base: for "." or ".." the short names must still land beside the root, not inside it.
  const base = path.resolve(root);
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

  // shownPath is where the user sees the folder; dirPath may be a shortened sibling while deleting.
  function removeDir(dirPath, shownPath = dirPath) {
    for (const name of fs.readdirSync(dirPath)) {
      const child = dirPath + '/' + name;
      const shownChild = shownPath + '/' + name;
      try {
        if (!fs.lstatSync(child).isDirectory()) {
          fs.unlinkSync(child);
          reporter.onDelete(child);
        } else {
          const shortPath = nextShortPath();
          fs.renameSync(child, shortPath);
          try {
            removeDir(shortPath, shownChild);
          } catch (e) {
            // Put what could not be deleted back where the user expects it, not in a sibling like "alvo3".
            try {
              fs.renameSync(shortPath, child);
            } catch {
              e.message += ` (origem: ${shownChild}, atual: ${shortPath})`;
              throw e;
            }
            e.message += ` (mantido em: ${shownChild})`;
            throw e;
          }
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
      removeDir(base, root.replace(/[\\/]+$/, '') || root);
    },
  };
}

module.exports = { createDeleter };
