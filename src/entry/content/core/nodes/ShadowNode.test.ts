import MountNode from "./MountNode";
import Node from "./Node";
import ShadowNode from "./ShadowNode";
import {getContentScriptStylesRuntime} from "./isolated-styles";
import type {ContentScriptStylesRuntime} from "@typing/content";

jest.mock("./isolated-styles", () => ({
    getContentScriptStylesRuntime: jest.fn(),
}));

const createNode = (runtime: ContentScriptStylesRuntime, host = document.createElement("section")) => {
    const anchor = document.createElement("div");
    document.body.appendChild(anchor);
    jest.mocked(getContentScriptStylesRuntime).mockReturnValue(runtime);

    return {
        anchor,
        host,
        node: new ShadowNode(
            new MountNode(new Node(anchor, host), (_anchor, container) => {
                anchor.appendChild(container);
            })
        ),
    };
};

describe("ShadowNode", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
        jest.clearAllMocks();
    });

    test("creates an open root, registers it with the styles runtime and exposes the render target", () => {
        const runtime: ContentScriptStylesRuntime = {
            initialize: jest.fn(),
            add: jest.fn(),
            delete: jest.fn(),
            load: jest.fn(async () => undefined),
        };
        const {host, node} = createNode(runtime);

        expect(node.mount()).toBe(true);
        expect(host.shadowRoot).not.toBeNull();
        expect(node.target).toBe(host.shadowRoot?.lastElementChild);
        expect(node.target).not.toBe(host);
        expect(runtime.add).toHaveBeenCalledWith(host.shadowRoot, node.target);
        expect(Array.from(host.shadowRoot?.children ?? []).map(element => element.tagName)).toEqual(["DIV"]);
    });

    test("unregisters the root before removing the host and creates a new root on remount", () => {
        const states: boolean[] = [];
        const runtime: ContentScriptStylesRuntime = {
            initialize: jest.fn(),
            add: jest.fn(),
            delete: jest.fn(root => states.push((root as ShadowRoot).host.isConnected)),
            load: jest.fn(async () => undefined),
        };
        const {anchor, node} = createNode(runtime);

        node.mount();
        const firstHost = node.container;
        const firstRoot = firstHost?.shadowRoot;

        expect(node.unmount()).toBe(true);
        expect(states).toEqual([true]);
        expect(firstHost?.isConnected).toBe(false);

        expect(node.mount()).toBe(true);
        expect(node.container).not.toBe(firstHost);
        expect(node.container?.shadowRoot).not.toBe(firstRoot);
        expect(node.target?.parentNode).toBe(node.container?.shadowRoot);
        expect(anchor.contains(node.container ?? null)).toBe(true);
        expect(runtime.add).toHaveBeenCalledTimes(2);
    });

    test("rejects a container with an existing open ShadowRoot", () => {
        const runtime: ContentScriptStylesRuntime = {
            initialize: jest.fn(),
            add: jest.fn(),
            delete: jest.fn(),
            load: jest.fn(async () => undefined),
        };
        const host = document.createElement("section");
        host.attachShadow({mode: "open"});
        const {node} = createNode(runtime, host);

        expect(() => node.mount()).toThrow("Content script container already has an open ShadowRoot");
        expect(runtime.add).not.toHaveBeenCalled();
    });
});
