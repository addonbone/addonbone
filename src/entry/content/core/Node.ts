import {customAlphabet} from "nanoid";

import {contentScriptAnchorAttribute} from "./resolvers/anchor";

import {ContentScriptNode} from "@typing/content";

const generateId = customAlphabet('abcdefghijklmnopqrstuvwxyz', 7);

export default class implements ContentScriptNode {
    private readonly _container?: Element;

    private readonly attr = contentScriptAnchorAttribute;

    constructor(public readonly anchor: Element, public container?: Element) {
        if (this.container) {
            this._container = this.container.cloneNode(false) as Element;
        }
    }

    public mount(): void {
        const id = this.mark();

        if (!this.container && this._container) {
            this.container = this._container.cloneNode(false) as Element;
        }

        this.container?.setAttribute('id', id);
    }

    public unmount(): void {
        this.unmark();

        if (this.container) {
            this.container.remove();
            this.container = undefined;
        }
    }

    protected mark(): string {
        let id = this.anchor.getAttribute(this.attr)

        if (typeof id !== "string" || id.length === 0) {
            id = generateId();

            this.anchor.setAttribute(this.attr, id);
        }

        return id;
    }

    protected unmark(): void {
        this.anchor.setAttribute(this.attr, '');
    }
}