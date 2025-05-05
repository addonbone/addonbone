import {browser} from "./browser";
import {handleListener} from "./utils";
import {throwRuntimeError} from "./runtime";

type GetFrameDetails = chrome.webNavigation.GetFrameDetails;
type GetAllFrameDetails = chrome.webNavigation.GetAllFrameDetails;
type GetFrameResultDetails = chrome.webNavigation.GetFrameResultDetails;
type GetAllFrameResultDetails = chrome.webNavigation.GetAllFrameResultDetails;
type WebNavigationEventFilter = chrome.webNavigation.WebNavigationEventFilter;

const webNavigation = () => browser().webNavigation;

export const getWebNavigationFrame = (details: GetFrameDetails): Promise<GetFrameResultDetails> => new Promise((resolve, reject) => {
    webNavigation().getFrame(details, (frame) => {
        try {
            throwRuntimeError();

            if (!frame) {
                throw new Error("No frame found for the specified tabId");
            }
            resolve(frame);
        } catch (e) {
            reject(e);
        }
    });
});

export const getWebNavigationAllFrames = (details: GetAllFrameDetails): Promise<GetAllFrameResultDetails[]> => new Promise((resolve, reject) => {
    webNavigation().getAllFrames(details, (frames) => {
        try {
            throwRuntimeError();

            if (!frames) {
                throw new Error("No frames found for the specified tabId");
            }
            resolve(frames);
        } catch (e) {
            reject(e);
        }
    });
});

export const onWebNavigationBeforeNavigate = (
    callback: Parameters<typeof chrome.webNavigation.onBeforeNavigate.addListener>[0],
    filters?: WebNavigationEventFilter,
): () => void => {
    return handleListener(webNavigation().onBeforeNavigate, callback, filters)
}

export const onWebNavigationCommitted = (
    callback: Parameters<typeof chrome.webNavigation.onCommitted.addListener>[0],
    filters?: WebNavigationEventFilter,
): () => void => {
    return handleListener(webNavigation().onCommitted, callback, filters)
}

export const onWebNavigationCompleted = (
    callback: Parameters<typeof chrome.webNavigation.onCompleted.addListener>[0],
    filters?: WebNavigationEventFilter,
): () => void => {
    return handleListener(webNavigation().onCompleted, callback, filters)
}

export const onWebNavigationCreatedNavigationTarget = (
    callback: Parameters<typeof chrome.webNavigation.onCreatedNavigationTarget.addListener>[0],
    filters?: WebNavigationEventFilter,
): () => void => {
    return handleListener(webNavigation().onCreatedNavigationTarget, callback, filters)
}

export const onWebNavigationDOMContentLoaded = (
    callback: Parameters<typeof chrome.webNavigation.onDOMContentLoaded.addListener>[0],
    filters?: WebNavigationEventFilter,
): () => void => {
    return handleListener(webNavigation().onDOMContentLoaded, callback, filters)
}

export const onWebNavigationErrorOccurred = (
    callback: Parameters<typeof chrome.webNavigation.onErrorOccurred.addListener>[0],
    filters?: WebNavigationEventFilter,
): () => void => {
    return handleListener(webNavigation().onErrorOccurred, callback, filters)
}

export const onWebNavigationHistoryStateUpdated = (
    callback: Parameters<typeof chrome.webNavigation.onHistoryStateUpdated.addListener>[0],
    filters?: WebNavigationEventFilter,
): () => void => {
    return handleListener(webNavigation().onHistoryStateUpdated, callback, filters)
}

export const onWebNavigationReferenceFragmentUpdated = (
    callback: Parameters<typeof chrome.webNavigation.onReferenceFragmentUpdated.addListener>[0],
    filters?: WebNavigationEventFilter,
): () => void => {
    return handleListener(webNavigation().onReferenceFragmentUpdated, callback, filters)
}

export const onWebNavigationTabReplaced = (callback: Parameters<typeof chrome.webNavigation.onTabReplaced.addListener>[0]): () => void => {
    return handleListener(webNavigation().onTabReplaced, callback)
}
