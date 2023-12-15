# browser-namespace

Cross-browser support for the `browser` namespace in browser extensions. Fully typed.

```bash
npm i browser-namespace
```

```ts
import { browser } from "browser-namespace";

await browser.storage.local.set(data); // for example
```

## What this package is

Some browsers use the `browser` API namespace, while others use `chrome`. This package unifies both and provides a fully typed API.

It essentially does this:

```ts
export const browser: BrowserAPI = window.browser ?? window.chrome;
```

The types come from [`@types/webextension-polyfill`](https://www.npmjs.com/package/@types/webextension-polyfill).

## What this package is not

In contrast with [webextension-polyfill](https://github.com/mozilla/webextension-polyfill), which does a lot more, this package limits itself to providing a convenient, unified and fully typed namespace.

Support for specific features still depends on the browser and version. For this reason, types might be inaccurate. Performing feature detection is recommended.

## Chrome-specific namespace

If you need any Chrome-specific APIs, you can use the `chrome` namespace:

```ts
import { chrome } from "browser-namespace";

await chrome.debugger.sendCommand(/* ... */); // for example
```

The types are derived from [`@types/chrome`](https://www.npmjs.com/package/@types/chrome). The reason these types are copied instead of imported is because they declare `chrome` as a global variable, which might be unwanted. The version in this repo is patched to fix that.

Again, support for specific features depends on the browser and version.

## Types

The types for both browser and Chrome API namespaces can be imported directly.

There are types for the APIs themselves (corresponding to the types of the `browser` and `chrome` runtime objects):

```ts
import type { BrowserAPI, ChromeAPI } from "browser-namespace";
```

Additionally, the TypeScript namespace declarations are also exported:

```ts
import type { Browser, Chrome } from "browser-namespace";
```

These are useful to access certain types. Some examples:

- `Browser.Runtime.Port`, returned from `browser.runtime.connect`.
- `Chrome.debugger.Debuggee`, passed to `chrome.debugger.attach`.
