import ts from "typescript";
import SourceFile from "../SourceFile";
import {MemberSignature} from "./types";

/**
 * Abstract base class for all expression parsers.
 */
export default abstract class AbstractParser {
    /**
     * Constructor for the parser.
     *
     * @param sourceFile The source file to parse
     */
    protected constructor(protected readonly sourceFile: SourceFile) {}

    /**
     * Parse a node and return a record of member signatures.
     *
     * @param node The node to parse
     * @returns A record of member signatures or undefined if the node cannot be parsed
     */
    abstract parse(node: ts.Node): Record<string, MemberSignature> | undefined;

    /**
     * Extracts a textual property name.
     *
     * @param name The property name node
     * @returns The extracted name as a string
     */
    public getName(name: ts.PropertyName | ts.BindingName | ts.Node): string {
        if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
            return name.text;
        }

        return name.getText();
    }

    /**
     * Unwraps an expression by removing type assertions, parentheses, etc.
     *
     * @param expr The expression to unwrap
     * @returns The unwrapped expression
     */
    public unwrapExpression(expr: ts.Expression): ts.Expression {
        // remove `as` and `satisfies` assertions, parentheses
        if (ts.isAsExpression(expr) || ts.isSatisfiesExpression(expr) || ts.isParenthesizedExpression(expr)) {
            return this.unwrapExpression(expr.expression as ts.Expression);
        }

        return expr;
    }
}
