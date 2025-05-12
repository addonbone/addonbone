import {browser} from "./browser";
import {handleListener} from "./utils";
import {throwRuntimeError} from "./runtime";
import {MessageBody, MessageDictionary, MessageResponse, MessageType} from "@typing/message";

type Tab = chrome.tabs.Tab;
type Port = chrome.runtime.Port;
type Window = chrome.windows.Window;

type ZoomSettings = chrome.tabs.ZoomSettings;
type InjectDetails = chrome.tabs.InjectDetails;

type QueryInfo = chrome.tabs.QueryInfo;
type ConnectInfo = chrome.tabs.ConnectInfo;
type HighlightInfo = chrome.tabs.HighlightInfo;

type GroupOptions = chrome.tabs.GroupOptions;
type CaptureVisibleTabOptions = chrome.tabs.CaptureVisibleTabOptions;

type MoveProperties = chrome.tabs.MoveProperties;
type UpdateProperties = chrome.tabs.UpdateProperties;
type CreateProperties = chrome.tabs.CreateProperties;

type MessageSendOptions = chrome.tabs.MessageSendOptions;

const tabs = () => browser().tabs as typeof chrome.tabs;

// Methods
export const captureVisibleTab = (windowId: number, options: CaptureVisibleTabOptions): Promise<string> => new Promise<string>((resolve, reject) => {
    tabs().captureVisibleTab(windowId, options, (dataUrl) => {
        try {
            throwRuntimeError();

            resolve(dataUrl);
        } catch (e) {
            reject(e);
        }
    });
});

export const connectTab = (tabId: number, connectInfo?: ConnectInfo): Port => tabs().connect(tabId, connectInfo);

export const createTab = (properties: CreateProperties): Promise<Tab> => new Promise<Tab>((resolve, reject) => {
    tabs().create(properties, (tab) => {
        try {
            throwRuntimeError();

            resolve(tab);
        } catch (e) {
            reject(e);
        }
    });
});

export const detectTabLanguage = (tabId: number): Promise<string> => new Promise<string>((resolve, reject) => {
    // For an unknown/undefined language, und is returned.
    tabs().detectLanguage(tabId, (language) => {
        try {
            throwRuntimeError();

            resolve(language);
        } catch (e) {
            reject(e);
        }
    });
});

export const discardTab = (tabId: number): Promise<Tab> => new Promise<Tab>((resolve, reject) => {
    tabs().discard(tabId, (tab) => {
        try {
            throwRuntimeError();

            resolve(tab);
        } catch (e) {
            reject(e);
        }
    });
});

export const duplicateTab = (tabId: number): Promise<Tab | undefined> => new Promise<Tab | undefined>((resolve, reject) => {
    tabs().duplicate(tabId, (tab) => {
        try {
            throwRuntimeError();

            resolve(tab);
        } catch (e) {
            reject(e);
        }
    });
});

export const getTab = (tabId: number): Promise<Tab> => new Promise<Tab>((resolve, reject) => {
    tabs().get(tabId, (tab) => {
        try {
            throwRuntimeError();

            resolve(tab);
        } catch (e) {
            reject(e);
        }
    });
});

export const getCurrentTab = (): Promise<Tab | undefined> => new Promise<Tab | undefined>((resolve, reject) => {
    // Returns undefined if called from a non-tab context (for example, a background view or popup view)
    tabs().getCurrent((tab) => {
        try {
            throwRuntimeError();

            resolve(tab);
        } catch (e) {
            reject(e);
        }
    });
});

export const getTabZoom = (tabId: number): Promise<number> => new Promise<number>((resolve, reject) => {
    tabs().getZoom(tabId, (zoomFactor) => {
        try {
            throwRuntimeError();

            resolve(zoomFactor);
        } catch (e) {
            reject(e);
        }
    });
});

export const getTabZoomSettings = (tabId: number): Promise<ZoomSettings> => new Promise<ZoomSettings>((resolve, reject) => {
    tabs().getZoomSettings(tabId, (zoomSettings) => {
        try {
            throwRuntimeError();

            resolve(zoomSettings);
        } catch (e) {
            reject(e);
        }
    });
});

