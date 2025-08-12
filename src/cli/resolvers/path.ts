import path from "path";
import _ from "lodash";

import {ReadonlyConfig} from "@typing/config";

export const getRootPath = (to: string): string => {
    return path.resolve(process.cwd(), to);
};

export const getInputPath = (config: ReadonlyConfig, to?: string): string => {
    return path.join(config.inputDir, to ?? "");
};

export const getSourcePath = (config: ReadonlyConfig, to?: string): string => {
    return getInputPath(config, path.join(config.sourceDir, to ?? ""));
};

export const getSharedPath = (config: ReadonlyConfig, to?: string): string => {
    return getInputPath(config, path.join(config.sourceDir, config.sharedDir, to ?? ""));
};

export const getAppPath = (config: ReadonlyConfig, to?: string): string => {
    return getInputPath(config, path.join(config.sourceDir, config.appsDir, config.app, to ?? ""));
};

export const getAppSourcePath = (config: ReadonlyConfig, to?: string): string => {
    return getAppPath(config, path.join(config.appSourceDir, to ?? ""));
};

export const getOutputPath = (config: ReadonlyConfig): string => {
    return getInputPath(
        config,
        path.join(config.outputDir, `${_.kebabCase(config.app)}-${config.browser}-mv${config.manifestVersion}`)
    );
};

export const getConfigFile = (config: ReadonlyConfig): string => {
    return getInputPath(config, config.configFile);
};
