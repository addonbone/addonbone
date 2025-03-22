import {createElement, isValidElement} from "react";

import {ContentScriptRenderHandler, ContentScriptRenderValue} from "@typing/content";

export const contentScriptReactRenderResolver = (
    render?: ContentScriptRenderValue
): ContentScriptRenderHandler => async (props): Promise<void | ContentScriptRenderValue> => {
    let resolvedRender = typeof render === "function" ? createElement(render, props) : render;

    if (isValidElement(resolvedRender)) {
        return resolvedRender;
    }
}