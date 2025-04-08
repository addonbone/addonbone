import path from "path";

import {EntrypointFile, EntrypointFileExtensions, EntrypointType} from "@typing/entrypoint";
import {Framework} from "@typing/framework";

const extPattern = [...EntrypointFileExtensions]
    .map(ext => ext.replace('.', '\\.'))
    .join('|');

const extRegex = new RegExp(`\\.(${extPattern})$`, 'i');

export const getEntrypointName = (file: EntrypointFile, entrypoint: EntrypointType): string => {
    const key = '.' + entrypoint;

    const {name, dir} = path.parse(file.file);

    if (name === 'index') {
        const dirName = path.basename(dir);

        if (dirName.includes(key)) {
            return dirName.split(key)[0];
        }

        if (dirName === entrypoint) {
            return entrypoint;
        }
    }

    if (name.includes(key)) {
        return name.split(key)[0];
    }

    if (name === entrypoint) {
        return entrypoint;
    }

    return name;
}

export const getEntrypointFileFramework = (file: EntrypointFile): Framework => {
    if (/\.(jsx|tsx)$/.test(file.file)) {
        return Framework.React;
    }

    return Framework.Vanilla;
}
export const isSupportedEntrypointExtension = (ext: string): boolean => {
    if (ext.startsWith('.')) {
        ext = ext.slice(1);
    }

    return EntrypointFileExtensions.has(ext);
}

export const isValidEntrypointFilename = (filename: string): boolean => {
    return extRegex.test(filename);
}

export const isEntrypointFilename = (filename: string, entrypoint: EntrypointType): boolean => {
    const name = entrypoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const pattern = new RegExp(`^(?:.*\\.)?${name}\\.(${extPattern})$`);

    return pattern.test(filename);
}