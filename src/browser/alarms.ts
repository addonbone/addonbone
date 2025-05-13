import {browser} from "./browser";
import {handleListener} from "./utils";
import {throwRuntimeError} from "./runtime";

type Alarm = chrome.alarms.Alarm
type AlarmCreateInfo = chrome.alarms.AlarmCreateInfo
type AlarmInfo = AlarmCreateInfo & { name?: string }

const alarms = () => browser().alarms as typeof chrome.alarms

// Methods
export const clearAlarm = (name?: string): Promise<boolean> => new Promise<boolean>((resolve, reject) => {
    alarms().clear(name || '', (wasCleared) => {
        try {
            throwRuntimeError();

            resolve(wasCleared);
        } catch (e) {
            reject(e);
        }
    });
});

export const clearAllAlarm = (): Promise<boolean> => new Promise<boolean>((resolve, reject) => {
    alarms().clearAll((wasCleared) => {
        try {
            throwRuntimeError();

            resolve(wasCleared);
        } catch (e) {
            reject(e);
        }
    });
});

export const createAlarm = (alarmInfo: AlarmInfo): Promise<void> => new Promise<void>((resolve, reject) => {
    const {name = '', ...options} = alarmInfo
    alarms().create(name, options, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const getAlarm = (name?: string): Promise<Alarm> => new Promise<Alarm>((resolve, reject) => {
    alarms().get(name || '', (alarm) => {
        try {
            throwRuntimeError();

            resolve(alarm);
        } catch (e) {
            reject(e);
        }
    });
});

export const getAllAlarm = (): Promise<Alarm[]> => new Promise<Alarm[]>((resolve, reject) => {
    alarms().getAll((alarms) => {
        try {
            throwRuntimeError();

            resolve(alarms);
        } catch (e) {
            reject(e);
        }
    });
});


// Events
export const onAlarm = (callback: Parameters<typeof chrome.alarms.onAlarm.addListener>[0]): () => void => {
    return handleListener(alarms().onAlarm, callback)
}
