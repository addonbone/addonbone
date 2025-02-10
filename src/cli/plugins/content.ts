import path from "path";
import {Configuration} from "webpack";
import VirtualModulesPlugin from "webpack-virtual-modules";

import {definePlugin} from "@core/define";

import {getAppsPath} from "../resolvers/path";
import {ManifestContentScript} from "@typing/manifest";


export default definePlugin(() => {
    const contentScripts: ManifestContentScript[] = [];

    return {
        webpack: async ({config}): Promise<Configuration> => {

            //
            // console.log(findContentFiles(getAppsPath(config)));
            // console.log(findContentFiles(getSharedPath(config)));

            const p = path.resolve(getAppsPath(config), 'src/some.ts');

            return {
                entry: {
                    some: p,
                },
                plugins: [
                    new VirtualModulesPlugin({
                        [p]: 'console.log("Hello, World!")'
                    })
                ]
            };
        },
        manifest: ({manifest}) => {
            manifest.pushContentScript(...contentScripts);
        }
    };
});