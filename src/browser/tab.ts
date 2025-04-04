import {browser} from "./env";
import {throwRuntimeError} from "./runtime";

import {TabsMap} from "@typing/tab";

type Tab = chrome.tabs.Tab;

type Window = chrome.windows.Window;

type ZoomSettings = chrome.tabs.ZoomSettings;
type InjectDetails = chrome.tabs.InjectDetails;

type QueryInfo = chrome.tabs.QueryInfo;
type HighlightInfo = chrome.tabs.HighlightInfo;

type GroupOptions = chrome.tabs.GroupOptions;
type CaptureVisibleTabOptions = chrome.tabs.CaptureVisibleTabOptions;

type MoveProperties = chrome.tabs.MoveProperties;
type UpdateProperties = chrome.tabs.UpdateProperties;
type CreateProperties = chrome.tabs.CreateProperties;

const tabs = browser().tabs;

// =================================
// ============ METHODS ============
// =================================
export const captureVisibleTab = (windowId: number, options: CaptureVisibleTabOptions) => new Promise<string>((resolve, reject) => {
    tabs.captureVisibleTab(windowId, options, (dataUrl) => {
        try {
            throwRuntimeError();

            resolve(dataUrl);
        } catch (e) {
            reject(e);
        }
    });
});

export const createTab = (properties: CreateProperties): Promise<Tab> => new Promise<Tab>((resolve, reject) => {
    tabs.create(properties, (tab) => {
        try {
            throwRuntimeError();

            resolve(tab);
        } catch (e) {
            reject(e);
        }
    });
});

export const detectTabLanguage = (tabId: number) => new Promise<string>((resolve, reject) => {
    // For an unknown/undefined language, und is returned.
    tabs.detectLanguage(tabId, (language) => {
        try {
            throwRuntimeError();

            resolve(language);
        } catch (e) {
            reject(e);
        }
    });
});

export const discardTab = (tabId: number) => new Promise<Tab>((resolve, reject) => {
    tabs.discard(tabId, (tab) => {
        try {
            throwRuntimeError();

            resolve(tab);
        } catch (e) {
            reject(e);
        }
    });
});

export const duplicateTab = (tabId: number) => new Promise<Tab | undefined>((resolve, reject) => {
    tabs.duplicate(tabId, (tab) => {
        try {
            throwRuntimeError();

            resolve(tab);
        } catch (e) {
            reject(e);
        }
    });
});

export const getTab = (tabId: number) => new Promise<Tab | undefined>(resolve => {
    tabs.get(tabId, (tab) => {
        try {
            throwRuntimeError();

            resolve(tab);
        } catch (e) {
            resolve(undefined);
        }
    });
});

export const getCurrentTabNative = () => new Promise<Tab | undefined>((resolve, reject) => {
    // Returns undefined if called from a non-tab context (for example, a background page or popup view)
    tabs.getCurrent((tab) => {
        try {
            throwRuntimeError();

            resolve(tab);
        } catch (e) {
            reject(e);
        }
    });
});

export const getTabZoom = (tabId: number) => new Promise<number>((resolve, reject) => {
    tabs.getZoom(tabId, (zoomFactor) => {
        try {
            throwRuntimeError();

            resolve(zoomFactor);
        } catch (e) {
            reject(e);
        }
    });
});

export const getTabZoomSettings = (tabId: number) => new Promise<ZoomSettings>((resolve, reject) => {
    tabs.getZoomSettings(tabId, (zoomSettings) => {
        try {
            throwRuntimeError();

            resolve(zoomSettings);
        } catch (e) {
            reject(e);
        }
    });
});

