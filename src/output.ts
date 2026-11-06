import { strip } from './text.js';
import type { OutputMode, OutputStream } from './types.js';

export interface OutputOptions {
  readonly mode: OutputMode;
  readonly stdout?: OutputStream;
  readonly stderr?: OutputStream;
}

/**
 * Routes rendered text by mode. In `json` mode only JSON reaches stdout and
 * human text goes to stderr stripped of escapes; `plain` strips escapes on
 * both streams; `human` passes text through.
 */
export interface Output {
  readonly mode: OutputMode;
  /** Primary result text. Hidden in json mode unless `always` is set. */
  say(text: string, options?: { readonly always?: boolean }): void;
  /** Diagnostic text. Goes to stderr, never into JSON. */
  note(text: string): void;
  /** Machine result. Ignored outside json mode. Never contains escapes. */
  json(value: unknown): void;
}

export function createOutput(options: OutputOptions): Output {
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const clean = (text: string): string => (options.mode === 'human' ? text : strip(text));
  return {
    mode: options.mode,
    say(text, o) {
      if (options.mode === 'json' && o?.always !== true) return;
      stdout.write(clean(text) + '\n');
    },
    note(text) { stderr.write(clean(text) + '\n'); },
    json(value) {
      if (options.mode !== 'json') return;
      stdout.write(JSON.stringify(value, (_k, v: unknown) => (typeof v === 'string' ? strip(v) : v)) + '\n');
    },
  };
}
