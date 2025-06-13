import {definePlugin} from "@main/plugin";

import AbstractVersion from "./AbstractVersion";
import AddonVersion from "./AddonVersion";
import BrowserMinimumVersion from "./BrowserMinimumVersion";

export default definePlugin(() => {
    let addonVersion: AbstractVersion
    let browserMinimumVersion: AbstractVersion

    return {
        name: 'adnbn:version',
        startup: ({config}) => {
            addonVersion = new AddonVersion(config)
            browserMinimumVersion = new BrowserMinimumVersion(config)
        },
        manifest: ({manifest}) => {
            const version = addonVersion.getVersion()
            const minimumVersion = browserMinimumVersion.getVersion()

            version && manifest.setVersion(version)
            minimumVersion && manifest.setMinimumVersion(minimumVersion)
        }
    }
});
