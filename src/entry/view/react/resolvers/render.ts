import {createElement, isValidElement} from "react";

import {ViewRenderHandler, ViewRenderValue, ViewConfig} from "@typing/view";

export const viewReactRenderResolver =
    <T extends ViewConfig>(render?: ViewRenderValue<T>): ViewRenderHandler<T> =>
    async (props): Promise<void | ViewRenderValue<T>> => {
        let resolvedRender = typeof render === "function" ? createElement(render, props) : render;

        if (isValidElement(resolvedRender)) {
            return resolvedRender;
        }
    };
