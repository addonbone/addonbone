import {defineContentScriptAppend} from "adnbn";
export default defineContentScriptAppend({isolation: "iframe", frame: {page: computeTarget()}});