export const goTabBack = (tabId: number) => new Promise<void>((resolve, reject) => {
    tabs.goBack(tabId, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const goTabForward = (tabId: number) => new Promise<void>((resolve, reject) => {
    tabs.goForward(tabId, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const groupTabs = (options: GroupOptions) => new Promise<number>((resolve, reject) => {
    tabs.group(options, (tabs) => {
        try {
            throwRuntimeError();

            resolve(tabs);
        } catch (e) {
            reject(e);
        }
    });
});

export const highlightTab = (highlightInfo: HighlightInfo) => new Promise<Window>((resolve, reject) => {
    tabs.highlight(highlightInfo, (window) => {
        try {
            throwRuntimeError();

            resolve(window);
        } catch (e) {
            reject(e);
        }
    });
});

export const moveTab = (tabId: number, moveProperties: MoveProperties) => new Promise<Tab>((resolve, reject) => {
    tabs.move(tabId, moveProperties, (tab) => {
        try {
            throwRuntimeError();

            resolve(tab);
        } catch (e) {
            reject(e);
        }
    });
});

export const moveTabs = (tabIds: number[], moveProperties: MoveProperties) => new Promise<Tab[]>((resolve, reject) => {
    tabs.move(tabIds, moveProperties, (tabs) => {
        try {
            throwRuntimeError();

            resolve(tabs);
        } catch (e) {
            reject(e);
        }
    });
});

export const queryTabs = (queryInfo?: QueryInfo) => new Promise<Tab[]>((resolve, reject) => {
    tabs.query(queryInfo || {}, (tabs) => {
        try {
            throwRuntimeError();

            resolve(tabs);
        } catch (e) {
            reject(e);
        }
    });
});

export const reloadTab = (tabId: number, bypassCache?: boolean | undefined) => new Promise<void>((resolve, reject) => {
    tabs.reload(tabId, {bypassCache}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeTab = (tabId: number): Promise<void> => new Promise<void>((resolve, reject) => {
    tabs.remove(tabId, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const setTabZoom = (tabId: number, zoomFactor: number) => new Promise<void>((resolve, reject) => {
    tabs.setZoom(tabId, zoomFactor, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const setTabZoomSettings = (tabId: number, zoomSettings: ZoomSettings) => new Promise<void>((resolve, reject) => {
    tabs.setZoomSettings(tabId, zoomSettings, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const ungroupTab = (tabIds: number | number[]) => new Promise<void>((resolve, reject) => {
    tabs.ungroup(tabIds, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const updateTab = (tabId: number, updateProperties: UpdateProperties) => new Promise<Tab | undefined>((resolve, reject) => {
    tabs.update(tabId, updateProperties, (tab) => {
        try {
            throwRuntimeError();

            resolve(tab);
        } catch (e) {
            reject(e);
        }
    });
});

export const executeScriptTab = (tabId: number, details: InjectDetails) => new Promise<any[]>((resolve, reject) => {
    tabs.executeScript(tabId, details, (result) => {
        try {
            throwRuntimeError();

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
});

// =================================
// ======== CUSTOM METHODS =========
// =================================
export const getTabUrl = async (tabId: number): Promise<string> => {
    const tab = await getTab(tabId);

    if (!tab) {
        throw new Error(`Tab id "${tabId}" not exist`);
    }

    const {url} = tab;

    if (!url) {
        throw new Error(`URL not exist by tab id ${tabId}`);
    }

    return url;
}

export const getCurrentTab = async (): Promise<Tab> => {
    const tabs = await queryTabs({active: true, currentWindow: true})

    if (!tabs || !tabs[0]) {
        throw new Error('Tab not found');
    }

    return tabs[0];
}

export const queryTabsMap = async (queryInfo?: QueryInfo): Promise<TabsMap> => (await queryTabs(queryInfo)).reduce((map, tab) => {
    if (typeof tab.id === 'number') {
        return {...map, [tab.id]: tab};
    }
    return map;
}, {} as TabsMap);

export const queryTabIds = async (queryInfo?: QueryInfo): Promise<number[]> => (await queryTabs(queryInfo)).reduce((ids, {id}) => {
    if (typeof id === 'number') {
        return [...ids, id];
    }

    return ids;
}, [] as number[]);

export const findTab = (queryInfo?: QueryInfo): Promise<Tab | undefined> => queryTabs(queryInfo).then(tabs => tabs.length ? tabs[0] : undefined);

export const updateTabAsSelected = (tabId: number) => updateTab(tabId, {highlighted: true});

export const updateTabAsActive = (tabId: number) => updateTab(tabId, {active: true});

export const openOrCreateTab = async (tab: Tab): Promise<void> => {
    const {id, url} = tab;

    if (id && url) {
        const existTab = await findTab({url});

        if (existTab && id && existTab.id === id) {
            await updateTabAsSelected(id);

            return;
        }
    }

    await createTab({url});
}

// =================================
// ============ EVENTS =============
// =================================
export const onTabActivated = (callback: Parameters<typeof tabs.onActivated.addListener>[0]): () => void => {
    tabs.onActivated.addListener(callback);

    return () => tabs.onActivated.removeListener(callback);
}

export const onTabAttached = (callback: Parameters<typeof tabs.onAttached.addListener>[0]): () => void => {
    tabs.onAttached.addListener(callback);

    return () => tabs.onAttached.removeListener(callback);
}

export const onTabCreated = (callback: Parameters<typeof tabs.onCreated.addListener>[0]): () => void => {
    tabs.onCreated.addListener(callback);

    return () => tabs.onCreated.removeListener(callback);
}

export const onTabDetached = (callback: Parameters<typeof tabs.onDetached.addListener>[0]): () => void => {
    tabs.onDetached.addListener(callback);

    return () => tabs.onDetached.removeListener(callback);
}

export const onTabHighlighted = (callback: Parameters<typeof tabs.onHighlighted.addListener>[0]): () => void => {
    tabs.onHighlighted.addListener(callback);

    return () => tabs.onHighlighted.removeListener(callback);
};

export const onTabMoved = (callback: Parameters<typeof tabs.onMoved.addListener>[0]): () => void => {
    tabs.onMoved.addListener(callback);

    return () => tabs.onMoved.removeListener(callback);
}

export const onTabRemoved = (callback: Parameters<typeof tabs.onRemoved.addListener>[0]): () => void => {
    tabs.onRemoved.addListener(callback);

    return () => tabs.onRemoved.removeListener(callback);
};

export const onTabReplaced = (callback: Parameters<typeof tabs.onReplaced.addListener>[0]): () => void => {
    tabs.onReplaced.addListener(callback);

    return () => tabs.onReplaced.removeListener(callback);
};

export const onTabUpdated = (callback: Parameters<typeof tabs.onUpdated.addListener>[0]): () => void => {
    tabs.onUpdated.addListener(callback);

    return () => tabs.onUpdated.removeListener(callback);
}

export const onTabZoomChange = (callback: Parameters<typeof tabs.onZoomChange.addListener>[0]): () => void => {
    tabs.onZoomChange.addListener(callback);

    return () => tabs.onZoomChange.removeListener(callback);
}
