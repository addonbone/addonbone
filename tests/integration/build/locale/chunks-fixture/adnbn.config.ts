import {defineConfig} from "adnbn";
import {writeFileSync} from "node:fs";

export default defineConfig({
    name: "Locale chunks integration",
    version: "1.0.0",
    commonChunks: true,
    concatContentScripts: false,
    jsFilename: "[name].[chunkhash:8].js",
    specific: {gecko: {id: "locale-chunks@adnbn.test"}},
    bundler: config => {
        const splitChunks = config.optimization?.splitChunks;
        writeFileSync("cache-groups.json", JSON.stringify(Object.keys((splitChunks && splitChunks.cacheGroups) || {})));
        return {};
    },
});
