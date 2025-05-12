import {browser} from "./browser";
import {handleListener} from "./utils";
import {throwRuntimeError} from "./runtime";

type CreateProperties = chrome.contextMenus.CreateProperties;
type UpdateProperties = chrome.contextMenus.UpdateProperties;

const contextMenus = () => browser().contextMenus as typeof chrome.contextMenus;

// Methods
export const createContextMenu = (createProperties?: CreateProperties): Promise<void> => new Promise<void>((resolve, reject) => {
    contextMenus().create(createProperties || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeContextMenu = (menuItemId: string | number): Promise<void> => new Promise<void>((resolve, reject) => {
    contextMenus().remove(menuItemId, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeAllContextMenu = (): Promise<void> => new Promise<void>((resolve, reject) => {
    contextMenus().removeAll(() => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const updateContextMenu = (id: string | number, updateProperties?: UpdateProperties): Promise<void> => new Promise<void>((resolve, reject) => {
    contextMenus().update(id, updateProperties || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});


// Events
export const onContextMenuClicked = (callback: Parameters<typeof chrome.contextMenus.onClicked.addListener>[0]): () => void => {
    return handleListener(contextMenus().onClicked, callback)
}
