import fs from "fs";
import path from "path";
import {Configuration} from "webpack";
import VirtualModulesPlugin from "webpack-virtual-modules";

import {getAppsPath} from "@cli/resolvers/path";
import {ContentScript} from "@typing/content";
import {Plugin} from "@typing/plugin";


const findContentFiles = (dir: string): Record<string, string> => {
    if (!fs.existsSync(dir)) return {};

    const contentDir = path.join(dir, 'content');

    if (fs.existsSync(contentDir) && fs.statSync(contentDir).isDirectory()) {
        for (const file of ['index.ts', 'index.js']) {
            const indexFile = path.join(contentDir, file);

            if (fs.existsSync(indexFile)) {
                return {content: indexFile};
            }
        }
    }

    const contentRegex = /content\.(ts|js)$/;
    const contentFiles = fs.readdirSync(dir);

    return contentFiles
        .filter(file => contentRegex.test(file))
        .reduce((records, file) => {
            return {...records, [path.basename(file, path.extname(file))]: path.join(dir, file)}
        }, {} as Record<string, string>);

}


export default (): Plugin => {
    const contentScripts: ContentScript[] = [];

    return {
        webpack: async ({config}): Promise<Configuration> => {

            const files = findContentFiles(getAppsPath(config));

            for (const key in files) {
                const dd = await import(files[key]);

                console.log(dd.config);
            }

            //
            // console.log(findContentFiles(getAppsPath(config)));
            // console.log(findContentFiles(getSharedPath(config)));

            const p = path.resolve(__dirname, 'src/some.ts');

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
};