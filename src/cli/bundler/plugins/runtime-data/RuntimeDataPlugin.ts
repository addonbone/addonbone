import {RuntimeGlobals, RuntimeModule, type Chunk, type Compiler} from "@rspack/core";

import type {RuntimePropertyOptions} from "../types";
import {renderRuntimeData} from "./templates";
import {serializeRuntimeData} from "./utils";

export type RuntimeDataPluginData =
    | string
    | number
    | boolean
    | null
    | readonly RuntimeDataPluginData[]
    | {readonly [key: string]: RuntimeDataPluginData};

export interface RuntimeDataPluginOptions extends RuntimePropertyOptions {
    data: RuntimeDataPluginData;
    /** Select entrypoints by name. A shared runtime receives data if any of its entries matches. Defaults to all runtimes. */
    test?: (entry: string) => boolean;
}

class RuntimeDataRuntimeModule extends RuntimeModule {
    public constructor(
        private readonly property: string,
        private readonly data: string
    ) {
        super(`runtime data ${JSON.stringify(property)}`, RuntimeModule.STAGE_BASIC);
    }

    public generate(): string {
        return renderRuntimeData({property: this.property, data: this.data, require: RuntimeGlobals.require});
    }
}

/** Embeds data known before chunk hashing; it does not resolve output filenames or emit a separate file. */
export default class RuntimeDataPlugin {
    private readonly property: string;
    private data: RuntimeDataPluginData;
    private readonly test?: RuntimeDataPluginOptions["test"];

    public constructor(options: RuntimeDataPluginOptions) {
        this.property = options.property;
        this.data = options.data;
        this.test = options.test;
    }

    public apply(compiler: Compiler): void {
        compiler.hooks.thisCompilation.tap("RuntimeDataPlugin", compilation => {
            // Selected runtimes share an immutable snapshot for this compilation only.
            const injected = new Set<Chunk>();
            let data: string;
            try {
                data = serializeRuntimeData(this.data, this.property);
            } catch (error) {
                compilation.errors.push(error instanceof Error ? error : new Error(String(error)));
                return;
            }

            compilation.hooks.additionalTreeRuntimeRequirements.tap("RuntimeDataPlugin", (chunk, requirements) => {
                if (injected.has(chunk)) return;
                if (
                    this.test &&
                    !Array.from(compilation.entrypoints).some(
                        ([name, entrypoint]) => entrypoint.getRuntimeChunk() === chunk && this.test!(name)
                    )
                )
                    return;

                injected.add(chunk);
                requirements.add(RuntimeGlobals.require);
                compilation.addRuntimeModule(chunk, new RuntimeDataRuntimeModule(this.property, data));
            });
        });
    }

    /** Updates the data used by the next compilation, including watch rebuilds. */
    public update(data: RuntimeDataPluginData): void {
        this.data = data;
    }
}
