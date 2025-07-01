import _ from "lodash";

export const removeAllSpaces = (str: string): string => {
    return str.replace(/\s/g, "");
};

export const hasSymbols = (str?: string | number | null): boolean => {
    if (!_.isString(str)) {
        return false;
    }

    return removeAllSpaces(str).length > 0;
};
