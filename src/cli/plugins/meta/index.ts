import {definePlugin} from "@main/plugin";

import Author from "./Author";
import Email from "./Email";
import Homepage from "./Homepage";
import Incognito from "./Incognito";

export {Author, Email, Homepage, Incognito};

export default definePlugin(() => {
    return {
        name: 'adnbn:meta',
        manifest: ({manifest, config}) => {
            manifest
                .setEmail(Email.value(config))
                .setAuthor(Author.value(config))
                .setHomepage(Homepage.value(config))
                .setIncognito(Incognito.value(config));
        }
    }
});
