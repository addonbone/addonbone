import path from "path";
import _ from "lodash";

import AbstractLocaleFinder from "./AbstractLocaleFinder";

import {processPluginHandler} from "@cli/resolvers/plugin";

import {EntrypointFile} from "@typing/entrypoint";
import {LanguageCodes, LocaleDirectoryName} from "@typing/locale";

export default class extends AbstractLocaleFinder {
    protected async getFiles(): Promise<Set<EntrypointFile>> {
        const pluginResult = await Array.fromAsync(processPluginHandler(this.config.plugins, 'locale', {
            config: this.config,
        }));

        const files = new Set<EntrypointFile>();

        for await (let {name, result} of pluginResult) {
            if (_.isBoolean(result)) {
                result = LocaleDirectoryName;
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

                    if (_.isString(item) && this.isValidFilename(item)) {
                        file = this.file(item);
                    } else if (_.isPlainObject(item)) {
                        const {file: filename} = item as EntrypointFile;

                        if (filename && this.isValidFilename(filename)) {
                            file = item as EntrypointFile;
                        } else {
                            continue;
                        }
                    } else {
                        continue;
                    }

                    const {name: filename} = path.parse(file.file);

                    if (filename.includes(`.${this.config.browser}`) || !filename.includes('.')) {
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

        for (const code of LanguageCodes) {
            for (const file of [
                resolve(code),
                resolve(`${code}.${this.config.browser}`)
            ]) {
                if (file) {
                    files.add(file);
                }
            }
        }

        return files;
    }
}