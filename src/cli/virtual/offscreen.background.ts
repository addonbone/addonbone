// @ts-ignore
import {OffscreenBackground} from "adnbn/offscreen";

try {
    new OffscreenBackground().build();
} catch (e) {
    console.error("Failed to build offscreen layer on background:", e);
}
