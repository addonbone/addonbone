import {defineContentScriptAppend} from "adnbn";
export default defineContentScriptAppend({
    isolation: "iframe",
    frame: {page: "panel"},
    render() {
        return null;
    },
});
