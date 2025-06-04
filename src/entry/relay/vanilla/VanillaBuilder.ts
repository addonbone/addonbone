import Builder from "../core/Builder";

import VanillaBuilder from "../../content/vanilla/VanillaBuilder";

import {TransportType} from "@typing/transport";
import {RelayUnresolvedDefinition} from "@typing/relay";
import {ContentScriptBuilder} from "@typing/content";


export default class<T extends TransportType = TransportType> extends Builder<T> {
    constructor(definition: RelayUnresolvedDefinition<T>) {
        super(definition);
    }

    protected contentBuilder(): ContentScriptBuilder {
        const {main, ...options} = this.definition;

        return new VanillaBuilder(options);
    }
}