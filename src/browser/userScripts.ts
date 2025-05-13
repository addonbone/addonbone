import {browser} from "./browser";
import {throwRuntimeError} from "./runtime";

type WorldProperties = chrome.userScripts.WorldProperties
type RegisteredUserScript = chrome.userScripts.RegisteredUserScript

const userScripts = () => browser().userScripts as typeof chrome.userScripts;

// Methods
export const configureUserScriptsWorld = (properties?: WorldProperties): Promise<void> => new Promise<void>((resolve, reject) => {
    userScripts().configureWorld(properties || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const getUserScripts = (ids?: string[]): Promise<RegisteredUserScript[]> => new Promise<RegisteredUserScript[]>((resolve, reject) => {
    userScripts().getScripts({ids}, (scripts) => {
        try {
            throwRuntimeError();

            resolve(scripts);
        } catch (e) {
            reject(e);
        }
    });
});

export const getUserScriptsWorldConfigs = (): Promise<WorldProperties[]> => new Promise<WorldProperties[]>((resolve, reject) => {
    userScripts().getWorldConfigurations((worlds) => {
        try {
            throwRuntimeError();

            resolve(worlds);
        } catch (e) {
            reject(e);
        }
    });
});

export const registerUserScripts = (scripts: RegisteredUserScript[]): Promise<void> => new Promise<void>((resolve, reject) => {
    userScripts().register(scripts, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const resetUserScriptsWorldConfigs = (worldId: string): Promise<void> => new Promise<void>((resolve, reject) => {
    userScripts().resetWorldConfiguration(worldId, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const unregisterUserScripts = (ids?: string[]): Promise<void> => new Promise<void>((resolve, reject) => {
    userScripts().unregister({ids}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const updateUserScripts = (scripts: RegisteredUserScript[]): Promise<void> => new Promise<void>((resolve, reject) => {
    userScripts().update(scripts, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});
