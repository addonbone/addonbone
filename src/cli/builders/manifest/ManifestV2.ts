import ManifestBase, {ManifestError} from "./ManifestBase";

import {ManifestVersion} from "@typing/manifest";
import {Browser} from "@typing/browser";

type ManifestV2 = chrome.runtime.ManifestV2;
type ManifestV3 = chrome.runtime.ManifestV3;

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

    protected buildAction(): Partial<ManifestV2> | undefined {
        if (this.popup) {
            const {icon, title, path} = this.popup;

            return {
                browser_action: {
                    default_title: title || this.name,
                    default_popup: path,
                    default_icon: this.getIconsByName(icon),
                }
            };
        } else if (this.hasExecuteActionCommand()) {
            return {
                browser_action: {
                    default_title: this.name,
                }
            };
        }
    }

    protected buildSidebar(): Partial<ManifestV2> | undefined {
        return undefined;
    }

    protected buildContentScripts(): Partial<ManifestV2> | undefined {
        const manifest = super.buildContentScripts() as Partial<ManifestV3>;

        if (manifest) {
            const {content_scripts} = manifest;

            if (!content_scripts) {
                return;
            }

            const contentScripts = content_scripts
                //@ts-ignore
                .map(({world, match_origin_as_fallback, ...script}) => script);

            return {content_scripts: contentScripts};
        }
    }

    protected buildHostPermissions(): Partial<ManifestV2> | undefined {
        return undefined;
    }

    protected buildWebAccessibleResources(): Partial<ManifestV2> | undefined {
        const resources: string[] = [];

        for (const contentScript of this.contentScripts.values()) {
            const assets = this.dependencies.get(contentScript.entry)?.assets;

            if (assets && assets.size > 0) {
                resources.push(...assets);
            }
        }

        if (resources.length > 0) {
            return {web_accessible_resources: Array.from(new Set(resources))};
        }
    }

}