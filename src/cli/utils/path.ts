import path from "path";

export const toPosix = (to: string): string => {
    return path.posix.join(...to.split(path.sep));
}