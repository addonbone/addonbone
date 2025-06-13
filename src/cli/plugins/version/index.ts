import {definePlugin} from "@main/plugin";

import AddonVersion from "./AddonVersion";
import BrowserMinimumVersion from "./BrowserMinimumVersion";

export {AddonVersion, BrowserMinimumVersion};

export default definePlugin(() => {
    return {
        name: 'adnbn:version',
        manifest: ({manifest, config}) => {
            manifest
                .setVersion(AddonVersion.version(config))
                .setMinimumVersion(BrowserMinimumVersion.version(config));
        }
    }
});
