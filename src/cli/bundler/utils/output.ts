import {Filename} from "@rspack/core";
import _ from "lodash";
import path from "path";

// prettier-ignore
export const appFilenameResolver =
    (app: string, filename: Filename, dirname?: string): Extract<Filename, Filename> =>
        (pathData, assetInfo): string => {
            app = _.kebabCase(app);

            let name = _.isFunction(filename) ? filename(pathData, assetInfo) : filename;

            name = name.replaceAll("[app]", app);

            if (dirname) {
                return path.posix.join(dirname, name);
            }

            return name;
        };
