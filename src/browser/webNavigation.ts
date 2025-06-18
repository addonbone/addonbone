import {browser} from "./browser";
import {safeListener} from "./utils";
import {throwRuntimeError} from "./runtime";

type GetFrameDetails = chrome.webNavigation.GetFrameDetails;
type GetFrameResultDetails = chrome.webNavigation.GetFrameResultDetails;
type GetAllFrameResultDetails = chrome.webNavigation.GetAllFrameResultDetails;
type WebNavigationEventFilter = chrome.webNavigation.WebNavigationEventFilter;

const webNavigation = () => browser().webNavigation as typeof chrome.webNavigation;

// Methods
export const getAllFrames = (tabId: number): Promise<GetAllFrameResultDetails[]> => new Promise<GetAllFrameResultDetails[]>((resolve, reject) => {
    webNavigation().getAllFrames({tabId}, (frames) => {
        try {
            throwRuntimeError();

            resolve(frames || []);
        } catch (e) {
            reject(e);
        }
    });
});

export const getFrame = (details: GetFrameDetails): Promise<GetFrameResultDetails | null> => new Promise<GetFrameResultDetails | null>((resolve, reject) => {
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


// Events
export const onWebNavigationBeforeNavigate = (
    callback: Parameters<typeof chrome.webNavigation.onBeforeNavigate.addListener>[0],
    filters?: WebNavigationEventFilter,
): () => void => {
    const listener = safeListener(callback)

    webNavigation().onBeforeNavigate.addListener(listener, filters);

    return () => webNavigation().onBeforeNavigate.removeListener(listener);
}

export const onWebNavigationCommitted = (
    callback: Parameters<typeof chrome.webNavigation.onCommitted.addListener>[0],
    filters?: WebNavigationEventFilter,
): () => void => {
    const listener = safeListener(callback)

    webNavigation().onCommitted.addListener(listener, filters);

    return () => webNavigation().onCommitted.removeListener(listener);
}

export const onWebNavigationCompleted = (
    callback: Parameters<typeof chrome.webNavigation.onCompleted.addListener>[0],
    filters?: WebNavigationEventFilter,
): () => void => {
    const listener = safeListener(callback)

    webNavigation().onCompleted.addListener(listener, filters);

    return () => webNavigation().onCompleted.removeListener(listener);
}

export const onWebNavigationCreatedNavigationTarget = (
    callback: Parameters<typeof chrome.webNavigation.onCreatedNavigationTarget.addListener>[0],
    filters?: WebNavigationEventFilter,
): () => void => {
    const listener = safeListener(callback)

    webNavigation().onCreatedNavigationTarget.addListener(listener, filters);

    return () => webNavigation().onCreatedNavigationTarget.removeListener(listener);
}

export const onWebNavigationDOMContentLoaded = (
    callback: Parameters<typeof chrome.webNavigation.onDOMContentLoaded.addListener>[0],
    filters?: WebNavigationEventFilter,
): () => void => {
    const listener = safeListener(callback)

    webNavigation().onDOMContentLoaded.addListener(listener, filters);

    return () => webNavigation().onDOMContentLoaded.removeListener(listener);
}

export const onWebNavigationErrorOccurred = (
    callback: Parameters<typeof chrome.webNavigation.onErrorOccurred.addListener>[0],
    filters?: WebNavigationEventFilter,
): () => void => {
    const listener = safeListener(callback)

    webNavigation().onErrorOccurred.addListener(listener, filters);

    return () => webNavigation().onErrorOccurred.removeListener(listener);
}

export const onWebNavigationHistoryStateUpdated = (
    callback: Parameters<typeof chrome.webNavigation.onHistoryStateUpdated.addListener>[0],
    filters?: WebNavigationEventFilter,
): () => void => {
    const listener = safeListener(callback)

    webNavigation().onHistoryStateUpdated.addListener(listener, filters);

    return () => webNavigation().onHistoryStateUpdated.removeListener(listener);
}

export const onWebNavigationReferenceFragmentUpdated = (
    callback: Parameters<typeof chrome.webNavigation.onReferenceFragmentUpdated.addListener>[0],
    filters?: WebNavigationEventFilter,
): () => void => {
    const listener = safeListener(callback)

    webNavigation().onReferenceFragmentUpdated.addListener(listener, filters);

    return () => webNavigation().onReferenceFragmentUpdated.removeListener(listener);
}

export const onWebNavigationTabReplaced = (
    callback: Parameters<typeof chrome.webNavigation.onTabReplaced.addListener>[0]
): () => void => {
    const listener = safeListener(callback)

    webNavigation().onTabReplaced.addListener(listener);

    return () => webNavigation().onTabReplaced.removeListener(listener);
}
