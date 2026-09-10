---
description: Runtime translation providers, shared formatting, catalogue access, and React integration.
---

# Locale

`src/locale` implements translation at runtime: message lookup, substitutions, plural forms, language selection, and UI integration. Its public entrypoints are `adnbn/locale` and `adnbn/locale/react`.

## Directory responsibilities

| Area                          | Responsibility                                                                                                                |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `providers/AbstractLocale.ts` | Common string rendering, plural rules, missing-message diagnostics, and language names.                                       |
| `providers/NativeLocale.ts`   | Browser i18n message lookup and a singleton used by the public helpers.                                                       |
| `providers/DynamicLocale.ts`  | Compiled translations, language state per instance, and optional storage synchronization.                                     |
| `providers/CustomLocale.ts`   | Internal provider for an explicitly supplied language and flat message dictionary; not re-exported by the public entrypoint.  |
| `helpers.ts`                  | Native shortcuts: `t`, `choice`, `key` for browser message references, and `resolve` for strings prefixed with `@`.           |
| `utils.ts`                    | Key conversion, locale markers, language resolution, and text direction.                                                      |
| `catalogue/`                  | Empty package fallback and typing for the generated data module.                                                              |
| `adapters/react/`             | `LocaleProvider`, its context, and `useLocale`; connects dynamic localization to React state and DOM `lang`/`dir` attributes. |
| `index.ts`                    | Public providers, helpers, and selected shared contracts.                                                                     |

## Ownership and data flow

Shared languages, contracts, and module identifiers belong to `src/types/locale.ts`. Generated `.adnbn/locale.d.ts` augments `LocaleNativeStructure` through `adnbn/locale`, defining the application's keys and required substitutions from its default language.

Locale discovery, merging, validation, fallback preparation, native `_locales/*/messages.json`, and declaration generation belong to the CLI locale pipeline. The locale feature plugin supplies the generated data; Rspack integration and chunk delivery belong to the bundler. Shared message-flattening logic lives in `src/shared/locale`.

During extension builds, the private `#adnbn/locale` import resolves to `virtual/locale`: a default catalogue export plus named `keys` and `languages`. `DynamicLocale` reads the catalogue; `NativeLocale` imports only the named lists, allowing unused translations to be removed from optimized bundles. Outside these builds, `catalogue/` provides a resolvable empty module.

Views and ISOLATED content scripts can share `locale.js`. MAIN retains its own content layer: its catalogue stays in the entrypoint or joins `common-main.content.js` under the regular content chunk rules. Background keeps translations in its single bundle. This separates file delivery across content execution worlds; the same translations may occur in their respective bundles.

Core providers have no React dependency. Browser i18n access goes through `@addon-core/browser`; persistence goes through `@addon-core/storage`. Both native and dynamic providers determine their initial language from the browser's `locale` message. The empty package fallback does not make them operational without the required browser API and generated locale data.

## Runtime behavior

Translations are synchronous strings. Providers share substitution and plural processing through `AbstractLocale`; `trans` handles non-plural keys and `choice` selects a form by count. Substitutions accept strings and numbers. Generated public keys use dot notation, while message lookup converts them to underscore keys. Missing messages warn and return the key; empty translations remain empty strings.

`DynamicLocale` reads bundled messages without fetching JSON or dynamically importing languages. `change()` updates its state immediately and returns a promise for saving the language code. Storage defaults to local storage with the key `"lang"`; a string changes the key, and `false` keeps state only in the instance.

Storage initialization is explicit: `sync()` reads the saved language, `watch()` observes subsequent storage events, and `unwatch()` disconnects. The constructor does neither. `watch()` is not a general subscription to in-memory state; `sync()` and `watch()` require enabled storage. The current React provider connects these methods on mount and exposes their results through context.
