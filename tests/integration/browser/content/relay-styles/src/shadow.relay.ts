import {defineRelay} from "adnbn";
import {createPanel, createApi} from "./shared/panel";
let panel: HTMLElement | undefined;
const api = createApi(() => panel);
export default defineRelay({
    name: "shadowPanel",
    matches: ["http://127.0.0.1/*"],
    isolation: "shadow",
    init: () => ({ready: () => api.ready(), load: () => api.load()}),
    render: () => (panel = createPanel("shadow")),
});
