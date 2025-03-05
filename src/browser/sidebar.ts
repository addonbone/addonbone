import {isBrowser} from "./env";
import {Browser} from "@typing/browser";

type BadgeTextDetails = chrome.action.BadgeTextDetails;
type BadgeBackgroundColorDetails = chrome.browserAction.BadgeBackgroundColorDetails;

const isActionSidebarAvailable = (): boolean => {
    return isBrowser(Browser.Opera);
}

const setActionSidebarBadgeText = (details: BadgeTextDetails): void => {
    if (!isActionSidebarAvailable()) {
        return;
    }

    //@ts-ignore
    opr.sidebarAction.setBadgeText(details);
}

const setActionSidebarBadgeBgColor = (details: BadgeBackgroundColorDetails): void => {
    if (!isActionSidebarAvailable()) {
        return;
    }

    //@ts-ignore
    opr.sidebarAction.setBadgeBackgroundColor(details);
}
