import OffscreenBridge from "./OffscreenBridge";

export default class extends OffscreenBridge {
    public build(): void {
        this.message.watch(this.key, this.apply.bind(this));
    }
}
