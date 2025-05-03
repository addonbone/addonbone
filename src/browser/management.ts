import {browser} from "./browser";
import {throwRuntimeError} from "./runtime";

type UninstallOptions = chrome.management.UninstallOptions;

const management = () => browser().management;

export const uninstallManagementSelf = async (options?: UninstallOptions): Promise<void> => new Promise<void>((resolve, reject) => {
    management().uninstallSelf(options || {}, () => {
        try {
            throwRuntimeError();

            resolve();
        } catch (e) {
            reject(e);
        }
    });
});
