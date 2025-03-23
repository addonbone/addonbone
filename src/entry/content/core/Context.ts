import {ContentScriptContext, ContentScriptNode, ContentScriptNodeSet} from "@typing/content";

export default class implements ContentScriptContext {
    protected readonly collection: ContentScriptNodeSet = new Set();

    public get nodes(): ReadonlySet<ContentScriptNode> {
        return this.collection;
    }

    public mount(): void {
        for (const node of this.collection) {
            if (!node.anchor.isConnected) {
                node.unmount();

                this.collection.delete(node);

                continue;
            }

            node.mount();
        }
    }

    public unmount(): void {
        for (const node of this.collection) {
            node.unmount();

            if (!node.anchor.isConnected) {
                this.collection.delete(node);
            }
        }
    }
}