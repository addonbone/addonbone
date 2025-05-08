import {browser} from "./browser";
import {throwRuntimeError} from "./runtime";

type Awaited<T> = chrome.scripting.Awaited<T>;
type ContentScriptFilter = chrome.scripting.ContentScriptFilter;
type CSSInjection = chrome.scripting.CSSInjection;
type InjectionResult<T> = chrome.scripting.InjectionResult<T>;
type RegisteredContentScript = chrome.scripting.RegisteredContentScript;
type ScriptInjection<Args extends any[], Result> = chrome.scripting.ScriptInjection<Args, Result>;

export const scripting = () => browser().scripting as typeof chrome.scripting;

// Methods
export const executeScript = <T = any>(injection: ScriptInjection<any, T>): Promise<InjectionResult<Awaited<T>>[]> => new Promise<InjectionResult<Awaited<T>>[]>((resolve, reject) => {
    scripting().executeScript(injection, (result) => {
        try {
            throwRuntimeError();

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
});

export const getRegisteredContentScripts = (filter?: ContentScriptFilter): Promise<RegisteredContentScript[]> => new Promise<RegisteredContentScript[]>((resolve, reject) => {
    scripting().getRegisteredContentScripts(filter || {}, (scripts) => {
        try {
            throwRuntimeError();

            resolve(scripts);
        } catch (e) {
            reject(e);
        }
    });
});

export const insertScriptingCSS = (injection: CSSInjection): Promise<void> => new Promise<void>((resolve, reject) => {
    scripting().insertCSS(injection, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const registerContentScripts = (scripts: RegisteredContentScript[]): Promise<void> => new Promise<void>((resolve, reject) => {
    scripting().registerContentScripts(scripts, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeScriptingCSS = (injection: CSSInjection): Promise<void> => new Promise<void>((resolve, reject) => {
    scripting().removeCSS(injection, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const unregisterContentScripts = (filter?: ContentScriptFilter): Promise<void> => new Promise<void>((resolve, reject) => {
    scripting().unregisterContentScripts(filter || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const updateContentScripts = (scripts: RegisteredContentScript[]): Promise<void> => new Promise<void>((resolve, reject) => {
    scripting().updateContentScripts(scripts, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});


// Custom Methods
export const isAvailableScripting = (): boolean => !!scripting()
