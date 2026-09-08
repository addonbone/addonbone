import {ContentScriptIsolation, defineContentScriptAppend} from "adnbn";

export default defineContentScriptAppend({
    isolation: ContentScriptIsolation.Iframe,
    frame: {height: 320},
});
