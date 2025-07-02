import {isValidElement} from "react";
import {createRoot, Root} from "react-dom/client";

import Builder from "../core/Builder";

import {viewReactRenderResolver} from "./resolvers/render";

import {ViewConfig, ViewDefinition, ViewRenderHandler, ViewRenderValue} from "@typing/view";

export default class<T extends ViewConfig> extends Builder<T> {
    protected root?: Root;

    protected container?: Element;

    public constructor(definition: ViewDefinition<T>) {
        super(definition);
    }

    protected resolveRender(render?: ViewRenderValue<T>): ViewRenderHandler<T> {
        return viewReactRenderResolver(render);
    }

    public async build(): Promise<void> {
        await super.build();

        const props = this.getProps();

        const element = await this.definition.render(props);

        if (!isValidElement(element)) {
            return;
        }

        this.container = await this.definition.container(props);

        if (!this.container) {
            return;
        }

        document.body.prepend(this.container);

        this.root = createRoot(this.container);

        this.root.render(element);
    }

    public async destroy(): Promise<void> {
        this.root?.unmount();
        this.root = undefined;

        this.container?.remove();
        this.container = undefined;
    }
}
