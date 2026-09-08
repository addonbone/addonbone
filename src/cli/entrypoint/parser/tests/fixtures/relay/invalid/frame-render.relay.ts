export const isolation = "iframe";
export const frame = {page: "panel"};
export function render() {
    return "UI";
}
export default () => ({ping: () => "pong"});
