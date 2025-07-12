import ts from "typescript";
import SourceFile from "../SourceFile";
import AbstractParser from "./AbstractParser";
import {MemberSignature} from "./types";
import NodeFinder from "./NodeFinder";
import ClassParser from "./ClassParser";
import ObjectParser from "./ObjectParser";

/**
 * Parses function expressions and arrow functions.
 */
export default class FunctionParser extends AbstractParser {
    /**
     * Constructor for the FunctionParser.
     *
     * @param sourceFile The source file to parse
     * @param nodeFinder The node finder to use for finding nodes
     * @param objectParser The object parser to use for parsing object literals
     * @param classParser The class parser to use for parsing classes
     */
    constructor(
        sourceFile: SourceFile,
        private readonly nodeFinder: NodeFinder,
        private readonly objectParser: ObjectParser,
        private readonly classParser: ClassParser
    ) {
        super(sourceFile);
    }

    /**
     * Parses a function or arrow function: finds its return expression,
     * then parses that if it's an object literal or a class instantiation.
     *
     * @param fn The function expression or arrow function to parse
     * @returns A record of member signatures or undefined if the function cannot be parsed
     */
    public parse(fn: ts.FunctionExpression | ts.ArrowFunction): Record<string, MemberSignature> | undefined {
        let retExpr: ts.Expression | undefined;

        // block-bodied function
        if (ts.isBlock(fn.body)) {
            for (const stmt of fn.body.statements) {
                if (ts.isReturnStatement(stmt) && stmt.expression) {
                    retExpr = stmt.expression;
                    break;
                }
            }
        } else {
            // concise arrow
            retExpr = fn.body;
        }

        if (!retExpr) return undefined;

        // unwrap assertions, parentheses, wrapper calls
        const expr = this.unwrapExpression(retExpr);

        // object literal return
        if (ts.isObjectLiteralExpression(expr)) {
            return this.objectParser.parse(expr);
        }

        // class instance return: new ClassName(...) or inline class expression
        if (ts.isNewExpression(expr)) {
            const ctor = expr.expression;

            // external named class
            if (ts.isIdentifier(ctor)) {
                return this.classParser.parseFileClass(ctor.text);
            }

            // inline anonymous class expression
            if (ts.isClassExpression(ctor)) {
                return this.classParser.parse(ctor);
            }
        }

        // variable reference return: identifier pointing to object or class instance
        if (ts.isIdentifier(retExpr)) {
            const name = retExpr.text;
            const decl = this.nodeFinder.findVariableDeclaration(name);

            if (decl && decl.initializer) {
                const init = decl.initializer;

                if (ts.isObjectLiteralExpression(init)) {
                    return this.objectParser.parse(init);
                }

                if (ts.isNewExpression(init)) {
                    const ctor2 = init.expression;

                    if (ts.isIdentifier(ctor2)) {
                        return this.classParser.parseFileClass(ctor2.text);
                    }

                    if (ts.isClassExpression(ctor2)) {
                        return this.classParser.parse(ctor2);
                    }
                }
            }
        }

        return undefined;
    }
}
