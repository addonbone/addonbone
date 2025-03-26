import ts from 'typescript';
import _ from 'lodash';

import SourceFile from "./SourceFile";

export default class<T extends Record<string, unknown>> extends SourceFile {
    protected definition = new Set<string>();

    protected properties = new Set<string>();

    public setDefinition(definition: string | string[]): this {
        if (_.isString(definition)) {
            definition = [definition];
        }

        definition.forEach(definition => this.definition.add(definition));

        return this;
    }

    public setProperties(properties: string[]): this {
        properties.forEach(property => this.properties.add(property));

        return this;
    }

    public getOptions(): T {
        return {...this.getOptionsFromVariables(), ...this.getOptionsFromDefinition()};
    }

    protected getOptionsFromVariables(): T {
        return Array.from(this.getVariables().values())
            .filter(({name, exported}) => exported && this.properties.has(name))
            .reduce((config, {name, value}) => ({...config, [name]: value}), {} as T);
    }

    protected getOptionsFromDefinition(): T {
        let options = {} as T;

        const parse = (node: ts.Node) => {
            if (ts.isExportAssignment(node)) {
                const expr = node.expression;

                if (ts.isCallExpression(expr) && ts.isIdentifier(expr.expression)) {
                    const functionName = expr.expression.text;

                    if (this.getImports().get(functionName) !== 'adnbn') {
                        console.warn(`Function ${functionName} is not imported from 'adnbn' on file ${this.file}`);

                        return;
                    }

                    if (this.definition.has(functionName) && expr.arguments.length > 0) {
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

        return _.pickBy(options, (_, key) => this.properties.has(key)) as T;
    }
}