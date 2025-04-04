import path from "path";

export const toPosix = (to: string): string => {
    return path.posix.join(...to.split(path.sep));
}

export const isFileExtension = (filename: string, extension: string | string[]): boolean => {
    if (typeof extension === "string") {
        extension = [extension];
    }

    let {ext} = path.parse(filename);

    if (ext.startsWith('.')) {
        ext = ext.slice(1);
    }

    return extension.includes(ext);
}