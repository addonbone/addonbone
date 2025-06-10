import Builder from "../core/Builder";

import VanillaBuilder from "../../view/vanilla/VanillaBuilder";

import {ViewBuilder} from "@typing/view";
import {TransportType} from "@typing/transport";
import {OffscreenUnresolvedDefinition} from "@typing/offscreen";


export default class<T extends TransportType = TransportType> extends Builder<T> {
    constructor(definition: OffscreenUnresolvedDefinition<T>) {
        super(definition);
    }

    protected viewBuilder(): ViewBuilder {
        const {main, ...options} = this.definition;

        return new VanillaBuilder(options);
    }
}