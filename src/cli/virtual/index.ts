import background from "./background.ts?raw";

const templates = {background};

const getVirtualModule = (file: string, template: keyof typeof templates): string => {
    return templates[template].replace(`virtual:${template}-entrypoint`, file);
}

export const virtualBackgroundModule = (file: string): string => {
    return getVirtualModule(file, 'background');
}