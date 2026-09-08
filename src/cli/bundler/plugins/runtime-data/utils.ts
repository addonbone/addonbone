/** Reject values JSON.stringify would silently omit, coerce, or evaluate through accessors/toJSON. */
export const serializeRuntimeData = (data: unknown, property: string): string => {
    const ancestors = new Set<object>();
    const invalid = (location: string, reason: string): never => {
        throw new Error(
            `RuntimeDataPlugin property ${JSON.stringify(property)} has invalid data at ${location}: ${reason}`
        );
    };

    const validate = (value: unknown, location: string): void => {
        if (value === null || typeof value === "string" || typeof value === "boolean") return;
        if (typeof value === "number" && Number.isFinite(value)) return;
        if (typeof value !== "object" || value === null) return invalid(location, "expected a JSON-compatible value");
        if (ancestors.has(value)) invalid(location, "circular reference");

        const array = Array.isArray(value);
        const prototype = Object.getPrototypeOf(value);
        if (array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null) {
            invalid(location, "expected a plain object or array");
        }

        ancestors.add(value);
        for (const key of Reflect.ownKeys(value)) {
            if (array && key === "length") continue;
            if (typeof key !== "string") return invalid(location, "symbol keys are not supported");
            if (array && !/^(0|[1-9]\d*)$/.test(key)) invalid(location, "named array properties are not supported");
            const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
            if (!descriptor.enumerable || !("value" in descriptor)) {
                invalid(location, "only enumerable data properties are supported");
            }
            validate(descriptor.value, `${location}[${JSON.stringify(key)}]`);
        }
        if (array && Object.keys(value).length !== value.length) invalid(location, "sparse arrays are not supported");
        ancestors.delete(value);
    };

    validate(data, "data");
    return JSON.stringify(data);
};
