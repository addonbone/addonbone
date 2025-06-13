import Author from "./Author";
import {definePlugin} from "@main/plugin";

export default definePlugin(() => {
    let author: Author

    return {
        name: 'adnbn:author',
        startup: ({config}) => {
            author = new Author(config)
        },
        manifest: ({manifest}) => {
            manifest
                .setEmail(author.getEmail())
                .setAuthor(author.getAuthor())
                .setHomepage(author.getHomepage())
        }
    }
});
