import {defineRelay} from "adnbn";

export default defineRelay({
    isolation: "iframe",
    frame: {page: "panel"},
    init() {
        return {};
    },
});
