import {isValidContentScriptRenderValue} from "@client/content";

import MountBuilder from "../core/MountBuilder";
import VanillaNode from "./VanillaNode";

import {ContentScriptDefinition, ContentScriptNode} from "@typing/content";


export default class VanillaBuilder extends MountBuilder {
    public constructor(definition: ContentScriptDefinition) {
        super(definition);
    }

    protected async createNode(anchor: Element): Promise<ContentScriptNode> {
        let value = await this.getValue(anchor);

        if (!isValidContentScriptRenderValue(value)) {
            value = undefined;

            console.warn("Content script vanilla value is not a valid render value");
        }

        return new VanillaNode(await super.createNode(anchor), value);
    }
}