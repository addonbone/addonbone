import {defineContentScriptAppend} from "adnbn";
export default defineContentScriptAppend({isolation: "iframe", frame: {src: computeTarget()}});
