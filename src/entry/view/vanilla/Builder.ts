import Builder from "../core/Builder";

import {ViewConfig, ViewDefinition} from "@typing/view";

export default class<T extends ViewConfig> extends Builder<T> {
    protected container?: Element;

    public constructor(definition: ViewDefinition<T>) {
        super(definition);
    }

    public async build(): Promise<void> {
        await super.build();

        const props = this.getProps();

        const content = await this.definition.render(props);

        if (!content) {
            return;
        }

        this.container = await this.definition.container(props);

        if (!this.container) {
            return;
        }

        if (content instanceof Element) {
            this.container.appendChild(content);
        } else if (typeof content === "string" || typeof content === "number") {
            this.container.innerHTML = content.toString();
        } else {
            return;
        }

        document.body.prepend(this.container);
    }

    public async destroy(): Promise<void> {
        this.container?.remove();
        this.container = undefined;
    }
}