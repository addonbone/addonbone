import _ from 'lodash';

import {ContentScriptConfig, ContentScriptEntrypointOptions} from '@typing/content';
import {ManifestMatchSchemes, ManifestSpecialSchemes} from "@typing/manifest";

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

export const filterContentScriptsMatchPatterns = (patterns: Set<string>): Set<string> => {
    if (patterns.has('<all_urls>')) {
        return new Set(['<all_urls>']);
    }

    const result = new Set<string>();

    const activeWildcards = new Set<string>();

    if (patterns.has('*://*/*')) {
        activeWildcards.add('*://*/*');
        result.add('*://*/*');
    }

    for (const scheme of ManifestMatchSchemes) {
        const wildcard = `${scheme}://*/*`;

        if (patterns.has(wildcard)) {
            if (scheme === 'http' || scheme === 'https') {
                if (!activeWildcards.has('*://*/*')) {
                    activeWildcards.add(wildcard);
                    result.add(wildcard);
                }
            } else {
                activeWildcards.add(wildcard);
                result.add(wildcard);
            }
        }
    }

    const isCoveredByWildcard = (pattern: string): boolean => {
        const schemeIndex = pattern.indexOf('://');
        if (schemeIndex === -1) return false;

        const scheme = pattern.substring(0, schemeIndex);

        if (ManifestSpecialSchemes.has(scheme)) {
            return false;
        }

        if (activeWildcards.has('*://*/*') && (scheme === 'http' || scheme === 'https')) {
            return true;
        }

        return activeWildcards.has(`${scheme}://*/*`);
    };

    for (const pattern of patterns) {
        if (activeWildcards.has(pattern)) {
            continue;
        }

        if (!isCoveredByWildcard(pattern)) {
            result.add(pattern);
        }
    }

    return result;
}
