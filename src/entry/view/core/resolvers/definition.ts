import {isValidViewRenderValue} from "../resolvers/render";

import {ViewConfig, ViewDefinition, ViewRenderHandler, ViewRenderValue} from "@typing/view";

export const isViewDefinition = <T extends ViewConfig = ViewConfig>(
    definition: any
): definition is ViewDefinition<T> => {
    return (
        definition && typeof definition === "object" && definition.constructor === Object && !("$$typeof" in definition)
    );
};

export const isValidViewDefinitionRenderValue = <T extends ViewConfig = ViewConfig>(
    definition: any
): definition is ViewRenderValue<T> | ViewRenderHandler<T> => {
    return (
        isValidViewRenderValue(definition) ||
        typeof definition === "function" ||
        (typeof definition === "object" && definition.constructor === Object && "$$typeof" in definition)
    );
};
