import {BackgroundDefinition} from "@typing/background";

export const handleBackground = (definition: BackgroundDefinition): void => {
    const {main, ...options} = definition;

    if (typeof main === 'function') {
        Promise.resolve(main(options)).catch((e) => {
            console.error('The background main function crashed:', e);
        });
    }
}