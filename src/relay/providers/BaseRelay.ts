import {isAvailableScripting} from "@browser/scripting";
import RelayManager from "../RelayManager";

import {RelayDictionary, RelayManager as RelayManagerContract, RelayName} from "@typing/relay";

export default class<N extends RelayName, T = RelayDictionary[N]> {
    constructor(protected readonly name: N){
    }

    protected get manager(): RelayManagerContract {
        return RelayManager.getInstance();
    }

    public get(): T {
        if(isAvailableScripting()){
            throw new Error(`Relay "${this.name}" can be getting only from content script`);
        }

        return this.manager.get(this.name);
    }

    public destroy(): void {
        this.manager.remove(this.name);
    }
}
