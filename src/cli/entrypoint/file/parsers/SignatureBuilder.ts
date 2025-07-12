import ts from "typescript";
import {MemberSignature, MethodSignature, ParameterSignature} from "./types";
import TypeResolver from "./TypeResolver";

/**
 * Builds method and property signatures from TypeScript nodes.
 */
export default class SignatureBuilder {
    /**
     * Constructor for the SignatureBuilder.
     *
     * @param typeResolver The type resolver to use for resolving types
     */
    constructor(private readonly typeResolver: TypeResolver) {}

    /**
     * Builds a method signature from a function-like node.
     *
     * @param method The function-like node to build a signature from
     * @returns The method signature
     */
    public getMethodSignature(
        method: ts.MethodDeclaration | ts.GetAccessorDeclaration | ts.FunctionExpression | ts.ArrowFunction
    ): MethodSignature {
        // parameters
        const params: ParameterSignature[] = ("parameters" in method ? method.parameters : []).map(p => {
            const name = ts.isIdentifier(p.name) ? p.name.text : p.name.getText();
            const type = p.type ? this.typeResolver.resolveTypeNode(p.type) : "any";
            // Remove spaces in object types to match expected format
            const formattedType = type.replace(/\{\s+/g, "{").replace(/\s+\}/g, "}");
            const optional = p.questionToken !== undefined || p.initializer !== undefined;
            return {name, type: formattedType, optional};
        });

        // generic type parameters
        const typeParams: string[] = method.typeParameters ? method.typeParameters.map(tp => tp.getText()) : [];

        // return type (inline aliases when possible)
        const returnNode = (method as ts.MethodDeclaration).type;

        const returnType = returnNode ? this.typeResolver.resolveTypeNode(returnNode) : "any";
        // Remove spaces in object types to match expected format
        const formattedReturnType = returnType.replace(/\{\s+/g, "{").replace(/\s+\}/g, "}");

        return {
            kind: "method",
            typeParameters: typeParams,
            parameters: params,
            returnType: formattedReturnType,
        };
    }

    /**
     * Builds a function type string from a method signature.
     *
     * @param sig The method signature to build a function type from
     * @returns The function type as a string
     */
    public buildFunctionType(sig: MethodSignature): string {
        const params = sig.parameters.map(p => `${p.name}${p.optional ? "?" : ""}: ${p.type}`).join(", ");
        return `(${params}) => ${sig.returnType}`;
    }

    /**
     * Formats a record of member signatures into a string representation.
     *
     * @param members The record of member signatures to format
     * @returns The formatted members as a string
     */
    public formatMembers(members: Record<string, MemberSignature>): string {
        const parts: string[] = [];

        for (const [name, member] of Object.entries(members)) {
            if (member.kind === "method") {
                const typeParams = member.typeParameters.length ? `<${member.typeParameters.join(", ")}>` : "";
                const params = member.parameters.map(p => `${p.name}${p.optional ? "?" : ""}: ${p.type}`).join(", ");
                parts.push(`${name}${typeParams}(${params}): ${member.returnType};`);
            } else {
                parts.push(`${name}${member.optional ? "?" : ""}: ${member.type};`);
            }
        }

        return `{ ${parts.join(" ")} }`;
    }

    /**
     * Infers a type string from an expression.
     *
     * @param expr The expression to infer a type from
     * @param parseNode A function to parse a node into a value
     * @returns The inferred type as a string
     */
    inferTypeFromExpression(expr: ts.Expression, parseNode: (node: ts.Node) => any): string {
        const val = parseNode(expr);

        switch (typeof val) {
            case "string":
                return "string";
            case "number":
                return "number";
            case "boolean":
                return "boolean";
            case "object":
                if (val === null) return "null";
                if (Array.isArray(val)) return "array";
                return "object";
            default:
                return "any";
        }
    }
}
