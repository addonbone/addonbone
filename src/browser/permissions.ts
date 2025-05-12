import {browser} from "./browser";
import {handleListener} from "./utils";
import {throwRuntimeError} from "./runtime";

type AddHostAccessRequest = chrome.permissions.AddHostAccessRequest;
type RemoveHostAccessRequest = chrome.permissions.RemoveHostAccessRequest;
type Permissions = chrome.permissions.Permissions;

const permissions = () => browser().permissions as typeof chrome.permissions;

// Methods
export const addHostAccessRequest = (request?: AddHostAccessRequest): Promise<void> => new Promise<void>((resolve, reject) => {
    permissions().addHostAccessRequest(request || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const containsPermissions = (permission: Permissions): Promise<boolean> => new Promise<boolean>((resolve, reject) => {
    permissions().contains(permission, (result) => {
        try {
            throwRuntimeError();

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
});

export const getAllPermissions = (): Promise<Permissions> => new Promise<Permissions>((resolve, reject) => {
    permissions().getAll((permissions) => {
        try {
            throwRuntimeError();

            resolve(permissions);
        } catch (e) {
            reject(e);
        }
    });
});

export const removePermissions = (permission: Permissions): Promise<boolean> => new Promise<boolean>((resolve, reject) => {
    permissions().remove(permission, (removed) => {
        try {
            throwRuntimeError();

            resolve(removed);
        } catch (e) {
            reject(e);
        }
    });
});

export const removeHostAccessRequest = (request?: RemoveHostAccessRequest): Promise<void> => new Promise<void>((resolve, reject) => {
    permissions().removeHostAccessRequest(request || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const requestPermissions = (permission: Permissions): Promise<boolean> => new Promise<boolean>((resolve, reject) => {
    permissions().request(permission, (granted) => {
        try {
            throwRuntimeError();

            resolve(granted);
        } catch (e) {
            reject(e);
        }
    });
});


// Events
export const onPermissionsAdded = (callback: Parameters<typeof chrome.permissions.onAdded.addListener>[0]): () => void => {
    return handleListener(permissions().onAdded, callback)
}

export const onPermissionsRemoved = (callback: Parameters<typeof chrome.permissions.onRemoved.addListener>[0]): () => void => {
    return handleListener(permissions().onRemoved, callback)
}
