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
    ContentScriptDefinition,
    ContentScriptMountFunction,
    ContentScriptNode,
    ContentScriptRenderHandler,
    ContentScriptResolvedDefinition
} from "@typing/content";

import {Awaiter} from "@typing/helpers";

export default abstract class implements ContentScriptBuilder {
    protected context = new ManagedContext();

    static make<T extends ContentScriptBuilder>(
        this: new (definition: ContentScriptResolvedDefinition) => T, definition: ContentScriptDefinition
    ): T {
        return new this({
            ...definition,
            get mount(): ContentScriptMountFunction {
                return definition.mount || contentScriptMountAppendResolver();
            },
            get container(): ContentScriptContainerCreator {
                return contentScriptContainerResolver(definition.container);
            },
            get render(): ContentScriptRenderHandler {
                return contentScriptRenderResolver(definition.render);
            }
        });
    }

    protected abstract createNode(anchor: Element): Promise<ContentScriptNode>;

    protected abstract cleanupNode(anchor: Element): Awaiter<void>;

    protected constructor(protected readonly definition: ContentScriptResolvedDefinition) {

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

    protected async processing(): Promise<void> {
        const anchors = await this.findAnchors();

        for await (const anchor of anchors) {
            this.context.add(await this.createNode(anchor));

            await this.cleanupNode(anchor);
        }

        this.context.mount();
    }
}