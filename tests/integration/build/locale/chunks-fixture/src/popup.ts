import {definePopup} from "adnbn";
import catalogue from "virtual/locale";
import {createPanel} from "./panel";

export default definePopup({render: () => createPanel(catalogue, "popup")});
