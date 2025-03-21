import {ContentScriptRenderHandler, ContentScriptRenderValue} from "@typing/content";

export const contentScriptRenderResolver = (
    render?: ContentScriptRenderValue | ContentScriptRenderHandler
): ContentScriptRenderHandler => async (props): Promise<void | ContentScriptRenderValue> => {
    let resolvedRender = typeof render === "function" ? render(props) : render;

    if (resolvedRender instanceof Promise) {
        resolvedRender = await resolvedRender;
    }

    if (
        typeof resolvedRender === "function" ||
        typeof resolvedRender === "string" ||
        typeof resolvedRender === "number"
    ) {
        return resolvedRender;
    }
}