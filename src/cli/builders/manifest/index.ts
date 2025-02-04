import {ManifestBuilder, ManifestMapping, ManifestVersion} from "@typing/manifest";
import ManifestV2 from './ManifestV2';
import ManifestV3 from './ManifestV3';

import {Browser} from "@typing/config";

export default <T extends ManifestVersion>(browser: Browser, manifestVersion: T): ManifestBuilder<ManifestMapping[T]> => {
    if (manifestVersion === 2) {
        return new ManifestV2(browser);
    }

    return new ManifestV3(browser);
}