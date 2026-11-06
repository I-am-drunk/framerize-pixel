import { ConfirmPrompt, PasswordPrompt, SelectPrompt, TextPrompt, isCancel } from '@clack/core';
import type { Readable } from 'node:stream';
import { secretMask } from './keyvalue.js';
import { strip, truncate, width } from './text.js';
import type { Theme } from './theme.js';
import type { OutputStream } from './types.js';

/** Returned when the user cancels (Ctrl+C, Escape) or the signal aborts. */
export const CANCELLED: unique symbol = Symbol('framerize-pixel.cancelled');
export type Cancelled = typeof CANCELLED;

export interface PromptBase {
  readonly message: string;
  readonly input?: Readable;
  readonly output?: OutputStream;
  readonly signal?: AbortSignal;
}
export interface TextOptions extends PromptBase {
  readonly placeholder?: string;
  readonly defaultValue?: string;
  readonly validate?: (value: string) => string | undefined;
}
export interface SecretOptions extends PromptBase { readonly validate?: (value: string) => string | undefined; }
export interface ConfirmOptions extends PromptBase { readonly initialValue?: boolean; }
export interface SelectOption<T> { readonly value: T; readonly label: string; readonly hint?: string; }
export interface SelectOptions<T> extends PromptBase { readonly options: readonly SelectOption<T>[]; readonly initialValue?: T; }

export function isCancelled(value: unknown): value is Cancelled {
  return value === CANCELLED;
}

function head(theme: Theme, message: string, state: string): string {
  const g = theme.glyphs;
  const mark = state === 'submit' ? theme.paint.role('ok')(g.ok) : state === 'cancel' ? theme.paint.role('bad')(g.bad)
    : state === 'error' ? theme.paint.role('warn')(g.warn) : theme.paint.role('accent')(g.info);
  // Keep the head on one row: a soft-wrapped head breaks the prompt's own line count on repaint.
  return `${mark} ${theme.paint.bold(truncate(message, Math.max(1, theme.columns - 3), g.ellipsis))}`;
}

function tail(theme: Theme, error: string): string {
  return error === '' ? '' : `\n  ${theme.paint.role('bad')(error)}`;
}

type Common = { input?: Readable; output?: OutputStream; signal?: AbortSignal };
function common(o: PromptBase): Common {
  return { ...(o.input === undefined ? {} : { input: o.input }), ...(o.output === undefined ? {} : { output: o.output }),
    ...(o.signal === undefined ? {} : { signal: o.signal }) };
}
/** Prompts only run on an interactive terminal. Agents and pipes get the default or CANCELLED. */
function interactive(o: PromptBase): boolean {
  const input = o.input ?? process.stdin;
  const output = o.output ?? process.stdout;
  return (input as { isTTY?: boolean }).isTTY === true && output.isTTY === true && o.signal?.aborted !== true;
}
type Validator = ((value: string) => string | undefined) | undefined;
function adapt(v: Validator): ((value: string | undefined) => string | undefined) | undefined {
  return v === undefined ? undefined : (value) => v(value ?? '');
}
async function run<T>(p: { prompt(): Promise<unknown> }): Promise<T | Cancelled> {
  const value = await p.prompt();
  return isCancel(value) || value === undefined ? CANCELLED : (value as T);
}

/** Free text. Non-interactive: returns defaultValue, or CANCELLED when none. */
export async function text(theme: Theme, options: TextOptions): Promise<string | Cancelled> {
  if (!interactive(options)) return options.defaultValue ?? CANCELLED;
  const p = new TextPrompt({
    ...common(options),
    ...(options.placeholder === undefined ? {} : { placeholder: options.placeholder }),
    ...(options.defaultValue === undefined ? {} : { defaultValue: options.defaultValue }),
    validate: adapt(options.validate),
    render() {
      const shown = this.state === 'submit' || this.state === 'cancel' ? theme.paint.dim(this.value ?? '') : this.userInputWithCursor;
      return `${head(theme, options.message, this.state)}\n  ${shown}${tail(theme, this.error)}`;
    },
  });
  return run<string>(p);
}

/** Secret text. Input is masked while typing and never echoed on submit. */
export async function secret(theme: Theme, options: SecretOptions): Promise<string | Cancelled> {
  if (!interactive(options)) return CANCELLED;
  const p = new PasswordPrompt({
    ...common(options), mask: theme.glyphs.mask, validate: adapt(options.validate),
    render() {
      const shown = this.state === 'submit' || this.state === 'cancel' ? theme.paint.dim(secretMask(theme)) : this.masked;
      return `${head(theme, options.message, this.state)}\n  ${shown}${tail(theme, this.error)}`;
    },
  });
  return run<string>(p);
}

/** Yes/no. `y` or `n` submits at once; arrows toggle. Non-interactive: returns initialValue, or CANCELLED when none. */
export async function confirm(theme: Theme, options: ConfirmOptions): Promise<boolean | Cancelled> {
  if (!interactive(options)) return options.initialValue ?? CANCELLED;
  const g = theme.glyphs;
  const p = new ConfirmPrompt({
    ...common(options), active: 'yes', inactive: 'no', initialValue: options.initialValue ?? false,
    render() {
      if (this.state === 'submit' || this.state === 'cancel') return `${head(theme, options.message, this.state)}\n  ${theme.paint.dim(this.value ? 'yes' : 'no')}`;
      const yes = this.value ? theme.paint.role('accent')(`${g.on} yes`) : theme.paint.dim(`${g.off} yes`);
      const no = this.value ? theme.paint.dim(`${g.off} no`) : theme.paint.role('accent')(`${g.on} no`);
      const choices = `  ${yes}  ${no}`;
      const hintText = 'y/n, arrows, enter';
      const hint = width(strip(choices)) + 2 + width(hintText) <= theme.columns ? `  ${theme.paint.dim(hintText)}` : '';
      return `${head(theme, options.message, this.state)}\n${choices}${hint}`;
    },
  });
  return run<boolean>(p);
}

/** Pick one option. Non-interactive: returns initialValue, or CANCELLED when none. */
export async function select<T>(theme: Theme, options: SelectOptions<T>): Promise<T | Cancelled> {
  if (options.options.length === 0) return CANCELLED;
  if (!interactive(options)) return options.initialValue ?? CANCELLED;
  const g = theme.glyphs;
  const p = new SelectPrompt<SelectOption<T>>({
    ...common(options), options: [...options.options],
    ...(options.initialValue === undefined ? {} : { initialValue: options.initialValue }),
    render() {
      if (this.state === 'submit' || this.state === 'cancel') {
        const chosen = options.options.find((o) => o.value === this.value);
        return `${head(theme, options.message, this.state)}\n  ${theme.paint.dim(chosen?.label ?? '')}`;
      }
      const rows = this.options.map((o, i) => {
        const label = truncate(o.label, Math.max(1, theme.columns - 4), g.ellipsis);
        const room = theme.columns - 4 - width(label) - 1;
        const hint = o.hint === undefined || room < 4 ? '' : ' ' + theme.paint.dim(truncate(o.hint, room, g.ellipsis));
        return i === this.cursor ? `  ${theme.paint.role('accent')(`${g.pointer} ${label}`)}${hint}` : `    ${label}${hint}`;
      });
      return `${head(theme, options.message, this.state)}\n${rows.join('\n')}`;
    },
  });
  return run<T>(p);
}
