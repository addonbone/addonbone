export const removeAllSpaces = (str: string): string => {
    return str.replace(/\s/g, '');
};

export const hasSymbols = (str?: string | number | null): boolean => {
    if (typeof str !== "string") {
        return false;
    }

    return removeAllSpaces(str).length > 0;
};
