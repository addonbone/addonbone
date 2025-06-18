import {ContentScriptRenderHandler, ContentScriptRenderValue} from "@typing/content";

export const isValidContentScriptRenderValue = (value: unknown): value is string | number | Element => {
    return (typeof value === "string" && value.length > 0) || typeof value === "number" || value instanceof Element;
}

export const contentScriptRenderResolver = (
    render?: ContentScriptRenderValue | ContentScriptRenderHandler
): ContentScriptRenderHandler => async (props): Promise<undefined | ContentScriptRenderValue> => {
    let resolvedRender = typeof render === "function" ? render(props) : render;

    if (resolvedRender instanceof Promise) {
        resolvedRender = await resolvedRender;
    }

    if (resolvedRender !== true && !isValidContentScriptRenderValue(resolvedRender)) {
        return;
    }

    return resolvedRender;
}