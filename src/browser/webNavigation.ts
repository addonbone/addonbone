import {browser} from "./env";
import {throwRuntimeError} from "./runtime";

type GetFrameDetails = chrome.webNavigation.GetFrameDetails;
type GetAllFrameDetails = chrome.webNavigation.GetAllFrameDetails;
type GetFrameResultDetails = chrome.webNavigation.GetFrameResultDetails;
type GetAllFrameResultDetails = chrome.webNavigation.GetAllFrameResultDetails;
type WebNavigationEventFilter = chrome.webNavigation.WebNavigationEventFilter;

const webNavigation = browser().webNavigation;

export const getWebNavigationFrame = (details: GetFrameDetails): Promise<GetFrameResultDetails> => new Promise((resolve, reject) => {
    webNavigation.getFrame(details, (frame) => {
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
    webNavigation.getAllFrames(details, (frames) => {
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
    callback: Parameters<typeof webNavigation.onBeforeNavigate.addListener>[0],
    filters?: WebNavigationEventFilter,
) => {
    webNavigation.onBeforeNavigate.addListener(callback, filters);

    return () => webNavigation.onBeforeNavigate.removeListener(callback);
}

export const onWebNavigationCommitted = (
    callback: Parameters<typeof webNavigation.onCommitted.addListener>[0],
    filters?: WebNavigationEventFilter,
) => {
    webNavigation.onCommitted.addListener(callback, filters);

    return () => webNavigation.onCommitted.removeListener(callback);
}

export const onWebNavigationCompleted = (
    callback: Parameters<typeof webNavigation.onCompleted.addListener>[0],
    filters?: WebNavigationEventFilter,
) => {
    webNavigation.onCompleted.addListener(callback, filters);

    return () => webNavigation.onCompleted.removeListener(callback);
}

export const onWebNavigationCreatedNavigationTarget = (
    callback: Parameters<typeof webNavigation.onCreatedNavigationTarget.addListener>[0],
    filters?: WebNavigationEventFilter,
) => {
    webNavigation.onCreatedNavigationTarget.addListener(callback, filters);

    return () => webNavigation.onCreatedNavigationTarget.removeListener(callback);
}

export const onWebNavigationDOMContentLoaded = (
    callback: Parameters<typeof webNavigation.onDOMContentLoaded.addListener>[0],
    filters?: WebNavigationEventFilter,
) => {
    webNavigation.onDOMContentLoaded.addListener(callback, filters);

    return () => webNavigation.onDOMContentLoaded.removeListener(callback);
}

export const onWebNavigationErrorOccurred = (
    callback: Parameters<typeof webNavigation.onErrorOccurred.addListener>[0],
    filters?: WebNavigationEventFilter,
) => {
    webNavigation.onErrorOccurred.addListener(callback, filters);

    return () => webNavigation.onErrorOccurred.removeListener(callback);
}

export const onWebNavigationHistoryStateUpdated = (
    callback: Parameters<typeof webNavigation.onHistoryStateUpdated.addListener>[0],
    filters?: WebNavigationEventFilter,
) => {
    webNavigation.onHistoryStateUpdated.addListener(callback, filters);

    return () => webNavigation.onHistoryStateUpdated.removeListener(callback);
}

export const onWebNavigationReferenceFragmentUpdated = (
    callback: Parameters<typeof webNavigation.onReferenceFragmentUpdated.addListener>[0],
    filters?: WebNavigationEventFilter,
) => {
    webNavigation.onReferenceFragmentUpdated.addListener(callback, filters);

    return () => webNavigation.onReferenceFragmentUpdated.removeListener(callback);
}

export const onWebNavigationTabReplaced = (callback: Parameters<typeof webNavigation.onTabReplaced.addListener>[0]) => {
    webNavigation.onTabReplaced.addListener(callback);

    return () => webNavigation.onTabReplaced.removeListener(callback);
}
