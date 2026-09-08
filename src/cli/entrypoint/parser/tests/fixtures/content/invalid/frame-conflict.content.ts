import {defineContentScriptAppend} from "adnbn";
export default defineContentScriptAppend({isolation: "iframe", frame: {page: "panel", src: "https://example.com"}});
