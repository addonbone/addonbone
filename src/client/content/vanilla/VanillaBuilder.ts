import MountBuilder from "../core/MountBuilder";

import VanillaNode from "./VanillaNode";

import {ContentScriptNode, ContentScriptResolvedDefinition} from "@typing/content";

export default class VanillaBuilder extends MountBuilder {
    public constructor(definition: ContentScriptResolvedDefinition) {
        super(definition);
    }

    protected async createNode(anchor: Element): Promise<ContentScriptNode> {
        let value = await this.getValue(anchor);

        if (typeof value === "function") {
            value = undefined;

            console.warn("Content script vanilla value is a function, expected Element, string or number");
        }

        return new VanillaNode(await super.createNode(anchor), value);
    }
}