import {browser} from "./browser";
import {handleListener} from "./utils";
import {throwRuntimeError} from "./runtime";

type Cookie = chrome.cookies.Cookie;
type CookieStore = chrome.cookies.CookieStore;
type CookiePartitionKey = chrome.cookies.CookiePartitionKey;
type FrameDetails = chrome.cookies.FrameDetails;
type CookieDetails = chrome.cookies.CookieDetails;
type GetAllDetails = chrome.cookies.GetAllDetails;
type SetDetails = chrome.cookies.SetDetails;

const cookies = () => browser().cookies as typeof chrome.cookies;

// Methods
export const getCookie = (details: CookieDetails): Promise<Cookie | null> => new Promise<Cookie | null>((resolve, reject) => {
    cookies().get(details, (cookie) => {
        try {
            throwRuntimeError();

            resolve(cookie);
        } catch (e) {
            reject(e);
        }
    });
});

export const getAllCookie = (details?: GetAllDetails): Promise<Cookie[]> => new Promise<Cookie[]>((resolve, reject) => {
    cookies().getAll(details || {}, (cookies) => {
        try {
            throwRuntimeError();

            resolve(cookies);
        } catch (e) {
            reject(e);
        }
    });
});

export const getAllCookieStores = (): Promise<CookieStore[]> => new Promise<CookieStore[]>((resolve, reject) => {
    cookies().getAllCookieStores((cookieStores) => {
        try {
            throwRuntimeError();

            resolve(cookieStores);
        } catch (e) {
            reject(e);
        }
    });
});

export const getCookiePartitionKey = (details: FrameDetails): Promise<CookiePartitionKey> => new Promise<CookiePartitionKey>((resolve, reject) => {
    cookies().getPartitionKey(details, (details) => {
        try {
            throwRuntimeError();

            resolve(details.partitionKey);
        } catch (e) {
            reject(e);
        }
    });
});

export const removeCookie = (details: CookieDetails): Promise<CookieDetails> => new Promise<CookieDetails>((resolve, reject) => {
    cookies().remove(details, (details) => {
        try {
            throwRuntimeError();

            resolve(details);
        } catch (e) {
            reject(e);
        }
    });
});

export const setCookie = (details: SetDetails): Promise<Cookie | null> => new Promise<Cookie | null>((resolve, reject) => {
    cookies().set(details, (cookie) => {
        try {
            throwRuntimeError();

            resolve(cookie);
        } catch (e) {
            reject(e);
        }
    });
});


// Events
export const onCookieChanged = (callback: Parameters<typeof chrome.cookies.onChanged.addListener>[0]): () => void => {
    return handleListener(cookies().onChanged, callback)
}
