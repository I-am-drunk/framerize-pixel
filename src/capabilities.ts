import type { Capabilities, ColorLevel, DetectOptions, OutputMode } from './types.js';

type Env = Readonly<Record<string, string | undefined>>;

function hasFlag(argv: readonly string[], flag: string): boolean {
  const end = argv.indexOf('--');
  const at = argv.indexOf(`--${flag}`);
  return at !== -1 && (end === -1 || at < end);
}

/** FORCE_COLOR and --color flags. Adapted from supports-color 11.0.0 (MIT). */
function forcedLevel(env: Env, argv: readonly string[]): ColorLevel | undefined {
  if (['no-color', 'no-colors', 'color=false', 'color=never'].some((f) => hasFlag(argv, f))) return 0;
  if (['color', 'colors', 'color=true', 'color=always'].some((f) => hasFlag(argv, f))) return 1;
  const raw = env['FORCE_COLOR'];
  if (raw === undefined) return undefined;
  if (raw === 'true' || raw === '') return 1;
  if (raw === 'false') return 0;
  if (!/^\d+$/.test(raw)) return undefined;
  return Math.min(Number(raw), 3) as ColorLevel;
}

/** Environment-based level. Same precedence as supports-color 11.0.0 (MIT). */
function envLevel(env: Env, platform: NodeJS.Platform): ColorLevel {
  const term = env['TERM'] ?? '';
  if (term === 'dumb') return 0;
  if (platform === 'win32') return 3; // Node 22+ only runs on Windows 10 1703+, which has 24-bit color
  if ('CI' in env) {
    if (['GITHUB_ACTIONS', 'GITEA_ACTIONS', 'CIRCLECI'].some((k) => k in env)) return 3;
    if (['TRAVIS', 'APPVEYOR', 'GITLAB_CI', 'BUILDKITE', 'DRONE'].some((k) => k in env)) return 1;
    return 0;
  }
  if (env['COLORTERM'] === 'truecolor') return 3;
  if (['xterm-kitty', 'xterm-ghostty', 'wezterm'].includes(term)) return 3;
  if (env['TERM_PROGRAM'] === 'iTerm.app' || env['TERM_PROGRAM'] === 'Apple_Terminal') return 2;
  if (/-256(?:color)?$/i.test(term)) return 2;
  if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(term)) return 1;
  if (env['COLORTERM'] !== undefined) return 1;
  return 0;
}

/** Unicode heuristics adapted from is-unicode-supported 2.1.0 (MIT). */
function unicodeSupported(env: Env, platform: NodeJS.Platform): boolean {
  if (env['TERM'] === 'dumb') return false; // framerize-pixel addition: a dumb terminal gets ASCII marks
  if (platform !== 'win32') return env['TERM'] !== 'linux';
  return Boolean(env['WT_SESSION']) || env['TERM_PROGRAM'] === 'vscode'
    || env['TERM'] === 'xterm-256color' || env['TERM'] === 'alacritty'
    || env['TERMINAL_EMULATOR'] === 'JetBrains-JediTerm';
}

function isCi(env: Env): boolean {
  return 'CI' in env || 'GITHUB_ACTIONS' in env || 'BUILD_NUMBER' in env || 'TEAMCITY_VERSION' in env;
}

/**
 * Detect what the target can show. Pure given its inputs; defaults read the
 * real process. NO_COLOR always wins over every other color signal.
 */
export function detect(options: DetectOptions = {}): Capabilities {
  const env = options.env ?? process.env;
  const argv = options.argv ?? process.argv;
  const platform = options.platform ?? process.platform;
  const stream = options.stream ?? process.stdout;
  const tty = stream.isTTY === true;
  const mode: OutputMode = options.mode ?? 'human';
  let color: ColorLevel = 0;
  if (mode === 'human' && !('NO_COLOR' in env && env['NO_COLOR'] !== '')) {
    const forced = forcedLevel(env, argv);
    if (forced !== undefined) color = forced;
    else if (tty) color = envLevel(env, platform);
  }
  if (color > 0 && env['TERM'] === 'dumb' && forcedLevel(env, argv) === undefined) color = 0;
  const unicode = !env['FRAMERIZE_PIXEL_ASCII'] && unicodeSupported(env, platform)
    && env['LANG'] !== 'C' && !/^(?:C|POSIX)(?:[.@]|$)/.test(env['LC_ALL'] ?? '');
  const columns = options.columns ?? (typeof stream.columns === 'number' && stream.columns > 0 ? stream.columns : 80);
  const rows = typeof stream.rows === 'number' && stream.rows > 0 ? stream.rows : 24;
  return { tty, color, unicode, columns, rows, ci: isCi(env), mode };
}
