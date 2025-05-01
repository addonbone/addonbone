import {isAvailableScripting} from "@browser/scripting";
import RelayManager from "./RelayManager";

export default class BaseRelay<ReturnGet> {

    constructor(protected readonly name: string){
    }

    public getOrigin(): ReturnGet {
        if(isAvailableScripting()){
            throw new Error(`Relay "${this.name}" can be getting only from content script`);
        }
        return RelayManager.getInstance().get(this.name);
    }
}
