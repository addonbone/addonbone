// Expose only the compiled runtime payload; no browser APIs are needed to inspect it in the build test.
declare const __webpack_require__: {__adnbnRelayOptions?: Record<string, unknown>};

(globalThis as typeof globalThis & {readRelayOptions: () => unknown}).readRelayOptions = () =>
    __webpack_require__.__adnbnRelayOptions;

export default () => {};
