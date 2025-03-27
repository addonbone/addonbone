import {EntrypointFile, EntrypointType} from "@typing/entrypoint";
import {Framework} from "@typing/framework";

const extensions = ['ts', 'tsx', 'js', 'jsx', 'vue', 'svelte', 'solid.ts'];

const extensionsPattern = extensions
    .map(ext => ext.replace('.', '\\.'))
    .join('|');

const indexRegex = new RegExp(`^index\\.(${extensionsPattern})$`, 'i');

const extensionRegex = new RegExp(`\\.(${extensionsPattern})$`, 'i');

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

    const fileNameWithoutExt = lastPart.replace(extensionRegex, '');

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

export const getEntrypointIndexFilenames = (): Set<string> => {
    return new Set(extensions.map((ext) => `index.${ext}`));
}

export const isSupportedEntrypointExtension = (ext: string): boolean => {
    if (ext.startsWith('.')) {
        ext = ext.slice(1);
    }

    return extensions.includes(ext);
}

export const isEntrypointFilename = (filename: string, entrypoint: EntrypointType): boolean => {
    const entry = entrypoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const pattern = new RegExp(`^(?:.*\\.)?${entry}\\.(${extensionsPattern})$`);

    return pattern.test(filename);
}