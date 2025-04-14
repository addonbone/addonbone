import {EntrypointFileExtensions, EntrypointType} from "@typing/entrypoint";

const extPattern = [...EntrypointFileExtensions]
    .map(ext => ext.replace('.', '\\.'))
    .join('|');

const extRegex = new RegExp(`\\.(${extPattern})$`, 'i');


export const isSupportedEntrypointExtension = (extension: string): boolean => {
    if (extension.startsWith('.')) {
        extension = extension.slice(1);
    }

    return EntrypointFileExtensions.has(extension);
}

export const isValidEntrypointFilename = (filename: string): boolean => {
    return extRegex.test(filename);
}

export const isEntrypointFilename = (filename: string, entrypoint: EntrypointType): boolean => {
    const name = entrypoint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const pattern = new RegExp(`^(?:.*\\.)?${name}\\.(${extPattern})$`);

    return pattern.test(filename);
}