import {getLocaleFilename} from "@locale/utils";

import {LocaleFinder} from "@cli/entrypoint";
import {GenerateJsonPluginData} from "@cli/bundler";

export default class extends LocaleFinder {
    public async json(): Promise<GenerateJsonPluginData> {
        const data: GenerateJsonPluginData = {};

        const builders = await this.builders();

        for (const builder of builders.values()) {
            data[getLocaleFilename(builder.lang())] = builder.build();
        }

        return data;
    }
}
