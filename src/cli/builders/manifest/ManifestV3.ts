import ManifestBase, {ManifestError} from "./ManifestBase";

import {ManifestVersion} from "@typing/manifest";
import {Browser} from "@typing/browser";

type ManifestV3 = chrome.runtime.ManifestV3;

export default class extends ManifestBase<ManifestV3> {
    public constructor(browser: Browser) {
        super(browser);
    }

    public getManifestVersion(): ManifestVersion {
        return 3;
    }

    protected buildBackground(): Partial<ManifestV3> | undefined {
        if (this.background) {
            const {entry} = this.background;

            const dependencies = this.dependencies.get(entry);

            if (!dependencies) {
                throw new ManifestError(`Background entry "${entry}" not found in dependencies`);
            }

            if (dependencies.js.size === 0) {
                throw new ManifestError(`Background entry "${entry}" has no dependencies`);
            }

            if (dependencies.js.size > 1) {
                throw new ManifestError(`Background entry "${entry}" has more than one dependency`);
            }

            const [js] = Array.from(dependencies.js);

            return {background: {service_worker: js}};
        }
    }

    protected buildAction(): Partial<ManifestV3> | undefined {
        if (this.action) {
            const {popup, icon, title} = this.action;

            return {
                action: {
                    default_popup: popup,
                    default_icon: icon,
                    default_title: title
                }
            };
        } else if (this.hasExecuteActionCommand()) {
            return {
                action: {
                    default_title: this.name,
                }
            };
        }
    }

    protected buildHostPermissions(): Partial<ManifestV3> | undefined {
        if (this.hostPermissions.size > 0) {
            return {host_permissions: Array.from(this.hostPermissions)};
        }
    }
}