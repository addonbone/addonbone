import path from "path";
import fs from "fs";
import _ from "lodash";
import type {TsConfigJson} from "type-fest";

import {definePlugin} from "@core/define";

import {getInputPath, getRootPath} from "@cli/resolvers/path";

import {ReadonlyConfig} from "@typing/config";

const dir = '.adnbn';

const getAlias = (config: ReadonlyConfig): Record<string, string> => {
    const srcDir = config.srcDir;
    const sharedDir = path.posix.join(config.srcDir, config.sharedDir);

    return {
        [config.srcDir]: srcDir,
        '@': srcDir,
        '@shared': sharedDir,
        '~': sharedDir,
    };
}

const getTypescriptConfig = (config: ReadonlyConfig): TsConfigJson => {
    const outputDir = path.posix.join('..', config.outputDir);

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
            outDir: outputDir,
            paths: _.reduce(getAlias(config), (paths, value, key) => ({
                ...paths,
                [path.posix.join(key, '*')]: [path.posix.join('..', value, '*')]
            }), {} as Record<string, string[]>),
        },
        include: [
            '../**/*',
            './vendor.d.ts'
        ],
        exclude: [
            outputDir
        ]
    };
};

const getVendorTypes = (): string[] => {
    return ['adnbn/client-types'].map((value) => `/// <reference types="${value}" />`);
}

const generateTypescriptConfig = (config: ReadonlyConfig): void => {
    const tsConfig = getTypescriptConfig(config);
    const vendorTypes = getVendorTypes();

    const systemDirPath = getRootPath(getInputPath(config, dir));

    fs.mkdirSync(systemDirPath, {recursive: true});

    fs.writeFileSync(path.join(systemDirPath, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));
    fs.writeFileSync(path.join(systemDirPath, 'vendor.d.ts'), vendorTypes.join('\n'));
}

export default definePlugin(() => {
    return {
        name: 'adnbn:typescript',
        bundler: ({config}) => {
            generateTypescriptConfig(config);

            return {
                resolve: {
                    extensions: [".ts", ".tsx", ".js"],
                    alias: _.mapValues(getAlias(config), (value) => getRootPath(value))
                },
                module: {
                    rules: [
                        {
                            test: /\.tsx?$/,
                            loader: "builtin:swc-loader",
                            options: {
                                sourceMap: true,
                                jsc: {
                                    parser: {
                                        syntax: "typescript",
                                        tsx: true
                                    }
                                },
                                target: "es2020"
                            },
                            type: 'javascript/auto',
                        }
                    ]
                }
            };
        },
    };
});