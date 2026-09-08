import runtimeTemplate from "./templates/runtime.template.js?raw";

import type {RuntimePropertyOptions} from "../types";
import {renderRuntimeTemplate} from "../utils/runtime-template";

interface RuntimeDataTemplateOptions extends RuntimePropertyOptions {
    readonly require: string;
    /** Validated and serialized JSON, parsed in the generated runtime to preserve keys such as __proto__. */
    readonly data: string;
}

export const renderRuntimeData = (options: RuntimeDataTemplateOptions): string =>
    renderRuntimeTemplate(runtimeTemplate, {
        __ADNBN_REQUIRE__: options.require,
        __ADNBN_PROPERTY__: JSON.stringify(options.property),
        __ADNBN_DATA__: JSON.stringify(options.data),
    });
