import {Filename} from "@rspack/core";
import {createHash} from "crypto";
import _ from "lodash";
import path from "path";

export const appFilenameResolver = (app: string, filename: Filename, dirname?: string): Extract<Filename, Filename> =>
    (pathData, assetInfo): string => {
        let name = _.isFunction(filename) ? filename(pathData, assetInfo) : filename;

        const {chunk = {}} = pathData;

        const appHash = createHash('sha256')
            .update([app, chunk.name, chunk.hash].join('-'))
            .digest('hex');

        name = name.replace(/\[apphash(?::(\d+))?]/g, (match, lengthStr) => {
            if (lengthStr) {
                const length = parseInt(lengthStr, 10);

                return appHash.substring(0, length);
            }

            return appHash;
        });

        if (dirname) {
            return path.posix.join(dirname, name);
        }

        return name;
    }