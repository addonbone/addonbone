import {ContentScriptMountFunction, ContentScriptNode} from "@typing/content";

export default class implements ContentScriptNode {

    private unmounting?: () => void;

    constructor(protected node: ContentScriptNode, protected mounter?: ContentScriptMountFunction) {
    }

    public get anchor(): Element {
        return this.node.anchor;
    }

    public get container(): Element | undefined {
        return this.node.container;
    }

    public mount(): void {
        this.node.mount();

        if (!this.container) {
            return;
        }

        this.unmounting = this.mounter?.(this.anchor, this.container) || undefined;
    }

    public unmount(): void {
        this.unmounting?.();
        this.unmounting = undefined;

        this.node.unmount();
    }
}