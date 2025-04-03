import {browser} from "./env";
import {throwRuntimeError} from "./runtime";

import {TabsMap} from "@typing/tab";

type Tab = chrome.tabs.Tab;
type QueryInfo = chrome.tabs.QueryInfo;
type InjectDetails = chrome.tabs.InjectDetails;
type UpdateProperties = chrome.tabs.UpdateProperties;
type CreateProperties = chrome.tabs.CreateProperties;

const tabs = browser().tabs;

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

export const updateTabAsSelected = (tabId: number) => updateTab(tabId, {highlighted: true});

export const updateTabAsActive = (tabId: number) => updateTab(tabId, {active: true});

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

export const getCurrentTab = (): Promise<Tab> => queryTabs({
    active: true,
    currentWindow: true
}).then(tabs => {
    if (!tabs || !tabs[0]) {
        throw new Error('Tab not found');
    }

    return tabs[0];
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

export const onTabActivated = (callback: Parameters<typeof tabs.onActivated.addListener>[0]): Function => {
    tabs.onActivated.addListener(callback);

    return () => tabs.onActivated.removeListener(callback);
}

export const onTabCreated = (callback: Parameters<typeof tabs.onCreated.addListener>[0]): Function => {
    tabs.onCreated.addListener(callback);

    return () => tabs.onCreated.removeListener(callback);
}

export const onTabRemoved = (callback: Parameters<typeof tabs.onRemoved.addListener>[0]): Function => {
    tabs.onRemoved.addListener(callback);

    return () => tabs.onRemoved.removeListener(callback);
};

export const onTabUpdated = (callback: Parameters<typeof tabs.onUpdated.addListener>[0]): Function => {
    tabs.onUpdated.addListener(callback);

    return () => tabs.onUpdated.removeListener(callback);
}
