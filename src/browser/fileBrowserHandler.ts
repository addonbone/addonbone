import {browser} from "./browser";
import {handleListener} from "./utils";

const fileBrowserHandler = () => browser().fileBrowserHandler as typeof chrome.fileBrowserHandler;

export const onExecute = (callback: Parameters<typeof chrome.fileBrowserHandler.onExecute.addListener>[0]): () => void => {
    return handleListener(fileBrowserHandler().onExecute, callback)
}
