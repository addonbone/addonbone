import {customAlphabet} from "nanoid";

import {ContentScriptAnchor, ContentScriptAnchorGetter, ContentScriptAnchorResolver} from "@typing/content";

const generateId = customAlphabet('abcdefghijklmnopqrstuvwxyz', 7);

export const contentScriptAnchorAttribute = `data-${generateId()}`;

export const contentScriptAnchorResolver = (
    anchor?: ContentScriptAnchor | ContentScriptAnchorGetter
): ContentScriptAnchorResolver => async (): Promise<Element[]> => {
    const attr = contentScriptAnchorAttribute;

    let resolved = typeof anchor === "function" ? anchor() : anchor;

    if (resolved instanceof Promise) {
        resolved = await resolved;
    }

    if (resolved === undefined || resolved === null) {
        resolved = document.body;
    }

    const elements: Element[] = [];

    if (resolved instanceof Element) {
        if (!resolved.hasAttribute(attr)) {
            elements.push(resolved);
        }
    } else if (typeof resolved === "string") {
        if (resolved.startsWith('/')) {
            const notRegex = /not\(\s*[^)]+\s*\)/;
            const condition = `not(@${attr})`;

            if (notRegex.test(resolved)) {
                resolved = `(${resolved})[${condition}]`;
            }

            const result = document.evaluate(
                resolved,
                document,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null
            );

            for (let i = 0; i < result.snapshotLength; i++) {
                elements.push(result.snapshotItem(i) as Element);
            }
        } else {
            resolved += `:not([${attr}])`;

            elements.push(...Array.from(document.querySelectorAll(resolved)));
        }
    }

    return elements;
}