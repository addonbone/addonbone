import {mergeWithCustomize} from "webpack-merge";

import WatchPlugin from "../plugins/WatchPlugin";
import EntrypointPlugin from "../plugins/EntrypointPlugin";

export default mergeWithCustomize({
    customizeArray: (a: any[], b: any[], key: string) => {
        if (key === 'plugins') {
            const names = new Set();

            return [...a, ...b].filter(plugin => {
                let name: string | undefined = plugin?.constructor?.name;

                if (plugin instanceof WatchPlugin || plugin instanceof EntrypointPlugin) {
                    name = plugin.key;
                }

                if (names.has(name)) return false;
                names.add(name);
                return true;
            });
        }

        if (key === 'resolve.plugins') {
            const names = new Set();

            return [...a, ...b].filter(plugin => {
                const name = plugin?.constructor?.name;
                if (names.has(name)) return false;
                names.add(name);
                return true;
            });
        }

        if (key === 'module.rules') {
            const tests = new Set();

            return [...a, ...b].filter(rule => {
                const test = rule?.test?.toString();
                if (tests.has(test)) return false;
                tests.add(test);
                return true;
            });
        }

        return undefined;
    }
});