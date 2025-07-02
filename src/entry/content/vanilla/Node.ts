import {ContentScriptNode} from "@typing/content";

export default class implements ContentScriptNode {
    private mounted: boolean = false;

    constructor(
        protected readonly node: ContentScriptNode,
        protected readonly value?: null | boolean | string | number | Element
    ) {}

    public get anchor(): Element {
        return this.node.anchor;
    }

    public get container(): Element | undefined {
        return this.node.container;
    }

    public mount(): void {
        this.node.mount();

        if (!this.container || this.mounted) {
            return;
        }

        if (this.value instanceof Element) {
            this.container.appendChild(this.value);
        } else if (typeof this.value === "string" || typeof this.value === "number") {
            this.container.textContent = String(this.value);
        } else if (this.value === null || this.value === undefined) {
            console.warn("Content script vanilla value is empty");
        }

        this.mounted = true;
    }

    public unmount(): void {
        this.node.unmount();

        this.mounted = false;
    }
}
