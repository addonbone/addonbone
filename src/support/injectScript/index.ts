import {isManifestVersion3} from "@browser/runtime";

import InjectScriptV2, {type InjectScriptV2Options} from "./InjectScriptV2"
import InjectScriptV3, {type InjectScriptV3Options} from "./InjectScriptV3"

import type {InjectScript} from "./types";

export {type InjectScript}

export type InjectScriptOptions = InjectScriptV2Options & InjectScriptV3Options

export default (options: InjectScriptOptions): InjectScript => {
    const {timeFallback, ...optionsV3} = options;
    const {documentId, world, ...optionsV2} = options;

    return isManifestVersion3()
        ? new InjectScriptV3(optionsV3)
        : new InjectScriptV2(optionsV2)
}
