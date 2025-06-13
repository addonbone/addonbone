import {ReactNode as ReactComponent} from "react";
import {createRoot, Root} from "react-dom/client";

import {ContentScriptNode} from "@typing/content";

export default class implements ContentScriptNode {
    protected root?: Root;

    constructor(
        protected readonly node: ContentScriptNode,
        protected readonly component?: ReactComponent
    ) {
    }

    public get anchor(): Element {
        return this.node.anchor;
    }

    public get container(): Element | undefined {
        return this.node.container;
    }

    public mount(): void {
        this.node.mount();

        if (!this.container || this.root) {
            return;
        }

        if (!this.component) {
            console.warn('Content script react component is empty');

            return;
        }

        this.root = createRoot(this.container);

        this.root.render(this.component);
    }

    public unmount(): void {
        this.root?.unmount();
        this.root = undefined;

        this.node.unmount();
    }
}