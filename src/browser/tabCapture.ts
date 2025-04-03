import {browser} from "./env";
import {throwRuntimeError} from "./runtime";

type CaptureInfo = chrome.tabCapture.CaptureInfo;
type CaptureOptions = chrome.tabCapture.CaptureOptions;
type GetMediaStreamOptions = chrome.tabCapture.GetMediaStreamOptions;

const tabCapture_ = browser().tabCapture

export const tabCapture = (options: CaptureOptions) => new Promise<MediaStream | null>((resolve, reject) => {
    tabCapture_.capture(options, stream => {
        try {
            throwRuntimeError();

            resolve(stream);
        } catch (e) {
            reject(e);
        }
    });
});

export const getCapturedTabs = () => new Promise<CaptureInfo[]>((resolve, reject) => {
    tabCapture_.getCapturedTabs(result => {
        try {
            throwRuntimeError();

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
});

export const getCaptureMediaStreamId = (options: GetMediaStreamOptions) => new Promise<string>((resolve, reject) => {
    tabCapture_.getMediaStreamId(options, streamId => {
        try {
            throwRuntimeError();

            resolve(streamId);
        } catch (e) {
            reject(e);
        }
    });
});

export const onCaptureStatusChanged = (callback: Parameters<typeof tabCapture_.onStatusChanged.addListener>[0]) => {
    tabCapture_.onStatusChanged.addListener(callback);

    return () => tabCapture_.onStatusChanged.removeListener(callback);
}
