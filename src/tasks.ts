import { statusLine, type Status } from './status.js';
import { staggered, type Theme } from './theme.js';

export type TaskState = 'pending' | 'active' | 'done' | 'failed' | 'skipped';

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly state: TaskState;
  readonly note?: string;
}

const statusOf: Readonly<Record<TaskState, Status>> = { pending: 'pending', active: 'active', done: 'done', failed: 'bad', skipped: 'skip' };

/** A task list: one status row per task, with a step counter prefix. Rows never exceed the width. */
export function taskList(theme: Theme, tasks: readonly Task[]): string {
  const total = tasks.length;
  const digits = String(total).length;
  const counter = digits * 2 + 2; // `12/34 `
  return tasks.map((task, index) => {
    const n = theme.paint.dim(`${String(index + 1).padStart(digits)}/${total}`);
    const row = { status: statusOf[task.state], label: task.title, ...(task.note === undefined ? {} : { detail: task.note }) };
    return `${n} ${statusLine(staggered(theme, index), row, undefined, theme.columns - counter)}`; // enters play top to bottom
  }).join('\n');
}

/** Replace one task immutably. Unknown ids leave the list unchanged. */
export function updateTask(tasks: readonly Task[], id: string, patch: Partial<Omit<Task, 'id'>>): Task[] {
  return tasks.map((task) => (task.id === id ? { ...task, ...patch } : task));
}

/** Counts by state, for summaries and JSON. */
export function taskSummary(tasks: readonly Task[]): Readonly<Record<TaskState, number>> {
  const out: Record<TaskState, number> = { pending: 0, active: 0, done: 0, failed: 0, skipped: 0 };
  for (const task of tasks) out[task.state] += 1;
  return out;
}