export const goTabBack = (tabId: number): Promise<void> => new Promise<void>((resolve, reject) => {
    tabs().goBack(tabId, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const goTabForward = (tabId: number): Promise<void> => new Promise<void>((resolve, reject) => {
    tabs().goForward(tabId, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const groupTabs = (options: GroupOptions): Promise<number> => new Promise<number>((resolve, reject) => {
    tabs().group(options, (tabs) => {
        try {
            throwRuntimeError();

            resolve(tabs);
        } catch (e) {
            reject(e);
        }
    });
});

export const highlightTab = (highlightInfo: HighlightInfo): Promise<Window> => new Promise<Window>((resolve, reject) => {
    tabs().highlight(highlightInfo, (window) => {
        try {
            throwRuntimeError();

            resolve(window);
        } catch (e) {
            reject(e);
        }
    });
});

export const moveTab = (tabId: number, moveProperties: MoveProperties): Promise<Tab> => new Promise<Tab>((resolve, reject) => {
    tabs().move(tabId, moveProperties, (tab) => {
        try {
            throwRuntimeError();

            resolve(tab);
        } catch (e) {
            reject(e);
        }
    });
});

export const moveTabs = (tabIds: number[], moveProperties: MoveProperties): Promise<Tab[]> => new Promise<Tab[]>((resolve, reject) => {
    tabs().move(tabIds, moveProperties, (tabs) => {
        try {
            throwRuntimeError();

            resolve(tabs);
        } catch (e) {
            reject(e);
        }
    });
});

export const queryTabs = (queryInfo?: QueryInfo): Promise<Tab[]> => new Promise<Tab[]>((resolve, reject) => {
    tabs().query(queryInfo || {}, (tabs) => {
        try {
            throwRuntimeError();

            resolve(tabs);
        } catch (e) {
            reject(e);
        }
    });
});

export const reloadTab = (tabId: number, bypassCache?: boolean | undefined): Promise<void> => new Promise<void>((resolve, reject) => {
    tabs().reload(tabId, {bypassCache}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const removeTab = (tabId: number): Promise<void> => new Promise<void>((resolve, reject) => {
    tabs().remove(tabId, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const sendTabMessage = <T extends MessageDictionary, K extends MessageType<T>>(
    tabId: number,
    message: MessageBody<T, K>,
    options: MessageSendOptions = {}
): Promise<MessageResponse<T, K>> => new Promise<MessageResponse<T, K>>((resolve, reject) => {
    tabs().sendMessage(tabId, message, options, (response) => {
        try {
            throwRuntimeError();

            resolve(response);
        } catch (e) {
            reject(e);
        }
    });
});

export const setTabZoom = (tabId: number, zoomFactor: number): Promise<void> => new Promise<void>((resolve, reject) => {
    tabs().setZoom(tabId, zoomFactor, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const setTabZoomSettings = (tabId: number, zoomSettings: ZoomSettings): Promise<void> => new Promise<void>((resolve, reject) => {
    tabs().setZoomSettings(tabId, zoomSettings, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const ungroupTab = (tabIds: number | number[]): Promise<void> => new Promise<void>((resolve, reject) => {
    tabs().ungroup(tabIds, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const updateTab = (tabId: number, updateProperties: UpdateProperties): Promise<Tab | undefined> => new Promise<Tab | undefined>((resolve, reject) => {
    tabs().update(tabId, updateProperties, (tab) => {
        try {
            throwRuntimeError();

            resolve(tab);
        } catch (e) {
            reject(e);
        }
    });
});

export const executeScriptTab = (tabId: number, details: InjectDetails): Promise<any[]> => new Promise<any[]>((resolve, reject) => {
    tabs().executeScript(tabId, details, (result) => {
        try {
            throwRuntimeError();

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
});


// Custom Methods
export const getTabUrl = async (tabId: number): Promise<string> => {
    const tab = await findTabById(tabId);

    if (!tab) {
        throw new Error(`Tab id "${tabId}" not exist`);
    }

    const {url} = tab;

    if (!url) {
        throw new Error(`URL not exist by tab id ${tabId}`);
    }

    return url;
}

export const getActiveTab = async (): Promise<Tab> => {
    const tabs = await queryTabs({active: true, currentWindow: true})

    if (!tabs || !tabs[0]) {
        throw new Error('Tab not found');
    }

    return tabs[0];
}

export const queryTabIds = async (queryInfo?: QueryInfo): Promise<number[]> => (await queryTabs(queryInfo)).reduce((ids, {id}) => {
    if (typeof id === 'number') {
        return [...ids, id];
    }

    return ids;
}, [] as number[]);

export const findTab = (queryInfo?: QueryInfo): Promise<Tab | undefined> => queryTabs(queryInfo).then(tabs => tabs.length ? tabs[0] : undefined);

export const findTabById = (tabId: number): Promise<Tab | undefined> => getTab(tabId).then(tab => tab).catch(() => undefined);

export const updateTabAsSelected = (tabId: number): Promise<Tab | undefined> => updateTab(tabId, {highlighted: true});

export const updateTabAsActive = (tabId: number): Promise<Tab | undefined> => updateTab(tabId, {active: true});

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


// Events
export const onTabsActivated = (callback: Parameters<typeof chrome.tabs.onActivated.addListener>[0]): () => void => {
    return handleListener(tabs().onActivated, callback)
}

export const onTabsAttached = (callback: Parameters<typeof chrome.tabs.onAttached.addListener>[0]): () => void => {
    return handleListener(tabs().onAttached, callback)
}

export const onTabsCreated = (callback: Parameters<typeof chrome.tabs.onCreated.addListener>[0]): () => void => {
    return handleListener(tabs().onCreated, callback)
}

export const onTabsDetached = (callback: Parameters<typeof chrome.tabs.onDetached.addListener>[0]): () => void => {
    return handleListener(tabs().onDetached, callback)
}

export const onTabsHighlighted = (callback: Parameters<typeof chrome.tabs.onHighlighted.addListener>[0]): () => void => {
    return handleListener(tabs().onHighlighted, callback)
};

export const onTabsMoved = (callback: Parameters<typeof chrome.tabs.onMoved.addListener>[0]): () => void => {
    return handleListener(tabs().onMoved, callback)
}

export const onTabsRemoved = (callback: Parameters<typeof chrome.tabs.onRemoved.addListener>[0]): () => void => {
    return handleListener(tabs().onRemoved, callback)
};

export const onTabsReplaced = (callback: Parameters<typeof chrome.tabs.onReplaced.addListener>[0]): () => void => {
    return handleListener(tabs().onReplaced, callback)
};

export const onTabsUpdated = (callback: Parameters<typeof chrome.tabs.onUpdated.addListener>[0]): () => void => {
    return handleListener(tabs().onUpdated, callback)
}

export const onTabsZoomChange = (callback: Parameters<typeof chrome.tabs.onZoomChange.addListener>[0]): () => void => {
    return handleListener(tabs().onZoomChange, callback)
}
