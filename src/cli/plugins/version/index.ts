import {definePlugin} from "@main/plugin";

import AbstractVersion from "./AbstractVersion";
import AddonVersion from "./AddonVersion";
import BrowserMinimumVersion from "./BrowserMinimumVersion";

export {AddonVersion, BrowserMinimumVersion};

export default definePlugin(() => {
    let addonVersion: AbstractVersion;
    let browserMinimumVersion: AbstractVersion;

    return {
        name: 'adnbn:version',
        startup: ({config}) => {
            addonVersion = new AddonVersion(config)
            browserMinimumVersion = new BrowserMinimumVersion(config)
        },
        manifest: ({manifest}) => {
            manifest
                .setVersion(addonVersion.getVersion())
                .setMinimumVersion(browserMinimumVersion.getVersion());
        }
    }
});
