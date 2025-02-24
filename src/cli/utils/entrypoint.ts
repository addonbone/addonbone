import _ from "lodash";

import {EntrypointFile} from "@typing/entrypoint";

export const isEqualEntrypointFile = (a: EntrypointFile, b: EntrypointFile): boolean => {
    return _.isEqual(a, b);
}