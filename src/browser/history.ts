import {browser} from "./browser";
import {handleListener} from "./utils";
import {throwRuntimeError} from "./runtime";

type Url = chrome.history.Url
type Range = chrome.history.Range
type VisitItem = chrome.history.VisitItem
type HistoryQuery = chrome.history.HistoryQuery
type HistoryItem = chrome.history.HistoryItem

const history = () => browser().history as typeof chrome.history;

// Methods
export const addHistoryUrl = (url: string): Promise<void> => new Promise<void>((resolve, reject) => {
    history().addUrl({url}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const deleteAllHistory = (): Promise<void> => new Promise<void>((resolve, reject) => {
    history().deleteAll(() => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const deleteRangeHistory = (range: Range): Promise<void> => new Promise<void>((resolve, reject) => {
    history().deleteRange(range, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const deleteHistoryUrl = (details: Url): Promise<void> => new Promise<void>((resolve, reject) => {
    history().deleteUrl(details, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});

export const getHistoryVisits = (url: string): Promise<VisitItem[]> => new Promise<VisitItem[]>((resolve, reject) => {
    history().getVisits({url}, (results) => {
        try {
            throwRuntimeError();

            resolve(results);
        } catch (e) {
            reject(e);
        }
    });
});

export const searchHistory = (query: HistoryQuery): Promise<HistoryItem[]> => new Promise<HistoryItem[]>((resolve, reject) => {
    history().search(query, (results) => {
        try {
            throwRuntimeError();

            resolve(results);
        } catch (e) {
            reject(e);
        }
    });
});


// Events
export const onVisited = (callback: Parameters<typeof chrome.history.onVisited.addListener>[0]): () => void => {
    return handleListener(history().onVisited, callback)
}

export const onVisitRemoved = (callback: Parameters<typeof chrome.history.onVisitRemoved.addListener>[0]): () => void => {
    return handleListener(history().onVisitRemoved, callback)
}
