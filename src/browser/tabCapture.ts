import {browser} from "./browser";
import {handleListener} from "./utils";
import {throwRuntimeError} from "./runtime";

type CaptureInfo = chrome.tabCapture.CaptureInfo;
type CaptureOptions = chrome.tabCapture.CaptureOptions;
type GetMediaStreamOptions = chrome.tabCapture.GetMediaStreamOptions;

const tabCapture = () => browser().tabCapture as typeof chrome.tabCapture;

// Methods
export const createTabCapture = (options: CaptureOptions): Promise<MediaStream | null> => new Promise<MediaStream | null>((resolve, reject) => {
    tabCapture().capture(options, stream => {
        try {
            throwRuntimeError();

            resolve(stream);
        } catch (e) {
            reject(e);
        }
    });
});

export const getCapturedTabs = (): Promise<CaptureInfo[]> => new Promise<CaptureInfo[]>((resolve, reject) => {
    tabCapture().getCapturedTabs(result => {
        try {
            throwRuntimeError();

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
});

export const getCaptureMediaStreamId = (options: GetMediaStreamOptions): Promise<string> => new Promise<string>((resolve, reject) => {
    tabCapture().getMediaStreamId(options, streamId => {
        try {
            throwRuntimeError();

            resolve(streamId);
        } catch (e) {
            reject(e);
        }
    });
});


// Events
export const onCaptureStatusChanged = (callback: Parameters<typeof chrome.tabCapture.onStatusChanged.addListener>[0]): () => void => {
    return handleListener(tabCapture().onStatusChanged, callback)
}
