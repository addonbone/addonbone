import {isManifestVersion3} from "@adnbn/browser";

import InjectCSSV2, {InjectCSSV2Options} from "./InjectCSSV2";
import InjectCSSV3, {InjectCSSV3Options} from "./InjectCSSV3";

import {InjectCSS} from "./types";

export {type InjectCSS};

export type InjectCSSOptions = InjectCSSV2Options & InjectCSSV3Options

export default (options: InjectCSSOptions): InjectCSS => {
    const {runAt, ...optionsV3} = options;
    const {documentId, ...optionsV2} = options;

    return isManifestVersion3()
        ? new InjectCSSV3(optionsV3)
        : new InjectCSSV2(optionsV2);
}
