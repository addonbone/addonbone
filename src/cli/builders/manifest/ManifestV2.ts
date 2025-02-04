import ManifestBase from "./ManifestBase";

import {ManifestVersion} from "@typing/manifest";
import {Browser} from "@typing/config";

import ManifestV2 = chrome.runtime.ManifestV2;

export default class extends ManifestBase<ManifestV2> {

    public constructor(browser: Browser) {
        super(browser);
    }

    public getManifestVersion(): ManifestVersion {
        return 2;
    }

    protected buildBackground(): Partial<ManifestV2> | undefined {
        if (this.background) {
            const {file, persistent} = this.background;

            return {background: {scripts: [file], persistent}};
        }
    }

    protected buildContentScripts(): Partial<ManifestV2> | undefined {
        if (this.contentScripts.size > 0) {
            const contentScripts: ManifestV2['content_scripts'] = Array.from(this.contentScripts, ([_, contentScript]) => ({
                matches: contentScript.matches,
                js: [contentScript.file],
                exclude_matches: contentScript.excludeMatches,
                all_frames: contentScript.allFrames,
                run_at: contentScript.runAt,
                exclude_globs: contentScript.excludeGlobs,
                include_globs: contentScript.includeGlobs,
            }));

            return {content_scripts: contentScripts};
        }
    }
}