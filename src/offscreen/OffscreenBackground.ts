import OffscreenBackgroundMessage from "./OffscreenBackgroundMessage";
import AbstractOffscreenBackground from "./AbstractOffscreenBackground";

export default class extends AbstractOffscreenBackground {
    public build(): void {
        OffscreenBackgroundMessage.getInstance().watch(this.addFrame);
    }
}
