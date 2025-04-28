
export default class ServiceManager {
    private services = new Map<string, any>();

    private static instance: ServiceManager | null = null;

    public static getInstance(): ServiceManager {
        if (ServiceManager.instance === null) {
            ServiceManager.instance = new ServiceManager();
        }
        return ServiceManager.instance;
    }

    constructor() {
    }

    public add(name: string, instance: any) {
        this.services.set(name, instance);
    }

    public get(name: string): any | undefined {
        return this.services.get(name);
    }

    public has(name: string): boolean {
        return this.services.has(name);
    }

    public remove(name: string): any | undefined {
        const instance = this.get(name);
        this.services.delete(name);
        return instance;
    }

    public clear(): void {
        this.services.clear();
    }
}
