import {browser} from "./browser";
import {throwRuntimeError} from "./runtime";

import {isBrowser} from "@main/env";

import {Browser} from "@typing/browser";

type Color = string | ColorArray;
type ColorArray = chrome.action.ColorArray;

type OpenOptions = chrome.sidePanel.OpenOptions;
type PanelOptions = chrome.sidePanel.PanelOptions;
type PanelBehavior = chrome.sidePanel.PanelBehavior;

//@ts-ignore
const sidebar = () => opr.sidebarAction as typeof opr.sidebarAction;
const sidePanel = () => browser().sidePanel as typeof chrome.sidePanel;

// Methods
export const getSidebarOptions = (tabId?: number): Promise<PanelOptions> => new Promise<PanelOptions>((resolve, reject) => {
    if (isBrowser(Browser.Opera)) {
        throw new Error('The chrome.sidePanel.getOptions API is not supported in Opera')
    }

    sidePanel().getOptions({tabId}, (options) => {
        try {
            throwRuntimeError();

            resolve(options);
        } catch (e) {
            reject(e);
        }
    });
});

export const getSidebarBehavior = (): Promise<PanelBehavior> => new Promise<PanelBehavior>((resolve, reject) => {
    if (isBrowser(Browser.Opera)) {
        throw new Error('The chrome.sidePanel.getPanelBehavior API is not supported in Opera')
    }

    sidePanel().getPanelBehavior((behavior) => {
        try {
            throwRuntimeError();

            resolve(behavior);
        } catch (e) {
            reject(e);
        }
    });
});

export const openSidebar = (options: OpenOptions): Promise<void> => new Promise<void>((resolve, reject) => {
    if (isBrowser(Browser.Opera)) {
        console.warn('The chrome.sidePanel.open API is not supported in Opera')
        return
    }

    sidePanel().open(options, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const setSidebarOptions = (options?: PanelOptions): Promise<void> => new Promise<void>((resolve, reject) => {
    if (isBrowser(Browser.Opera)) {
        console.warn('The chrome.sidePanel.setOptions API is not supported in Opera')
        return
    }

    sidePanel().setOptions(options || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const setSidebarBehavior = (behavior?: PanelBehavior): Promise<void> => new Promise<void>((resolve, reject) => {
    if (isBrowser(Browser.Opera)) {
        console.warn('The chrome.sidePanel.setPanelBehavior API is not supported in Opera')
        return
    }

    sidePanel().setPanelBehavior(behavior || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

// Customs methods
export const setSidebarPath = async (path: string, tabId?: number): Promise<void> => {
    if (isBrowser(Browser.Opera)) {
        sidebar().setPanel({tabId, panel: path})
    } else {
        await setSidebarOptions({tabId, path})
    }
}

export const getSidebarPath = async (tabId?: number): Promise<string | undefined> => {
    if (isBrowser(Browser.Opera)) {
        // opr.sidebarAction.getPanel returned path in the following format
        // chrome-extension://{extension_id}/sidebar.html
        return new URL(sidebar().getPanel({tabId})).pathname
    } else {
        return (await getSidebarOptions(tabId)).path
    }
}

// Methods for Opera
export const isSidebarAvailable = (): boolean => {
    return isBrowser(Browser.Opera) && !!sidebar()
}

export const setSidebarTitle = async (title: string | number, tabId?: number): Promise<void> => {
    if (!isSidebarAvailable()) {
        console.warn('The opr.sidebarAction.setTitle API is supported only in Opera')
        return
    }

    sidebar().setTitle({tabId, title: title.toString()})
}

export const setSidebarBadgeText = async (text: string | number, tabId?: number): Promise<void> => {
    if (!isSidebarAvailable()) {
        console.warn('The opr.sidebarAction.setBadgeText API is supported only in Opera')
        return
    }

    sidebar().setBadgeText({tabId, text: text.toString()})
}

export const setSidebarBadgeTextColor = async (color: Color, tabId?: number): Promise<void> => {
    if (!isSidebarAvailable()) {
        console.warn('The opr.sidebarAction.setBadgeTextColor API is supported only in Opera')
        return
    }

    sidebar().setBadgeTextColor({color, tabId})
}

export const setSidebarBadgeBgColor = async (color: Color, tabId?: number): Promise<void> => {
    if (!isSidebarAvailable()) {
        console.warn('The opr.sidebarAction.setBadgeBackgroundColor API is supported only in Opera')
        return
    }

    sidebar().setBadgeBackgroundColor({color, tabId})
}

export const getSidebarTitle = (tabId?: number): Promise<string> => new Promise<string>((resolve, reject) => {
    if (!isBrowser(Browser.Opera)) {
        throw new Error('The opr.sidebarAction.getTitle API is supported only in Opera')
    }

    sidebar().getTitle({tabId}, (title: string) => {
        try {
            throwRuntimeError();

            resolve(title);
        } catch (e) {
            reject(e);
        }
    })
})

export const getSidebarBadgeText = (tabId?: number): Promise<string> => new Promise<string>((resolve, reject) => {
    if (!isBrowser(Browser.Opera)) {
        throw new Error('The opr.sidebarAction.getBadgeText API is supported only in Opera')
    }

    sidebar().getBadgeText({tabId}, (text: string) => {
        try {
            throwRuntimeError();

            resolve(text);
        } catch (e) {
            reject(e);
        }
    })
})

export const getSidebarBadgeTextColor = (tabId?: number): Promise<ColorArray> => new Promise<ColorArray>((resolve, reject) => {
    if (!isBrowser(Browser.Opera)) {
        throw new Error('The opr.sidebarAction.getBadgeTextColor API is supported only in Opera')
    }

    sidebar().getBadgeTextColor({tabId}, (color: ColorArray) => {
        try {
            throwRuntimeError();

            resolve(color);
        } catch (e) {
            reject(e);
        }
    })
})

export const getSidebarBadgeBgColor = (tabId?: number): Promise<ColorArray> => new Promise<ColorArray>((resolve, reject) => {
    if (!isBrowser(Browser.Opera)) {
        throw new Error('The opr.sidebarAction.getBadgeBackgroundColor API is supported only in Opera')
    }

    sidebar().getBadgeBackgroundColor({tabId}, (color: ColorArray) => {
        try {
            throwRuntimeError();

            resolve(color);
        } catch (e) {
            reject(e);
        }
    })
})
