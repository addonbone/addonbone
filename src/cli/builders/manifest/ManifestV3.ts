import ManifestBase from "./ManifestBase";
import {ManifestVersion} from "@typing/manifest";
import ManifestV3 = chrome.runtime.ManifestV3;

export default class extends ManifestBase<ManifestV3> {
    public getVersion(): ManifestVersion {
        return 3;
    }

    public build(): ManifestV3 {
        const manifest = super.build();

        if (this.background) {
            manifest.background = {service_worker: this.background};
        }

        return manifest;
    }
}