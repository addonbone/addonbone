import {browser} from "./env";
import {throwRuntimeError} from "./runtime";

type CaptureInfo = chrome.tabCapture.CaptureInfo;
type CaptureOptions = chrome.tabCapture.CaptureOptions;
type GetMediaStreamOptions = chrome.tabCapture.GetMediaStreamOptions;

const _tabCapture = browser().tabCapture

export const tabCapture = (options: CaptureOptions) => new Promise<MediaStream | null>((resolve, reject) => {
    _tabCapture.capture(options, stream => {
        try {
            throwRuntimeError();

            resolve(stream);
        } catch (e) {
            reject(e);
        }
    });
});

export const getCapturedTabs = () => new Promise<CaptureInfo[]>((resolve, reject) => {
    _tabCapture.getCapturedTabs(result => {
        try {
            throwRuntimeError();

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
});

export const getCaptureMediaStreamId = (options: GetMediaStreamOptions) => new Promise<string>((resolve, reject) => {
    _tabCapture.getMediaStreamId(options, streamId => {
        try {
            throwRuntimeError();

            resolve(streamId);
        } catch (e) {
            reject(e);
        }
    });
});

export const onCaptureStatusChanged = (callback: Parameters<typeof _tabCapture.onStatusChanged.addListener>[0]): () => void => {
    _tabCapture.onStatusChanged.addListener(callback);

    return () => _tabCapture.onStatusChanged.removeListener(callback);
}
