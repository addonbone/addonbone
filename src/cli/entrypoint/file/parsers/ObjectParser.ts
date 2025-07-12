import ts from "typescript";
import SourceFile from "../SourceFile";
import AbstractParser from "./AbstractParser";
import {MemberSignature} from "./types";
import SignatureBuilder from "./SignatureBuilder";

/**
 * Parses object literal expressions.
 */
export default class ObjectParser extends AbstractParser {
    /**
     * Constructor for the ObjectParser.
     *
     * @param sourceFile The source file to parse
     * @param signatureBuilder The signature builder to use for building signatures
     */
    constructor(
        sourceFile: SourceFile,
        private readonly signatureBuilder: SignatureBuilder
    ) {
        super(sourceFile);
    }

    /**
     * Parses an object literal: each property becomes a member signature.
     *
     * @param obj The object literal expression to parse
     * @returns A record of member signatures
     */
    public parse(obj: ts.ObjectLiteralExpression): Record<string, MemberSignature> {
        const result: Record<string, MemberSignature> = {};

        for (const prop of obj.properties) {
            // key name helper
            const key = this.getName(prop.name ?? prop);

            if (ts.isPropertyAssignment(prop)) {
                const init = prop.initializer;
                if (ts.isFunctionExpression(init) || ts.isArrowFunction(init)) {
                    result[key] = this.signatureBuilder.getMethodSignature(init);
                } else {
                    result[key] = {
                        kind: "property",
                        type: this.inferTypeFromExpression(init),
                    };
                }
            } else if (ts.isMethodDeclaration(prop)) {
                result[key] = this.signatureBuilder.getMethodSignature(prop);
            } else if (ts.isShorthandPropertyAssignment(prop)) {
                const name = prop.name.text;
                const variable = this.sourceFile.getVariables().get(name);
                const val = variable ? variable.value : undefined;

                let type = "any";
                if (val !== undefined) {
                    if (typeof val === "string") {
                        type = "string";
                    } else if (typeof val === "number") {
                        type = "number";
                    } else if (typeof val === "boolean") {
                        type = "boolean";
                    } else if (Array.isArray(val)) {
                        type = "array";
                    } else if (typeof val === "object") {
                        type = "object";
                    }
                }

                result[key] = {kind: "property", type};
            }
        }

        return result;
    }

    /**
     * Infers a type string from an expression.
     *
     * @param expr The expression to infer a type from
     * @returns The inferred type as a string
     */
    public inferTypeFromExpression(expr: ts.Expression): string {
        const val = this.sourceFile.parseNode(expr);

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
