import {contentScriptMountAppendResolver} from "./resolvers/mount";
import {contentScriptAnchorResolver} from "./resolvers/anchor";
import {contentScriptRenderResolver} from "./resolvers/render";
import {contentScriptContainerResolver} from "./resolvers/container";

import ManagedContext from "./ManagedContext";

import {
    ContentScriptAnchor,
    ContentScriptAnchorGetter,
    ContentScriptAnchorResolver,
    ContentScriptBuilder,
    ContentScriptContainerCreator,
    ContentScriptContainerFactory,
    ContentScriptContainerOptions,
    ContentScriptContainerTag,
    ContentScriptDefinition,
    ContentScriptMountFunction,
    ContentScriptNode,
    ContentScriptRenderHandler,
    ContentScriptRenderValue,
    ContentScriptResolvedDefinition
} from "@typing/content";

import {Awaiter} from "@typing/helpers";

export default abstract class implements ContentScriptBuilder {
    protected readonly definition: ContentScriptResolvedDefinition;

    protected context = new ManagedContext();

    protected abstract createNode(anchor: Element): Promise<ContentScriptNode>;

    protected abstract cleanupNode(anchor: Element): Awaiter<void>;

    protected constructor(definition: ContentScriptDefinition) {
        this.definition = {
            ...definition,
            anchor: this.resolveAnchor(definition.anchor),
            mount: this.resolveMount(definition.mount),
            container: this.resolveContainer(definition.container),
            render: this.resolveRender(definition.render),
        }
    }

    protected resolveAnchor(
        anchor?: ContentScriptAnchor | ContentScriptAnchorGetter
    ): ContentScriptAnchorResolver {
        return contentScriptAnchorResolver(anchor);
    }

    protected resolveMount(
        mount?: ContentScriptMountFunction
    ): ContentScriptMountFunction {
        return mount || contentScriptMountAppendResolver();
    }

    protected resolveContainer(
        container?:
            ContentScriptContainerTag |
            ContentScriptContainerOptions |
            ContentScriptContainerFactory
    ): ContentScriptContainerCreator {
        return contentScriptContainerResolver(container);
    }

    protected resolveRender(
        render?: ContentScriptRenderValue | ContentScriptRenderHandler
    ): ContentScriptRenderHandler {
        return contentScriptRenderResolver(render);
    }

    public async build(): Promise<void> {
        await this.processing();

        await this.definition.main?.(this.context);
    }

    public async destroy(): Promise<void> {
        // Not implemented yet
    }

    protected async processing(): Promise<void> {
        const anchors = await this.definition.anchor();

        for await (const anchor of anchors) {
            this.context.add(await this.createNode(anchor));

            await this.cleanupNode(anchor);
        }

        this.context.mount();
    }
}