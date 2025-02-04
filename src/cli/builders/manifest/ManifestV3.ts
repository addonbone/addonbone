import ManifestBase from "./ManifestBase";

import {ManifestVersion} from "@typing/manifest";
import {Browser} from "@typing/config";

import ManifestV3 = chrome.runtime.ManifestV3;

export default class extends ManifestBase<ManifestV3> {
    public constructor(browser: Browser) {
        super(browser);
    }

    public getManifestVersion(): ManifestVersion {
        return 3;
    }

    protected buildBackground(): Partial<ManifestV3> | undefined {
        if (this.background) {
            return {background: {service_worker: this.background.file}};
        }
    }

    protected buildContentScripts(): Partial<ManifestV3> | undefined {
        if (this.contentScripts.size > 0) {
            const contentScripts: ManifestV3['content_scripts'] = Array.from(this.contentScripts, ([_, contentScript]) => ({
                matches: contentScript.matches,
                exclude_matches: contentScript.excludeMatches,
                js: [contentScript.file],
                all_frames: contentScript.allFrames,
                run_at: contentScript.runAt,
                exclude_globs: contentScript.excludeGlobs,
                include_globs: contentScript.includeGlobs,
                world: contentScript.world,
            }));

            return {content_scripts: contentScripts};
        }
    }
}