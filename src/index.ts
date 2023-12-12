// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type Browser = typeof import("webextension-polyfill");

// @ts-expect-error Ignoring missing window type.
export const browser: Browser = window.browser ?? window.chrome;

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type Chrome = import("./chrome-types/index.d.ts").Chrome;

// @ts-expect-error Ignoring missing window type.
export const chrome: Chrome = window.chrome ?? window.browser;
