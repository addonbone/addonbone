import {EntrypointFile, EntrypointFileExtensions, EntrypointType} from "@typing/entrypoint";
import {Framework} from "@typing/framework";

const extPattern = [...EntrypointFileExtensions]
    .map(ext => ext.replace('.', '\\.'))
    .join('|');

const indexRegex = new RegExp(`^index\\.(${extPattern})$`, 'i');

const extRegex = new RegExp(`\\.(${extPattern})$`, 'i');

export const getEntrypointName = (file: EntrypointFile, entrypoint: EntrypointType): string => {
    const normalizedPath = file.file.replace(/^\//, '');

    const key = '.' + entrypoint;

    const parts = normalizedPath.split('/');

    const lastPart = parts[parts.length - 1];

    if (indexRegex.test(lastPart)) {
        const dirName = parts[parts.length - 2];

        if (dirName.includes(key)) {
            return dirName.split(key)[0];
        }

        if (dirName === entrypoint) {
            return entrypoint;
        }
    }

    const fileNameWithoutExt = lastPart.replace(extRegex, '');

    if (fileNameWithoutExt.includes(key)) {
        return fileNameWithoutExt.split(key)[0];
    }

    if (fileNameWithoutExt === entrypoint) {
        return entrypoint;
    }

    return fileNameWithoutExt;
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