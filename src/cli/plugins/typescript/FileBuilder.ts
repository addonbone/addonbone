import fs from "fs";
import path from "path";

import {getInputPath, getRootPath} from "@cli/resolvers/path";

import {SystemDir} from "@typing/app";
import {ReadonlyConfig} from "@typing/config";

export default abstract class {
    protected abstract filename(): string;

    protected abstract content(): string;

    protected constructor(protected readonly config: ReadonlyConfig) {
    }

    public build(): this {
        const systemDirPath = getRootPath(getInputPath(this.config, SystemDir));

        fs.mkdirSync(systemDirPath, {recursive: true});

        fs.writeFileSync(path.join(systemDirPath, this.filename()), this.content());

        return this;
    }
}