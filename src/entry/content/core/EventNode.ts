import {ContentScriptEventEmitter, ContentScriptNode} from "@typing/content";

export default class implements ContentScriptNode {
    constructor(
        protected readonly node: ContentScriptNode,
        protected readonly emitter: ContentScriptEventEmitter,
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
        this.emitter.emitMount(this.node);
    }

    public unmount(): void {
        this.node.unmount();
        this.emitter.emitUnmount(this.node);
    }
}