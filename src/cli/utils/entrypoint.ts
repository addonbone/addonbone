import {EntrypointFile, EntrypointType} from "@typing/entrypoint";

export const getEntrypointName = (file: EntrypointFile, entrypoint: EntrypointType): string => {
    const normalizedPath = file.file.replace(/^\//, '');

    const key = '.' + entrypoint;

    const parts = normalizedPath.split('/');

    const lastPart = parts[parts.length - 1];

    if (lastPart === 'index.ts' || lastPart === 'index.tsx') {
        const dirName = parts[parts.length - 2];

        if (dirName.includes(key)) {
            return dirName.split(key)[0];
        }

        if (dirName === entrypoint) {
            return entrypoint;
        }
    }

    const fileNameWithoutExt = lastPart.replace(/\.(ts|tsx)$/, '');

    if (fileNameWithoutExt.includes(key)) {
        return fileNameWithoutExt.split(key)[0];
    }

    if (fileNameWithoutExt === entrypoint) {
        return entrypoint;
    }

    return fileNameWithoutExt;
}