import get from 'get-value'
import {WindowRelayManager} from "@typing/relay";

export default class RelayManager {
    private instances = new Map<string, any>();

    public static getInstance(): RelayManager {
        if (window[WindowRelayManager] === undefined) {
            window[WindowRelayManager] = new RelayManager();
        }
        return window[WindowRelayManager];
    }

    public getPropertyByPath(obj: object, key: string | string[], options?: get.Options): any {
        return get(obj, key, options)
    }

    public add(name: string, instance: any) {
        this.instances.set(name, instance);
    }

    public get(name: string): any | undefined {
        return this.instances.get(name);
    }

    public has(name: string): boolean {
        return this.instances.has(name);
    }

    public remove(name: string): any | undefined {
        const instance = this.get(name);
        this.instances.delete(name);
        return instance;
    }

    public clear(): void {
        this.instances.clear();
    }
}
