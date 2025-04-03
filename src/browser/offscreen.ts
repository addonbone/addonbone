import {browser} from "./env";
import {throwRuntimeError} from "./runtime";

type CreateParameters = chrome.offscreen.CreateParameters;

const offscreen = browser().offscreen;

export const hasOffscreenDocument = () => new Promise<boolean>((resolve, reject) => {
    offscreen.hasDocument((hasDocument) => {
        try {
            throwRuntimeError();

            resolve(hasDocument);
        } catch (e) {
            reject(e);
        }
    });
});

export const createOffscreenDocument = (createParameters: CreateParameters): Promise<void> => new Promise<void>((resolve, reject) => {
    offscreen.createDocument(createParameters, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeOffscreenDocument = (): Promise<void> => new Promise<void>((resolve, reject) => {
    offscreen.closeDocument(() => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});
