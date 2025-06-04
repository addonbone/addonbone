import background from "./background.ts?raw";
import command from "./command.ts?raw";
import content from "./content.ts?raw";
import transport from "./transport.ts?raw";
import relay from "./relay.ts?raw";
import view from "./view.ts?raw";

import {getEntrypointFileFramework} from "@cli/entrypoint";

import {PackageName} from "@typing/app";
import {EntrypointFile} from "@typing/entrypoint";


const templates = {background, command, content, relay, view, transport};

const getEntryFramework = (file: EntrypointFile, entry: 'content' | 'relay' | 'view'): string => {
    return `${PackageName}/entry/${entry}/${getEntrypointFileFramework(file)}`;
}

const getVirtualModule = (file: EntrypointFile, template: keyof typeof templates): string => {
    return templates[template]
        .replaceAll('//@ts-ignore', '')
        .replace(`virtual:${template}-entrypoint`, file.import);
}

const getTransportModule = (file: EntrypointFile, name: string, layer: string): string => {
    return getVirtualModule(file, 'transport')
        .replace('virtual:transport-name', name)
        .replaceAll(':entry', layer);
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
        .replace(`virtual:content-framework`, getEntryFramework(file, 'content'));
}

export const virtualRelayModule = (file: EntrypointFile, name: string): string => {
    return getVirtualModule(file, 'relay')
        .replace('virtual:relay-name', name)
        .replace(`virtual:relay-framework`, getEntryFramework(file, 'relay'));
}

export const virtualServiceModule = (file: EntrypointFile, name: string): string => {
    return getTransportModule(file, name, 'service');
}

export const virtualViewModule = (file: EntrypointFile): string => {
    return getVirtualModule(file, 'view')
        .replace(`virtual:view-framework`, getEntryFramework(file, 'view'));
}