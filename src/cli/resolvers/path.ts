import path from 'path';

import {ReadonlyConfig} from "@typing/config";

export const getRootPath = (to: string): string => {
    return path.resolve(process.cwd(), to);
}

export const getConfigFile = (config: ReadonlyConfig): string => {
    return path.resolve(config.inputDir, config.configFile);
}

export const getSharedPath = (config: ReadonlyConfig): string => {
    return path.resolve(config.inputDir, config.srcDir, config.sharedDir);
}

export const getAppsPath = (config: ReadonlyConfig): string => {
    return path.resolve(config.inputDir, config.srcDir, config.appsDir, config.app);
}

export const getOutputPath = (config: ReadonlyConfig): string => {
    return path.resolve(config.outputDir, `${config.app}-${config.browser}-mv${config.manifestVersion}`);
}