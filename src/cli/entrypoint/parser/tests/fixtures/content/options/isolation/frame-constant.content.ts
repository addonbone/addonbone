import {defineContentScriptAppend} from "adnbn";
const page = "panel";
const frame = {page, height: 320};
export default defineContentScriptAppend({isolation: "iframe", frame});
