import {__t} from "@main/locale";

import Builder from "@entry/core/Builder";

import {viewContainerResolver} from "./resolvers/container";
import {viewRenderResolver} from "./resolvers/render";

import {
    ViewBuilder,
    ViewConfig,
    ViewContainerCreator,
    ViewContainerFactory,
    ViewContainerOptions,
    ViewContainerTag,
    ViewDefinition,
    ViewRenderHandler,
    ViewRenderValue,
    ViewResolvedDefinition
} from "@typing/view";


export default abstract class<T extends ViewConfig> extends Builder implements ViewBuilder {
    protected readonly definition: ViewResolvedDefinition<T>;

    protected constructor(definition: ViewDefinition<T>) {
        super();

        this.definition = {
            ...definition,
            container: this.resolveContainer(definition.container),
            render: this.resolveRender(definition.render),
        };
    }

    protected resolveContainer(
        container?:
            ViewContainerTag |
            ViewContainerOptions |
            ViewContainerFactory<T>
    ): ViewContainerCreator<T> {
        return viewContainerResolver<T>(container);
    }

    protected resolveRender(
        render?: ViewRenderValue<T> | ViewRenderHandler<T>
    ): ViewRenderHandler<T> {
        return viewRenderResolver<T>(render);
    }

    protected getProps(): T {
        const {render, container, ...props} = this.definition;

        return props as T;
    }

    public async build(): Promise<void> {
        const {title} = this.definition;

        if (title) {
            document.title = __t(title);
        }
    }
}