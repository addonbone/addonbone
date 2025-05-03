import {browser} from "./browser";
import {throwRuntimeError} from "./runtime";

type Awaited<T> = chrome.scripting.Awaited<T>;
type CSSInjection = chrome.scripting.CSSInjection;
type ScriptInjection<Args extends any[], Result> = chrome.scripting.ScriptInjection<Args, Result>;
type InjectionResult<T> = chrome.scripting.InjectionResult<T>;
type ContentScriptFilter = chrome.scripting.ContentScriptFilter;
type RegisteredContentScript = chrome.scripting.RegisteredContentScript;

export const scripting = () => browser().scripting;

export const isAvailableScripting = (): boolean => !!scripting()

export const executeScript = <T = any>(injection: ScriptInjection<any, T>) => new Promise<InjectionResult<Awaited<T>>[]>((resolve, reject) => {
    scripting().executeScript(injection, (result) => {
        try {
            throwRuntimeError();

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
});

export const registerContentScripts = (scripts: RegisteredContentScript[]) => new Promise<void>((resolve, reject) => {
    scripting().registerContentScripts(scripts, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const unregisterContentScripts = (filter?: ContentScriptFilter) => new Promise<void>((resolve, reject) => {
    scripting().unregisterContentScripts(filter || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const updateContentScripts = (scripts: RegisteredContentScript[]) => new Promise<void>((resolve, reject) => {
    scripting().updateContentScripts(scripts, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const getRegisteredContentScripts = (filter?: ContentScriptFilter) => new Promise<RegisteredContentScript[]>((resolve, reject) => {
    scripting().getRegisteredContentScripts(filter || {}, (scripts) => {
        try {
            throwRuntimeError();

            resolve(scripts);
        } catch (e) {
            reject(e);
        }
    });
});

export const insertScriptingCSS = (injection: CSSInjection) => new Promise<void>((resolve, reject) => {
    scripting().insertCSS(injection, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeScriptingCSS = (injection: CSSInjection) => new Promise<void>((resolve, reject) => {
    scripting().removeCSS(injection, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});
