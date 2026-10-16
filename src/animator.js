// Draws the Hakai animation on a terminal stream; becomes a plain logger when the stream is not a TTY.
const { renderFrame } = require('./hakaiFrame');

const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';
const CLEAR_SCREEN = '\x1b[2J';
const HOME = '\x1b[H';
const EOL = '\x1b[K';
const PROGRESS_HALF_LIFE = 40;

function createAnimator({ stream, fps = 30, now = Date.now }) {
  const enabled = Boolean(stream.isTTY);
  const frameMs = 1000 / fps;
  let count = 0;
  let frame = 0;
  let lastDraw = -Infinity;

  const draw = (progress, label) => {
    const lines = renderFrame({
      frame,
      cols: stream.columns || 80,
      rows: stream.rows || 24,
      progress,
      label,
      count,
    });
    stream.write(HOME + lines.join(EOL + '\n') + EOL);
  };

  return {
    start() {
      if (!enabled) return;
      stream.write(HIDE_CURSOR + CLEAR_SCREEN);
      process.on('exit', () => stream.write(SHOW_CURSOR));
    },
    step(label) {
      count += 1;
      if (!enabled || now() - lastDraw < frameMs) return;
      lastDraw = now();
      frame += 1;
      draw(count / (count + PROGRESS_HALF_LIFE), label);
    },
    finish(message) {
      if (enabled) {
        draw(1, message);
        stream.write(SHOW_CURSOR);
      }
      stream.write(message + '\n');
      return count;
    },
  };
}

module.exports = { createAnimator };
