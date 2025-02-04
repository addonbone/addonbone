import {
    forEachChild,
    isCallExpression,
    isExportAssignment,
    isIdentifier,
    isObjectLiteralExpression,
    Node
} from 'typescript';

import SourceFile from "./SourceFile";

export default class<T extends Record<string, unknown>> extends SourceFile {
    protected definition?: string;

    protected properties: string[] = [];

    public setDefinition(definition: string): this {
        this.definition = definition;

        return this;
    }

    public setProperties(properties: string[]): this {
        this.properties = properties;

        return this;
    }

    public getOptions(): T {
        return {...this.getOptionsFromVariables(), ...this.getOptionsFromDefinition()};
    }

    protected getOptionsFromVariables(): T {
        return Array.from(this.getVariables().values())
            .filter(({name, exported}) => exported && this.properties.includes(name))
            .reduce((config, {name, value}) => ({...config, [name]: value}), {} as T);
    }

    protected getOptionsFromDefinition(): T {
        let options = {} as T;

        const parse = (node: Node) => {
            if (isExportAssignment(node)) {
                const expr = node.expression;

                if (isCallExpression(expr) && isIdentifier(expr.expression)) {
                    const functionName = expr.expression.text;

                    if (functionName === this.definition && expr.arguments.length > 0) {
                        const arg = expr.arguments[0];

                        if (isObjectLiteralExpression(arg)) {
                            options = this.parseNode(arg);
                        }
                    }
                }
            }

            forEachChild(node, parse);
        }

        parse(this.getSourceFile());

        return options;
    }
}