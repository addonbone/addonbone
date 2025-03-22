import background from "./background.ts?raw";
import command from "./command.ts?raw";
import content from "./content.ts?raw";

import {getEntrypointFileFramework} from "@cli/utils/entrypoint";

import {EntrypointFile} from "@typing/entrypoint";

const templates = {background, command, content};

const getVirtualModule = (file: EntrypointFile, template: keyof typeof templates): string => {
    return templates[template].replace(`virtual:${template}-entrypoint`, file.import);
}

export const virtualBackgroundModule = (file: EntrypointFile): string => {
    return getVirtualModule(file, 'background');
}

export const virtualCommandModule = (file: EntrypointFile, name: string): string => {
    return getVirtualModule(file, 'command')
        .replace('virtual:command-name', name);
}

export const virtualContentScriptModule = (file: EntrypointFile): string => {
    return getVirtualModule(file, 'content')
        .replace(`virtual:content-framework`, 'adnbn/entry/content/' + getEntrypointFileFramework(file));
}