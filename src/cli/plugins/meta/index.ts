import Meta from "./Meta";
import {definePlugin} from "@main/plugin";

export default definePlugin(() => {
    let author: Meta

    return {
        name: 'adnbn:author',
        startup: ({config}) => {
            author = new Meta(config)
        },
        manifest: ({manifest}) => {
            manifest
                .setEmail(author.getEmail())
                .setAuthor(author.getAuthor())
                .setHomepage(author.getHomepage())
        }
    }
});
