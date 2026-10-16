// Renders one frame of the Hakai (破壊) energy sphere as ANSI-colored text lines.
const RESET = '\x1b[0m';
const PALETTE = ['\x1b[38;5;54m', '\x1b[38;5;92m', '\x1b[38;5;129m', '\x1b[38;5;177m', '\x1b[38;5;255m'];
const SHADES = [' ', '·', '░', '▒', '▓', '█'];
const RING_CHAR = '\x1b[1;38;5;255m*' + RESET;

// Deterministic pseudo-random value in [0, 1) so the flicker is reproducible.
function noise(x, y, frame) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + frame * 37.719) * 43758.5453;
  return n - Math.floor(n);
}

function cellAt(x, y, sphere) {
  // Terminal cells are about twice as tall as wide, so horizontal distance is halved.
  const dx = (x - sphere.cx) / 2;
  const dy = y - sphere.cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const jitter = noise(x, y, sphere.frame);

  if (dist > sphere.radius + 1) return ' ';
  if (dist > sphere.radius) return jitter > 0.6 ? RING_CHAR : ' ';

  const heat = 1 - dist / sphere.radius;
  const level = Math.min(SHADES.length - 1, Math.floor((heat * 0.75 + jitter * 0.35) * SHADES.length));
  if (level <= 0) return ' ';
  const color = PALETTE[Math.min(PALETTE.length - 1, Math.floor(heat * PALETTE.length))];
  return color + SHADES[level] + RESET;
}

function renderFrame({ frame, cols, rows, progress, label, count }) {
  const sphereRows = Math.max(rows - 2, 1);
  const maxRadius = Math.max(Math.floor(Math.min((sphereRows - 1) / 2, cols / 4)), 1);
  const pulse = 1 + 0.08 * Math.sin(frame / 3);
  const sphere = {
    cx: Math.floor(cols / 2),
    cy: Math.floor((sphereRows - 1) / 2),
    radius: maxRadius * (0.3 + 0.7 * progress) * pulse,
    frame,
  };

  const lines = [];
  for (let y = 0; y < sphereRows; y++) {
    let line = '';
    for (let x = 0; x < cols; x++) line += cellAt(x, y, sphere);
    lines.push(line);
  }

  const status = `${PALETTE[4]}破壊 HAKAI${RESET} — ${count} destruído(s)`;
  const target = label.length > cols - 4 ? '…' + label.slice(-(cols - 5)) : label;
  lines.push(status, `  ${target}`);
  return lines;
}

module.exports = { renderFrame };
