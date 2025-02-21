import ts from 'typescript';

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

        const parse = (node: ts.Node) => {
            if (ts.isExportAssignment(node)) {
                const expr = node.expression;

                if (ts.isCallExpression(expr) && ts.isIdentifier(expr.expression)) {
                    const functionName = expr.expression.text;

                    if (functionName === this.definition && expr.arguments.length > 0) {
                        const arg = expr.arguments[0];

                        if (ts.isObjectLiteralExpression(arg)) {
                            options = this.parseNode(arg);
                        }
                    }
                }
            }

            ts.forEachChild(node, parse);
        }

        parse(this.getSourceFile());

        return options;
    }
}