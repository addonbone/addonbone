import {ManifestBuilder, ManifestMapping, ManifestVersion} from "@typing/manifest";
import ManifestV2 from './ManifestV2';
import ManifestV3 from './ManifestV3';

export default <T extends ManifestVersion>(manifestVersion: T): ManifestBuilder<ManifestMapping[T]> => {
    if (manifestVersion === 2) {
        return new ManifestV2();
    }

    return new ManifestV3();
}