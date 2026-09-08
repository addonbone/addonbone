export const isolation = "iframe";
export const frame = {page: "panel"};

export default function render() {
    return {ping: () => "pong"};
}
