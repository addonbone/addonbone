//@ts-ignore
import {type BackgroundDefinition} from "adnbn";
//@ts-ignore
import {handleBackground} from "adnbn/client/background";

import * as module from "virtual:background-entrypoint";

try {
    const {default: defaultDefinition, ...otherDefinition} = module;

    let definition: BackgroundDefinition = otherDefinition;

    if (defaultDefinition && typeof defaultDefinition === 'object' && defaultDefinition.constructor === Object) {
        definition = {...definition, ...defaultDefinition};
    } else if (typeof defaultDefinition === 'function') {
        definition = {...definition, main: defaultDefinition};
    }

    const {main, ...options} = definition;

    handleBackground({main, ...options});
} catch (e) {
    console.error('The background crashed on startup:', e);
}
