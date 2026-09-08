import {ContentScriptIsolation, type ContentScriptDefinition, getPageUrl, defineRelay} from "adnbn";
const page: ContentScriptDefinition = {isolation: "iframe", frame: {page: "panel"}};
const frame: ContentScriptDefinition = {isolation: ContentScriptIsolation.Iframe, frame: {height: 200}, render: "UI"};
// @ts-expect-error frame requires iframe isolation
const noIsolation: ContentScriptDefinition = {frame: {page: "panel"}};
// @ts-expect-error embedded pages own their renderer
const render: ContentScriptDefinition = {isolation: "iframe", frame: {page: "panel"}, render: "UI"};
// @ts-expect-error frame source variants are mutually exclusive
const both: ContentScriptDefinition = {isolation: "iframe", frame: {page: "panel", src: "https://example.com"}};
// @ts-expect-error generated registry rejects an unknown page inside another public type
const unknown: ContentScriptDefinition = {isolation: "iframe", frame: {page: "missing"}};
// @ts-expect-error generated registry also narrows the getter
getPageUrl("missing");
void [page, frame, noIsolation, render, both, unknown];

defineRelay({isolation: "iframe", init: () => ({})});
defineRelay({isolation: "shadow", render: "UI", init: () => ({})});
defineRelay({isolation: "iframe", frame: {page: "panel"}, init: () => ({})});
// @ts-expect-error Relay frame requires iframe isolation
defineRelay({frame: {page: "panel"}, init: () => ({})});
// @ts-expect-error embedded Relay pages own their renderer
defineRelay({isolation: "iframe", frame: {page: "panel"}, render: "UI", init: () => ({})});
// @ts-expect-error Relay page/src variants are exclusive
defineRelay({isolation: "iframe", frame: {page: "panel", src: "https://example.com"}, init: () => ({})});
