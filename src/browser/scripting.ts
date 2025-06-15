import {nanoid} from "nanoid";
import {browser} from "./browser";
import {executeScriptTab} from "./tabs";
import {isManifestVersion3, throwRuntimeError} from "./runtime";

type InjectDetails = chrome.tabs.InjectDetails;
type MessageSender = chrome.runtime.MessageSender;

type Awaited<T> = chrome.scripting.Awaited<T>;
type ContentScriptFilter = chrome.scripting.ContentScriptFilter;
type CSSInjection = chrome.scripting.CSSInjection;
type InjectionResult<T> = Partial<chrome.scripting.InjectionResult<T>>
type RegisteredContentScript = chrome.scripting.RegisteredContentScript;
type ScriptInjection<Args extends any[], Result> = chrome.scripting.ScriptInjection<Args, Result>;

const scripting = () => browser().scripting as typeof chrome.scripting;

// Methods
export const executeScript = <T = any>(injection: ScriptInjection<any, T>): Promise<InjectionResult<Awaited<T>>[]> => new Promise<InjectionResult<Awaited<T>>[]>(async (resolve, reject) => {
    if (isManifestVersion3()) {
        scripting().executeScript(injection, (result) => {
            try {
                throwRuntimeError();
                resolve(result);
            } catch (e) {
                reject(e);
            }
        });
        return
    }

    try {
        //@ts-ignore
        const {target: {tabId, allFrames}, files, func, args, injectImmediately} = injection;

        const details: InjectDetails = {
            allFrames,
            runAt: injectImmediately ? "document_start" : "document_idle",
        };

        if (func) {
            const id = nanoid();

            const listener = (message: any, {frameId, documentId}: MessageSender) => {
                if (message?.asyncFuncID === id) {
                    chrome.runtime.onMessage.removeListener(listener);

                    const {result, error} = message;

                    if (error) {
                        return reject(
                            new Error(`Error thrown in execution script: ${error?.message}\nStack: ${error?.stack}`)
                        );
                    }

                    resolve([{result, frameId, documentId}]);
                }
                return false;
            };

            chrome.runtime.onMessage.addListener(listener);

            const code = `(async function () {
                              const message = { asyncFuncID: '${id}' };
                              try {
                                  const func = (${func.toString()});
                                  message.result = await func(...${JSON.stringify(args ?? [])});
                              } catch (e) {
                                  message.error = {
                                      message: e?.message,
                                      name: e?.name,
                                      stack: e?.stack
                                  };
                              } finally {
                                  chrome.runtime.sendMessage(message);
                              }
                          })();`;

            await executeScriptTab(tabId, {...details, code});
        }

        if (files) {
            for await (const file of files) {
                await executeScriptTab(tabId, {...details, file});
            }
            resolve([{}]);
        }
    } catch (err) {
        reject(err);
    }
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

export const insertCSS = (injection: CSSInjection): Promise<void> => new Promise<void>((resolve, reject) => {
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

export const removeCSS = (injection: CSSInjection): Promise<void> => new Promise<void>((resolve, reject) => {
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
