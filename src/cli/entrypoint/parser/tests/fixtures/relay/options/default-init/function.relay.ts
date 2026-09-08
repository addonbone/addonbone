export const isolation = "iframe";
export const frame = {page: "panel"};

export default function init() {
    return {ping: () => "pong"};
}
