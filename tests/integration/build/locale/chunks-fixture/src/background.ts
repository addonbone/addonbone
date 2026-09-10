import catalogue from "virtual/locale";

(globalThis as typeof globalThis & {catalogue: typeof catalogue}).catalogue = catalogue;

export default () => {};
