import NameGenerator from "./NameGenerator";

export default class extends NameGenerator {
    public name(name: string): string {
        let entryName = name;
        let counter = 1;

        while (this.has(entryName)) {
            entryName = `${name}${counter}`;
            counter++;
        }

        this.names.add(entryName);

        return entryName;
    }

    public likely(name?: string): boolean {
        if(!name) {
            return false;
        }

        return name === this.entrypoint || /^.*[1-9]$/.test(name);
    }
}