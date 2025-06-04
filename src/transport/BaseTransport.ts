import type {TransportDictionary, TransportManager, TransportName} from "@typing/transport";

export default abstract class<
    N extends TransportName,
    T = TransportDictionary[N]
> {
    protected constructor(protected readonly name: N) {
    }

    protected abstract manager() : TransportManager;

    public get(): T {
        return this.manager().get(this.name);
    }

    public destroy(): void {
        this.manager().remove(this.name);
    }
}
