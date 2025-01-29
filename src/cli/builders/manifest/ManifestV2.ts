import ManifestBase from "./ManifestBase";
import {ManifestVersion} from "@typing/manifest";
import ManifestV2 = chrome.runtime.ManifestV2;

export default class extends ManifestBase<ManifestV2> {

    public getVersion(): ManifestVersion {
        return 2;
    }

    public build(): ManifestV2 {
        const manifest = super.build();

        if (this.background) {
            manifest.background = {scripts: [this.background], persistent: false};
        }

        return manifest;
    }

}