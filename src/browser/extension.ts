import {browser} from "./browser";
import {throwRuntimeError} from "@browser/runtime";

type FetchProperties = chrome.extension.FetchProperties

const extension = () => browser().extension as typeof chrome.extension;

// Methods
export const getBackgroundPage = (): Window | null => extension().getBackgroundPage();

export const getViews = (properties?: FetchProperties): Window[] => extension().getViews(properties);

export const isAllowedFileSchemeAccess = (): Promise<boolean> => new Promise<boolean>((resolve, reject) => {
    extension().isAllowedFileSchemeAccess((isAllowedAccess) => {
        try {
            throwRuntimeError();

            resolve(isAllowedAccess);
        } catch (e) {
            reject(e);
        }
    });
});

export const isAllowedIncognitoAccess = (): Promise<boolean> => new Promise<boolean>((resolve, reject) => {
    extension().isAllowedIncognitoAccess((isAllowedAccess) => {
        try {
            throwRuntimeError();

            resolve(isAllowedAccess);
        } catch (e) {
            reject(e);
        }
    });
});

export const setUpdateUrlData = (data: string): void => extension().setUpdateUrlData(data);
