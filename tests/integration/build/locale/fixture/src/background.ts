import catalogue from "virtual/locale";

(globalThis as typeof globalThis & {readLocaleCatalogue: () => typeof catalogue}).readLocaleCatalogue = () => catalogue;

export default () => {};
