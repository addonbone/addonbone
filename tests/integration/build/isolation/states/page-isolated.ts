import {defineContentScriptAppend} from "adnbn";
import "./watch.css?isolation";

export default defineContentScriptAppend({
    matches: ["http://127.0.0.1/*"],
    isolation: "iframe",
    frame: {page: "panel"},
});
