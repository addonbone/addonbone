//@ts-ignore
import {type BackgroundDefinition} from "adnbn";
//@ts-ignore
import background, {isValidBackgroundDefinition, isValidBackgroundMainHandler} from "adnbn/entry/background";

import * as module from "virtual:background-entrypoint";

try {
    const {default: defaultDefinition, ...otherDefinition} = module;

    let definition: BackgroundDefinition = otherDefinition;

    if (isValidBackgroundDefinition(defaultDefinition)) {
        definition = {...definition, ...defaultDefinition};
    } else if (isValidBackgroundMainHandler(defaultDefinition)) {
        definition = {...definition, main: defaultDefinition};
    }

    const {main, ...options} = definition;

    background({main, ...options});
} catch (e) {
    console.error('The background crashed on startup:', e);
}
