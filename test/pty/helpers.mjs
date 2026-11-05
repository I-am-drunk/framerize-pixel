// Real pseudo-terminal driver for the CLI. Uses node-pty (MIT) as a devDependency.
// The child sees a TTY on stdin and stdout, so raw mode, cursor codes and
// color detection run the same paths a human terminal exercises.
import pty from 'node-pty';
import { fileURLToPath } from 'node:url';

export const BIN = fileURLToPath(new URL('../../bin/framerize-pixel.js', import.meta.url));
export const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const BASE_ENV = { PATH: process.env.PATH ?? '', HOME: process.env.HOME ?? '/tmp', TERM: 'xterm-256color', LANG: 'C.UTF-8' };

/** Spawn the CLI in a PTY. Resolves on exit with everything it wrote. */
export function spawnCli(args, { cols = 40, rows = 24, env = {}, script = [] } = {}) {
  const term = env.TERM ?? BASE_ENV.TERM; // node-pty copies `name` over TERM, so the two must agree
  const proc = pty.spawn(process.execPath, [BIN, ...args], { name: term, cols, rows, cwd: ROOT, env: { ...BASE_ENV, ...env, TERM: term } });
  let output = '';
  const steps = [...script];
  const timer = setTimeout(() => proc.kill(), 20_000);
  const feed = () => {
    const next = steps[0];
    if (next === undefined) return;
    const [waitFor, keys, delay = 60] = next;
    if (!output.includes(waitFor)) { setTimeout(feed, 15); return; }
    steps.shift();
    setTimeout(() => { proc.write(keys); feed(); }, delay);
  };
  proc.onData((data) => { output += data; });
  feed();
  return new Promise((resolve) => {
    proc.onExit(({ exitCode, signal }) => { clearTimeout(timer); setTimeout(() => resolve({ exitCode, signal, output }), 30); });
  });
}

export const KEYS = { enter: '\r', ctrlC: '\u0003', down: '\u001b[B', escape: '\u001b' };
export const CURSOR_HIDE = '\u001b[?25l';
export const CURSOR_SHOW = '\u001b[?25h';
