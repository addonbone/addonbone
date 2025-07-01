import OffscreenBackgroundMessage from "./OffscreenBackgroundMessage";

type CreateParameters = chrome.offscreen.CreateParameters;

export default class {
    protected message = new OffscreenBackgroundMessage();

    public build(): void {
        this.message.watch(this.handler);
    }

    private handler({url}: CreateParameters): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (document.querySelector(`iframe[src="${url}"]`)) {
                return resolve();
            }

            const iframe = document.createElement("iframe");

            iframe.src = url;
            iframe.onload = () => resolve();
            iframe.onerror = () => reject();

            document.body.appendChild(iframe);
        });
    }
}
