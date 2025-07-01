import ts from "typescript";
import _ from "lodash";

import SourceFile from "./SourceFile";

import {PackageName} from "@typing/app";

export default class<T extends Record<string, any>> extends SourceFile {
    protected definitions = new Set<string>();

    protected definition: string | null | undefined = undefined;

    protected properties = new Set<string>();

    public setDefinition(definition: string | string[]): this {
        if (_.isString(definition)) {
            definition = [definition];
        }

        definition.forEach(definition => this.definitions.add(definition));

        return this;
    }

    public setProperties(properties: string[]): this {
        properties.forEach(property => this.properties.add(property));

        return this;
    }

    public getOptions(): T {
        return {...this.getOptionsFromVariables(), ...this.getOptionsFromDefinition()};
    }

    public getDefinition(): string | undefined {
        if (this.definition === undefined) {
            this.getOptionsFromDefinition();
        }

        if (this.definition === null) {
            return;
        }

        return this.definition;
    }

    protected getOptionsFromVariables(): T {
        const options = Array.from(this.getVariables().values())
            .filter(({name, exported}) => exported && this.properties.has(name))
            .reduce((config, {name, value}) => ({...config, [name]: value}), {});

        return options as T;
    }

    protected getOptionsFromDefinition(): T {
        let options = {} as T;

        const parse = (node: ts.Node) => {
            if (ts.isExportAssignment(node)) {
                const expr = this.getExpressionForOptions(node.expression);

                if (expr) {
                    options = this.parseNode(expr);
                }
            }

            ts.forEachChild(node, parse);
        };

        parse(this.getSourceFile());

        return _.pickBy(options, (_, key) => this.properties.has(key)) as T;
    }

    protected getExpressionForOptions(expr: ts.Expression): ts.Expression | undefined {
        this.definition = null;

        if (ts.isObjectLiteralExpression(expr)) {
            return expr;
        } else if (
            (ts.isAsExpression(expr) || ts.isSatisfiesExpression(expr)) &&
            ts.isObjectLiteralExpression(expr.expression)
        ) {
            return expr.expression;
        } else if (ts.isCallExpression(expr) && ts.isIdentifier(expr.expression)) {
            const functionName = expr.expression.text;

            if (this.getImports().get(functionName) !== PackageName) {
                console.warn(`Function ${functionName} is not imported from '${PackageName}' on file ${this.file}`);

                return;
            }

            if (this.definitions.has(functionName) && expr.arguments.length > 0) {
                const arg = expr.arguments[0];

                if (ts.isObjectLiteralExpression(arg)) {
                    this.definition = functionName;

                    return arg;
                }
            }
        }
    }
}
