import kebabCase from "just-kebab-case";
import {customAlphabet} from "nanoid";

import {getApp} from "@core/env";

import {ContentScriptNode} from "@typing/content";

const name = kebabCase(getApp());

export default class Node implements ContentScriptNode {
    private readonly _container?: Element;

    static readonly attribute: string = `data-${name}-id`;

    protected static generateId = customAlphabet('abcdefghijklmnopqrstuvwxyz', 7);

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
        let id = this.anchor.getAttribute(Node.attribute)

        if (typeof id !== "string" || id.length === 0) {
            id = Node.generateId();

            this.anchor.setAttribute(Node.attribute, id);
        }

        return id;
    }

    protected unmark(): void {
        this.anchor.setAttribute(Node.attribute, '');
    }
}