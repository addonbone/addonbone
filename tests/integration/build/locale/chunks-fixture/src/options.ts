import {defineOptions} from "adnbn";
import catalogue from "virtual/locale";
import {createPanel} from "./panel";

export default defineOptions({render: () => createPanel(catalogue, "options")});
