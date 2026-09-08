import {defineContentScriptAppend} from "adnbn";
import "./watch.css";
export default defineContentScriptAppend({
    matches: ["http://127.0.0.1/*"],
    isolation: "iframe",
    frame: {page: "panel"},
    main() {
        console.info("isolation-watch-page");
    },
});
