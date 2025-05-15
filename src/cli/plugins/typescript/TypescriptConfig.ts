import path from "path";
import _ from "lodash";
import {TsConfigJson} from "type-fest";

import FileBuilder from "./FileBuilder";

import {ReadonlyConfig} from "@typing/config";
import {getRootPath} from "@cli/resolvers/path";


export default class extends FileBuilder {
    public constructor(config: ReadonlyConfig) {
        super(config);
    }

    protected filename(): string {
        return 'tsconfig.json';
    }

    protected withBanner(): boolean {
        return false;
    }

    protected content(): string {
        return JSON.stringify(this.json(), null, 2);
    }

    protected alias(): Record<string, string> {
        const srcDir = this.config.srcDir;
        const sharedDir = path.posix.join(srcDir, this.config.sharedDir);

        return {
            [srcDir]: srcDir,
            '@': srcDir,
            '@shared': sharedDir,
            '~': sharedDir,
        };
    }

    public aliases(): Record<string, string> {
        return _.mapValues(this.alias(), (value) => getRootPath(value))
    }

    public json(): TsConfigJson {
        const outputDir = path.posix.join('..', this.config.outputDir);

        return {
            compilerOptions: {
                target: "ESNext",
                module: "ESNext",
                moduleResolution: "Bundler",
                esModuleInterop: true,
                forceConsistentCasingInFileNames: true,
                resolveJsonModule: true,
                strict: true,
                skipLibCheck: true,
                noEmit: true,
                outDir: outputDir,
                paths: _.reduce(this.alias(), (paths, value, key) => ({
                    ...paths,
                    [path.posix.join(key, '*')]: [path.posix.join('..', value, '*')]
                }), {} as Record<string, string[]>),
            },
            include: [
                '../**/*',
                './vendor.d.ts',
                './locale.d.ts',
                './service.d.ts',
                './icon.d.ts',
            ],
            exclude: [
                outputDir
            ]
        };
    }
}