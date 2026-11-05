// Type-checked inside the clean consumer against the shipped declarations.
import { createTheme, statusRows, taskList, type Task, type Theme, type StatusRow, isCancelled, text, CANCELLED } from 'framerize-pixel';
const theme: Theme = createTheme({ env: {}, argv: [], platform: 'linux', columns: 40 });
const rows: StatusRow[] = [{ status: 'ok', label: 'a' }];
const tasks: Task[] = [{ id: '1', title: 't', state: 'done' }];
const out: string = statusRows(theme, rows) + taskList(theme, tasks);
async function demo(): Promise<string> {
  const value = await text(theme, { message: 'm', defaultValue: 'd' });
  return isCancelled(value) ? 'cancelled' : value;
}
void demo; void out; void CANCELLED;
// @ts-expect-error unknown status must be rejected
const bad: StatusRow = { status: 'nope', label: 'x' };
void bad;
