import _ from "lodash";

import {ContentScriptConfig, ContentScriptEntrypointOptions} from "@typing/content";

export const getContentScriptConfigFromOptions = (options: ContentScriptEntrypointOptions): ContentScriptConfig => {
    return _.pick(options, [
        'matches',
        'excludeMatches',
        'includeGlobs',
        'excludeGlobs',
        'allFrames',
        'runAt',
        'world',
        'matchAboutBlank',
        'matchOriginAsFallback',
    ]);
}