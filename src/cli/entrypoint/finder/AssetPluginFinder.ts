import _ from "lodash";
import path from "path";
import pluralize from "pluralize";

import {processPluginHandler} from "@cli/resolvers/plugin";

import AbstractFinder from "./AbstractFinder";
import AbstractAssetFinder from "./AbstractAssetFinder";

import {EntrypointFile} from "@typing/entrypoint";
import {ReadonlyConfig} from "@typing/config";
import {PluginAssetKeys} from "@typing/plugin";

export default class extends AbstractFinder {
    constructor(
        config: ReadonlyConfig,
        protected readonly key: PluginAssetKeys,
        protected readonly finder: AbstractAssetFinder
    ) {
        super(config);
    }

    protected async getFiles(): Promise<Set<EntrypointFile>> {
        const pluginResult = await Array.fromAsync(
            processPluginHandler(this.config.plugins, this.key, {
                config: this.config,
            })
        );

        const files = new Set<EntrypointFile>();

        for await (let {name, result} of pluginResult) {
            if (_.isBoolean(result)) {
                result = pluralize(this.key);
            }

            if (_.isString(result)) {
                result = await this.findFiles(name, result);
            }

            if (_.isArray(result) || _.isSet(result)) {
                for (const item of result) {
                    if (_.isEmpty(item)) {
                        continue;
                    }

                    let file: EntrypointFile;

                    if (_.isString(item) && this.finder.isValidFilename(item)) {
                        file = this.file(item);
                    } else if (_.isPlainObject(item)) {
                        const {file: filename} = item as EntrypointFile;

                        if (filename && this.finder.isValidFilename(filename)) {
                            file = item as EntrypointFile;
                        } else {
                            continue;
                        }
                    } else {
                        continue;
                    }

                    const {name: filename} = path.parse(file.file);

                    if (filename.endsWith(`.${this.config.browser}`) || !filename.includes(".")) {
                        files.add(file);
                    }
                }
            }
        }

        return files;
    }

    protected async findFiles(name: string, directory: string): Promise<Set<EntrypointFile>> {
        const files = new Set<EntrypointFile>();
        const resolve = (file: string) => this.resolveSafely(name, path.posix.join(directory, file));

        for (const name of this.finder.getNames()) {
            for (const file of [resolve(name), resolve(`${name}.${this.config.browser}`)]) {
                if (file) {
                    files.add(file);
                }
            }
        }

        return files;
    }
}
