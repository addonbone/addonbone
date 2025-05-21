import ViewParser from "./ViewParser";

import {PageEntrypointOptions} from "@typing/page";

export default class extends ViewParser<PageEntrypointOptions> {
    protected definition(): string {
        return 'definePage';
    }
}