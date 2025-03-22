import {
    contentScriptContainerResolver,
    contentScriptMountAppendResolver,
    contentScriptRenderResolver
} from "@client/content";

import Node from "./Node";
import ManagedContext from "./ManagedContext";

import {
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

    static make<T extends ContentScriptBuilder>(
        this: new (definition: ContentScriptDefinition) => T, definition: ContentScriptDefinition
    ): T {
        return new this(definition);
    }

    protected abstract createNode(anchor: Element): Promise<ContentScriptNode>;

    protected abstract cleanupNode(anchor: Element): Awaiter<void>;

    protected constructor(definition: ContentScriptDefinition) {
        this.definition = {
            ...definition,
            mount: this.resolveMount(definition.mount),
            container: this.resolveContainer(definition.container),
            render: this.resolveRender(definition.render),
        }
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

    protected async findAnchors(): Promise<Element[]> {
        const {anchor} = this.definition;
        const attribute = Node.attribute;

        let resolved = typeof anchor === "function" ? anchor() : anchor;

        if (resolved instanceof Promise) {
            resolved = await resolved;
        }

        if (resolved === undefined || resolved === null) {
            resolved = document.body;
        }

        const elements: Element[] = [];

        if (resolved instanceof Element) {
            if (!resolved.hasAttribute(attribute)) {
                elements.push(resolved);
            }
        } else if (typeof resolved === "string") {
            if (resolved.startsWith('/')) {
                const notRegex = /not\(\s*[^)]+\s*\)/;
                const condition = `not(@${attribute})`;

                if (notRegex.test(resolved)) {
                    resolved = `(${resolved})[${condition}]`;
                }

                const result = document.evaluate(
                    resolved,
                    document,
                    null,
                    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                    null
                );

                for (let i = 0; i < result.snapshotLength; i++) {
                    elements.push(result.snapshotItem(i) as Element);
                }
            } else {
                resolved += `:not([${attribute}])`;

                elements.push(...Array.from(document.querySelectorAll(resolved)));
            }
        }

        return elements;
    }

    public async build(): Promise<void> {
        await this.processing();

        await this.definition.main?.(this.context);
    }

    public async destroy(): Promise<void> {
       // Not implemented yet
    }

    protected async processing(): Promise<void> {
        const anchors = await this.findAnchors();

        for await (const anchor of anchors) {
            this.context.add(await this.createNode(anchor));

            await this.cleanupNode(anchor);
        }

        this.context.mount();
    }
}