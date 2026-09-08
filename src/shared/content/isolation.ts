import {ContentScriptIsolation, type ContentScriptFrame} from "@typing/content";

export const isContentScriptFrameNavigation = (frame?: ContentScriptFrame): boolean =>
    frame?.page !== undefined || frame?.src !== undefined;

/** Pure structural checks shared by CLI and runtime; no DOM or build dependencies. */
export const validateContentScriptIsolation = (isolation: unknown, frame: unknown, hasRender: boolean): void => {
    const mode = isolation ?? ContentScriptIsolation.None;
    if (!Object.values(ContentScriptIsolation).includes(mode as ContentScriptIsolation)) {
        throw new Error("isolation must be a statically known ContentScriptIsolation value: none, shadow or iframe");
    }
    if (frame !== undefined && mode !== ContentScriptIsolation.Iframe) {
        throw new Error("frame requires isolation: Iframe");
    }
    if (frame === undefined) return;
    if (!frame || typeof frame !== "object" || Array.isArray(frame)) {
        throw new Error("frame must be an object with statically known page/src properties");
    }
    const {page, src, width, height} = frame as Record<string, unknown>;
    if (page !== undefined && src !== undefined) throw new Error("frame.page and frame.src are mutually exclusive");
    if (page !== undefined && (typeof page !== "string" || !page.trim()))
        throw new Error("frame.page must be a statically known page alias");
    if (src !== undefined) {
        if (typeof src !== "string" || !/^(https?|chrome-extension|moz-extension):\/\//.test(src)) {
            throw new Error("frame.src must be an absolute HTTP(S) or extension URL");
        }
        try {
            new URL(src);
        } catch {
            throw new Error("frame.src must be a valid absolute URL");
        }
    }
    if ((page !== undefined || src !== undefined) && hasRender) {
        throw new Error(
            "frame.page/frame.src cannot be combined with render; the embedded page owns its UI and resources"
        );
    }
    for (const [name, value] of [
        ["width", width],
        ["height", height],
    ] as const) {
        if (
            value !== undefined &&
            !(
                (typeof value === "number" && Number.isFinite(value) && value >= 0) ||
                (typeof value === "string" && value.trim())
            )
        )
            throw new Error(`frame.${name} must be pixels or a CSS size`);
    }
    if (typeof height === "string" && height.trim().toLowerCase() === "auto") {
        throw new Error('frame.height: "auto" is not supported yet; specify an explicit height');
    }
};
