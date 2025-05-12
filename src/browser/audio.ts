import {browser} from "./browser";
import {handleListener} from "./utils";
import {throwRuntimeError} from "./runtime";

type AudioDeviceInfo = chrome.audio.AudioDeviceInfo
type DeviceFilter = chrome.audio.DeviceFilter
type DeviceIdLists = chrome.audio.DeviceIdLists
type DeviceProperties = chrome.audio.DeviceProperties
type StreamType = chrome.audio.StreamType

const audio = () => browser().audio as typeof chrome.audio

// Methods
export const getAudioDevices = (filter?: DeviceFilter): Promise<AudioDeviceInfo[]> => new Promise<AudioDeviceInfo[]>((resolve, reject) => {
    audio().getDevices(filter || {}, (devices) => {
        try {
            throwRuntimeError();

            resolve(devices);
        } catch (e) {
            reject(e);
        }
    });
});

export const getAudioMute = (streamType: StreamType): Promise<boolean> => new Promise<boolean>((resolve, reject) => {
    audio().getMute(streamType, (value) => {
        try {
            throwRuntimeError();

            resolve(value);
        } catch (e) {
            reject(e);
        }
    });
});

export const setAudioActiveDevices = (ids?: DeviceIdLists): Promise<void> => new Promise<void>((resolve, reject) => {
    audio().setActiveDevices(ids || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const setAudioMute = (streamType: StreamType, isMuted: boolean): Promise<void> => new Promise<void>((resolve, reject) => {
    audio().setMute(streamType, isMuted, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const setAudioProperties = (id: string, properties?: DeviceProperties): Promise<void> => new Promise<void>((resolve, reject) => {
    audio().setProperties(id, properties || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});


// Events
export const onAudioDeviceListChanged = (callback: Parameters<typeof chrome.audio.onDeviceListChanged.addListener>[0]): () => void => {
    return handleListener(audio().onDeviceListChanged, callback)
}

export const onAudioLevelChanged = (callback: Parameters<typeof chrome.audio.onLevelChanged.addListener>[0]): () => void => {
    return handleListener(audio().onLevelChanged, callback)
}

export const onAudioMuteChanged = (callback: Parameters<typeof chrome.audio.onMuteChanged.addListener>[0]): () => void => {
    return handleListener(audio().onMuteChanged, callback)
}
