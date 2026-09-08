import _ from "lodash";
import {isContentScriptFrameNavigation} from "@shared/content";

import {ContentScriptConfig, ContentScriptEntrypointOptions, ContentScriptIsolation} from "@typing/content";

/** ShadowRoot or a blank iframe provides a local target for isolated styles and UI. */
export const hasIsolatedTarget = (options: ContentScriptEntrypointOptions): boolean =>
    options.isolation === ContentScriptIsolation.Shadow ||
    (options.isolation === ContentScriptIsolation.Iframe && !isContentScriptFrameNavigation(options.frame));

export const getContentScriptConfigFromOptions = (options: ContentScriptEntrypointOptions): ContentScriptConfig => {
    const config = _.pick(options, [
        "matches",
        "excludeMatches",
        "includeGlobs",
        "excludeGlobs",
        "allFrames",
        "runAt",
        "world",
        "matchAboutBlank",
        "matchOriginAsFallback",
    ]) as ContentScriptConfig;

    const sort = (arr?: string[]) => arr?.toSorted((a, b) => a.localeCompare(b));

    return {
        ...config,
        matches: sort(config.matches),
        excludeMatches: sort(config.excludeMatches),
        includeGlobs: sort(config.includeGlobs),
        excludeGlobs: sort(config.excludeGlobs),
    };
};
