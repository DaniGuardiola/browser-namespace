import type Browser from "webextension-polyfill";

import type Chrome from "./chrome-types/index.ts";

export { Browser, Chrome };

export type BrowserAPI = typeof Browser;

// @ts-expect-error Ignoring missing globalThis type.
export const browser: BrowserAPI = globalThis.browser ?? globalThis.chrome;

export type ChromeAPI = typeof Chrome;

// @ts-expect-error Ignoring missing globalThis type.
export const chrome: ChromeAPI = globalThis.chrome ?? globalThis.browser;
