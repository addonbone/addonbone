import AbstractMeta from "./AbstractMeta";

import type {ReadonlyConfig} from "@typing/config";

export default class extends AbstractMeta {
    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    public getValue(): string | undefined {
        return this.getResolvedValue(this.config.incognito) || undefined
    }
}