import Builder from "../core/Builder";

import {ViewConfig, ViewDefinition} from "@typing/view";

export default class<T extends ViewConfig> extends Builder<T> {
    protected container?: Element;

    public constructor(definition: ViewDefinition<T>) {
        super(definition);
    }

    public async build(): Promise<void> {
        const props = this.getProps();

        this.container = await this.definition.container(props);

        if (!this.container) {
            return;
        }

        const content = await this.definition.render(props);

        if (!content) {
            return;
        }

        if (content instanceof Element) {
            this.container.appendChild(content);
        } else if (typeof content === "string" || typeof content === "number") {
            this.container.innerHTML = content.toString();
        }
    }

    public async destroy(): Promise<void> {
        this.container?.remove();
    }
}