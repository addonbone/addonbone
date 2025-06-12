import Version from "./Version";
import {definePlugin} from "@main/plugin";

export default definePlugin(() => {
    let version: Version

    return {
        name: 'adnbn:version',
        startup: ({config}) => {
            version = new Version(config)
        },
        manifest: ({manifest}) => {
            const extVersion = version.resolveVersion()
            const minimumVersion = version.resolveMinimumVersion()

            extVersion && manifest.setVersion(extVersion)
            minimumVersion && manifest.setMinimumVersion(minimumVersion)
        }
    }
});
