// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type Browser = typeof import("webextension-polyfill");

// @ts-expect-error Ignoring missing globalThis type.
export const browser: Browser = globalThis.browser ?? globalThis.chrome;

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type Chrome = import("./chrome-types/index.d.ts").Chrome;

// @ts-expect-error Ignoring missing globalThis type.
export const chrome: Chrome = globalThis.chrome ?? globalThis.browser;
