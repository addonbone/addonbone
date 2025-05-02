import {getTabUrl} from "./tab";
import {browser} from "./browser";
import {throwRuntimeError} from "./runtime";

import {isBrowser} from "@main/env";

import {hasSymbols} from "@cli/utils/string";

import {Browser} from "@typing/browser";

type RequestFilter = chrome.webRequest.RequestFilter;
type ResourceRequest = chrome.webRequest.ResourceRequest;

const webRequest = () => browser().webRequest;

export const getWebRequestInitiatorUrl = async (request: ResourceRequest): Promise<string | undefined> => {
    const {tabId} = request;

    let initiatorUrl: string | undefined;

    try {
        if (tabId >= 0) {
            initiatorUrl = await getTabUrl(tabId);
        } else if (isBrowser(Browser.Firefox)) {
            // Firefox contains other properties in the details object: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onBeforeRequest#details_2

            // @ts-ignore
            const {originUrl, documentUrl} = request;

            initiatorUrl = originUrl || documentUrl;

            if (!hasSymbols(initiatorUrl)) {
                initiatorUrl = undefined;
            }
        }
    } catch (e) {
        console.warn(`Request API, getInitiatorUrl, get tab url id = "${tabId}" warning`, e);
    }

    return initiatorUrl;
}

export const handlerWebRequestBehaviorChanged = () => new Promise<void>((resolve, reject) => {
    webRequest().handlerBehaviorChanged(() => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const onWebRequestAuthRequired = (
    callback: Parameters<typeof chrome.webRequest.onAuthRequired.addListener>[0],
    filter: RequestFilter,
    extraInfoSpec?: Parameters<typeof chrome.webRequest.onAuthRequired.addListener>[2]
): () => void => {
    webRequest().onAuthRequired.addListener(callback, filter, extraInfoSpec);

    return () => webRequest().onAuthRequired.removeListener(callback);
}

export const onWebRequestBeforeRedirect = (
    callback: Parameters<typeof chrome.webRequest.onBeforeRedirect.addListener>[0],
    filter: RequestFilter,
    extraInfoSpec?: Parameters<typeof chrome.webRequest.onBeforeRedirect.addListener>[2]
): () => void => {
    webRequest().onBeforeRedirect.addListener(callback, filter, extraInfoSpec);

    return () => webRequest().onBeforeRedirect.removeListener(callback);
}

export const onWebRequestBeforeRequest = (
    callback: Parameters<typeof chrome.webRequest.onBeforeRequest.addListener>[0],
    filter: RequestFilter,
    extraInfoSpec?: Parameters<typeof chrome.webRequest.onBeforeRequest.addListener>[2]
): () => void => {
    webRequest().onBeforeRequest.addListener(callback, filter, extraInfoSpec);

    return () => webRequest().onBeforeRequest.removeListener(callback);
}

export const onWebRequestBeforeSendHeaders = (
    callback: Parameters<typeof chrome.webRequest.onBeforeSendHeaders.addListener>[0],
    filter: RequestFilter,
    extraInfoSpec?: Parameters<typeof chrome.webRequest.onBeforeSendHeaders.addListener>[2]
): () => void => {
    webRequest().onBeforeSendHeaders.addListener(callback, filter, extraInfoSpec);

    return () => webRequest().onBeforeSendHeaders.removeListener(callback);
}

export const onWebRequestCompleted = (
    callback: Parameters<typeof chrome.webRequest.onCompleted.addListener>[0],
    filter: RequestFilter,
    extraInfoSpec?: Parameters<typeof chrome.webRequest.onCompleted.addListener>[2]
): () => void => {
    webRequest().onCompleted.addListener(callback, filter, extraInfoSpec);

    return () => webRequest().onCompleted.removeListener(callback);
}

export const onWebRequestErrorOccurred = (
    callback: Parameters<typeof chrome.webRequest.onErrorOccurred.addListener>[0],
    filter: RequestFilter,
    extraInfoSpec?: Parameters<typeof chrome.webRequest.onErrorOccurred.addListener>[2]
): () => void => {
    webRequest().onErrorOccurred.addListener(callback, filter, extraInfoSpec);

    return () => webRequest().onErrorOccurred.removeListener(callback);
}

export const onWebRequestHeadersReceived = (
    callback: Parameters<typeof chrome.webRequest.onHeadersReceived.addListener>[0],
    filter: RequestFilter,
    extraInfoSpec?: Parameters<typeof chrome.webRequest.onHeadersReceived.addListener>[2]
): () => void => {
    webRequest().onHeadersReceived.addListener(callback, filter, extraInfoSpec);

    return () => webRequest().onHeadersReceived.removeListener(callback);
}

export const onWebRequestResponseStarted = (
    callback: Parameters<typeof chrome.webRequest.onResponseStarted.addListener>[0],
    filter: RequestFilter,
    extraInfoSpec?: Parameters<typeof chrome.webRequest.onResponseStarted.addListener>[2]
): () => void => {
    webRequest().onResponseStarted.addListener(callback, filter, extraInfoSpec);

    return () => webRequest().onResponseStarted.removeListener(callback);
}

export const onWebRequestSendHeaders = (
    callback: Parameters<typeof chrome.webRequest.onSendHeaders.addListener>[0],
    filter: RequestFilter,
    extraInfoSpec?: Parameters<typeof chrome.webRequest.onSendHeaders.addListener>[2]
): () => void => {
    webRequest().onSendHeaders.addListener(callback, filter, extraInfoSpec);

    return () => webRequest().onSendHeaders.removeListener(callback);
}
