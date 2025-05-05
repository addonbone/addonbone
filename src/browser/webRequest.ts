import {getTabUrl} from "./tab";
import {browser} from "./browser";
import {safeListener} from "./utils";
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
    const listener = safeListener(callback)

    webRequest().onAuthRequired.addListener(listener, filter, extraInfoSpec);

    return () => webRequest().onAuthRequired.removeListener(listener);
}

export const onWebRequestBeforeRedirect = (
    callback: Parameters<typeof chrome.webRequest.onBeforeRedirect.addListener>[0],
    filter: RequestFilter,
    extraInfoSpec?: Parameters<typeof chrome.webRequest.onBeforeRedirect.addListener>[2]
): () => void => {
    const listener = safeListener(callback)

    webRequest().onBeforeRedirect.addListener(listener, filter, extraInfoSpec);

    return () => webRequest().onBeforeRedirect.removeListener(listener);
}

export const onWebRequestBeforeRequest = (
    callback: Parameters<typeof chrome.webRequest.onBeforeRequest.addListener>[0],
    filter: RequestFilter,
    extraInfoSpec?: Parameters<typeof chrome.webRequest.onBeforeRequest.addListener>[2]
): () => void => {
    const listener = safeListener(callback)

    webRequest().onBeforeRequest.addListener(listener, filter, extraInfoSpec);

    return () => webRequest().onBeforeRequest.removeListener(listener);
}

export const onWebRequestBeforeSendHeaders = (
    callback: Parameters<typeof chrome.webRequest.onBeforeSendHeaders.addListener>[0],
    filter: RequestFilter,
    extraInfoSpec?: Parameters<typeof chrome.webRequest.onBeforeSendHeaders.addListener>[2]
): () => void => {
    const listener = safeListener(callback)

    webRequest().onBeforeSendHeaders.addListener(listener, filter, extraInfoSpec);

    return () => webRequest().onBeforeSendHeaders.removeListener(listener);
}

export const onWebRequestCompleted = (
    callback: Parameters<typeof chrome.webRequest.onCompleted.addListener>[0],
    filter: RequestFilter,
    extraInfoSpec?: Parameters<typeof chrome.webRequest.onCompleted.addListener>[2]
): () => void => {
    const listener = safeListener(callback)

    webRequest().onCompleted.addListener(listener, filter, extraInfoSpec);

    return () => webRequest().onCompleted.removeListener(listener);
}

export const onWebRequestErrorOccurred = (
    callback: Parameters<typeof chrome.webRequest.onErrorOccurred.addListener>[0],
    filter: RequestFilter,
    extraInfoSpec?: Parameters<typeof chrome.webRequest.onErrorOccurred.addListener>[2]
): () => void => {
    const listener = safeListener(callback)

    webRequest().onErrorOccurred.addListener(listener, filter, extraInfoSpec);

    return () => webRequest().onErrorOccurred.removeListener(listener);
}

export const onWebRequestHeadersReceived = (
    callback: Parameters<typeof chrome.webRequest.onHeadersReceived.addListener>[0],
    filter: RequestFilter,
    extraInfoSpec?: Parameters<typeof chrome.webRequest.onHeadersReceived.addListener>[2]
): () => void => {
    const listener = safeListener(callback)

    webRequest().onHeadersReceived.addListener(listener, filter, extraInfoSpec);

    return () => webRequest().onHeadersReceived.removeListener(listener);
}

export const onWebRequestResponseStarted = (
    callback: Parameters<typeof chrome.webRequest.onResponseStarted.addListener>[0],
    filter: RequestFilter,
    extraInfoSpec?: Parameters<typeof chrome.webRequest.onResponseStarted.addListener>[2]
): () => void => {
    const listener = safeListener(callback)

    webRequest().onResponseStarted.addListener(listener, filter, extraInfoSpec);

    return () => webRequest().onResponseStarted.removeListener(listener);
}

export const onWebRequestSendHeaders = (
    callback: Parameters<typeof chrome.webRequest.onSendHeaders.addListener>[0],
    filter: RequestFilter,
    extraInfoSpec?: Parameters<typeof chrome.webRequest.onSendHeaders.addListener>[2]
): () => void => {
    const listener = safeListener(callback)

    webRequest().onSendHeaders.addListener(listener, filter, extraInfoSpec);

    return () => webRequest().onSendHeaders.removeListener(listener);
}
