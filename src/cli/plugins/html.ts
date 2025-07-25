import _ from "lodash";

import {Configuration as RspackConfig, HtmlRspackPlugin} from "@rspack/core";
import HtmlRspackTagsPlugin from "html-rspack-tags-plugin";

import {definePlugin} from "@main/plugin";

export default definePlugin(() => {
    return {
        name: "adnbn:html",
        bundler: ({config, rspack}) => {
            const hasHtml = rspack.plugins?.some(plugin => plugin instanceof HtmlRspackPlugin) ?? false;

            if (!hasHtml) {
                return {};
            }

            let options = _.isFunction(config.html) ? config.html() : config.html;

            if (_.isEmpty(options)) {
                return {};
            }

            if (!_.isArray(options)) {
                options = [options];
            }

            const plugins = options.map(options => new HtmlRspackTagsPlugin(options));

            return {plugins} satisfies RspackConfig;
        },
    };
});
