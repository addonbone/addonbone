import RelayManager from "./RelayManager";
import BaseRelay from "./BaseRelay";

export default class RegisterRelay<T extends object, TArgs extends any[] = []> extends BaseRelay<T> {

    constructor(name: string, protected readonly init: (...args: TArgs) => T) {
        super(name)
    }

    public async register(...args: TArgs) {
        if (RelayManager.getInstance().has(this.name)) {
            throw new Error(`A relay with the name "${this.name}" already exists. The relay name must be unique.`);
        }
        RelayManager.getInstance().add(this.name, this.init(...args))
    }
}
