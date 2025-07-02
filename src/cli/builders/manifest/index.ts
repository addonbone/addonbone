import ManifestV2 from "./ManifestV2";
import ManifestV3 from "./ManifestV3";

import {ManifestBuilder} from "@typing/manifest";
import {ReadonlyConfig} from "@typing/config";

export default (config: ReadonlyConfig): ManifestBuilder => {
    const {manifestVersion, browser} = config;

    if (manifestVersion === 2) {
        return new ManifestV2(browser);
    }

    return new ManifestV3(browser);
};
