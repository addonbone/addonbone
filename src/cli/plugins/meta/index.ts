import {definePlugin} from "@main/plugin";

import {Author, Email, Homepage, Incognito} from "./Metadata";

import type {ManifestIncognito} from "@typing/manifest";

export {Author, Email, Homepage, Incognito};

export default definePlugin(() => {
    return {
        name: 'adnbn:author',
        manifest: ({manifest, config}) => {
            manifest
                .setEmail(Email.value(config))
                .setAuthor(Author.value(config))
                .setHomepage(Homepage.value(config))
                .setIncognito(Incognito.value(config) as ManifestIncognito)
        }
    }
});
