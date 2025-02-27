import ManifestBase, {ManifestError} from "./ManifestBase";

import {ManifestVersion} from "@typing/manifest";
import {Browser} from "@typing/browser";

type ManifestV2 = chrome.runtime.ManifestV2;

export default class extends ManifestBase<ManifestV2> {

    public constructor(browser: Browser) {
        super(browser);
    }

    public getManifestVersion(): ManifestVersion {
        return 2;
    }

    protected buildBackground(): Partial<ManifestV2> | undefined {
        if (this.background) {
            const {entry, persistent} = this.background;

            const dependencies = this.dependencies.get(entry);

            if (!dependencies) {
                throw new ManifestError(`Background entry "${entry}" not found in dependencies`);
            }

            if (dependencies.js.size === 0) {
                throw new ManifestError(`Background entry "${entry}" has no dependencies`);
            }

            const scripts = Array.from(dependencies.js);

            return {background: {scripts, persistent: persistent || undefined}};
        }
    }

    protected buildContentScripts(): Partial<ManifestV2> | undefined {
        if (this.contentScripts.size > 0) {
            const contentScripts: ManifestV2['content_scripts'] = Array.from(this.contentScripts, ([_, contentScript]) => ({
                matches: contentScript.matches,
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