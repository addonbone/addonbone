import {defineContentScriptAppend} from "adnbn";
const alias = "panel";
export default defineContentScriptAppend({isolation: "iframe", frame: {page: alias, width: "80%"}});
