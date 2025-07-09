/**
 * Signature of a method parameter.
 */
export interface ParameterSignature {
    name: string;
    type: string;
    optional: boolean;
}

/**
 * Signature of a method.
 */
export interface MethodSignature {
    kind: "method";
    typeParameters: string[];
    parameters: ParameterSignature[];
    returnType: string;
}

/**
 * Signature of a property.
 */
export interface PropertySignature {
    kind: "property";
    type: string;
    optional?: boolean;
}

/**
 * Member of an interface: either a method or a property.
 */
export type MemberSignature = MethodSignature | PropertySignature;