import catalogue, {keys, languages} from "virtual/locale";

(globalThis as typeof globalThis & {readLocaleCatalogue: () => typeof catalogue}).readLocaleCatalogue = () => catalogue;
(globalThis as typeof globalThis & {readLocaleKeys: () => typeof keys}).readLocaleKeys = () => keys;
(globalThis as typeof globalThis & {readLocaleLanguages: () => typeof languages}).readLocaleLanguages = () => languages;

export default () => {};
