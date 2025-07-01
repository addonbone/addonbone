import {ViewConfig, ViewRenderHandler, ViewRenderValue} from "@typing/view";

export const isValidViewRenderValue = (value: unknown): value is string | number | Element => {
    return (typeof value === "string" && value.length > 0) || typeof value === "number" || value instanceof Element;
};

export const viewRenderResolver =
    <T extends ViewConfig>(render?: ViewRenderValue<T> | ViewRenderHandler<T>): ViewRenderHandler<T> =>
    async (props): Promise<void | ViewRenderValue<T>> => {
        let resolvedRender = typeof render === "function" ? render(props) : render;

        if (resolvedRender instanceof Promise) {
            resolvedRender = await resolvedRender;
        }

        if (!isValidViewRenderValue(resolvedRender)) {
            return;
        }

        return resolvedRender;
    };
