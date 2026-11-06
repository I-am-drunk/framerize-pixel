import type { Writable } from 'node:stream';

/** Color depth the target stream can show. 0 is none, 3 is 24-bit. */
export type ColorLevel = 0 | 1 | 2 | 3;

/** Output mode. `human` paints, `plain` is text only, `json` is machine output. */
export type OutputMode = 'human' | 'plain' | 'json';

/** What the target stream and environment can show. Fully data, no behavior. */
export interface Capabilities {
  readonly tty: boolean;
  readonly color: ColorLevel;
  readonly unicode: boolean;
  readonly columns: number;
  readonly rows: number;
  readonly ci: boolean;
  readonly mode: OutputMode;
}

/** A stream-like target. `process.stdout` and `process.stderr` qualify. */
export interface OutputStream extends Writable {
  readonly isTTY?: boolean;
  readonly columns?: number;
  readonly rows?: number;
}

/** Inputs to capability detection. Everything is injectable for tests. */
export interface DetectOptions {
  readonly stream?: OutputStream;
  readonly env?: Readonly<Record<string, string | undefined>>;
  readonly argv?: readonly string[];
  readonly platform?: NodeJS.Platform;
  readonly mode?: OutputMode;
  readonly columns?: number;
}

/** Semantic color roles. The palette maps each role to a color. */
export type Role = 'ink' | 'muted' | 'accent' | 'ok' | 'warn' | 'bad' | 'info' | 'frame';
