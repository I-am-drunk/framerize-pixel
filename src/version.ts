import { createRequire } from 'node:module';

interface Manifest { readonly name: string; readonly version: string; }
const manifest = createRequire(import.meta.url)('../package.json') as Manifest;

/** Package name as published. */
export const NAME: string = manifest.name;
/** Package version as published; the only source of truth is package.json. */
export const VERSION: string = manifest.version;
