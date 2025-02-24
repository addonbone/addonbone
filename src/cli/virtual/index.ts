import background from "./background.ts?raw";
import command from "./command.ts?raw";

const templates = {background, command};

const getVirtualModule = (file: string, template: keyof typeof templates): string => {
    return templates[template].replace(`virtual:${template}-entrypoint`, file);
}

export const virtualBackgroundModule = (file: string): string => {
    return getVirtualModule(file, 'background');
}

export const virtualCommandModule = (file: string, name: string): string => {
    return getVirtualModule(file, 'command').replace('virtual:command-name', name);
}