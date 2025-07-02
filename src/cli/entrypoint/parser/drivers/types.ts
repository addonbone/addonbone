export interface Variable {
    name: string;
    value: any;
    exported: boolean;
}

export interface Injector<T = any> {
    from: string;
    target: string;
    name: string;
    value: T;
}

export type VariableMap = Map<string, Variable>;

export type ImportMap = Map<string, string>;

export type EnumMap = Map<string, Map<string, string | number>>;
