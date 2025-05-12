import {browser} from "./browser";
import {handleListener} from "./utils";
import {throwRuntimeError} from "./runtime";

type IdleState = chrome.idle.IdleState

const idle = () => browser().idle as typeof chrome.idle;

// Methods
export const getAutoLockDelay = (): Promise<number> => new Promise<number>((resolve, reject) => {
    idle().getAutoLockDelay((delay) => {
        try {
            throwRuntimeError();

            resolve(delay);
        } catch (e) {
            reject(e);
        }
    });
});

export const queryIdleState = (detectionIntervalInSeconds: number): Promise<IdleState> => new Promise<IdleState>((resolve, reject) => {
    idle().queryState(detectionIntervalInSeconds, (newState) => {
        try {
            throwRuntimeError();

            resolve(newState);
        } catch (e) {
            reject(e);
        }
    });
});

export const setDetectionInterval = (intervalInSeconds: number): void => idle().setDetectionInterval(intervalInSeconds);


// Events
export const onStateChanged = (callback: Parameters<typeof chrome.idle.onStateChanged.addListener>[0]): () => void => {
    return handleListener(idle().onStateChanged, callback)
}
