import {browser} from "./browser";
import {throwRuntimeError} from "./runtime";

type CreateParameters = chrome.offscreen.CreateParameters;

const offscreen = () => browser().offscreen as typeof chrome.offscreen;

// Methods
export const closeOffscreenDocument = (): Promise<void> => new Promise<void>((resolve, reject) => {
    offscreen().closeDocument(() => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const createOffscreenDocument = (parameters: CreateParameters): Promise<void> => new Promise<void>((resolve, reject) => {
    offscreen().createDocument(parameters, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const hasOffscreenDocument = () => new Promise<boolean>((resolve, reject) => {
    offscreen().hasDocument((hasDocument) => {
        try {
            throwRuntimeError();

            resolve(hasDocument);
        } catch (e) {
            reject(e);
        }
    });
});
