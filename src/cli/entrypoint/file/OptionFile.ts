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

    /** Presence is distinct from a statically evaluated value (for example a render method). */
    public getDeclaredProperties(): Set<string> {
        const names = new Set(
            Array.from(this.getVariables().values())
                .filter(item => item.exported)
                .map(item => item.name)
        );
        for (const statement of this.getSourceFile().statements) {
            if (
                ts.isFunctionDeclaration(statement) &&
                statement.name &&
                statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword) &&
                !statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword)
            ) {
                names.add(statement.name.text);
            }
            if (!ts.isExportAssignment(statement)) continue;
            const expression = this.getExpressionForOptions(statement.expression);
            if (!expression || !ts.isObjectLiteralExpression(expression)) continue;
            for (const property of expression.properties) {
                if (property.name && !ts.isComputedPropertyName(property.name))
                    names.add(property.name.getText().replace(/^["']|["']$/g, ""));
            }
        }
        return names;
    }

    /** Returns the authored expression without confusing unresolved identifiers with string literals. */
    public getPropertyExpression(name: string): ts.Expression | undefined {
        let result: ts.Expression | undefined;
        for (const statement of this.getSourceFile().statements) {
            if (
                ts.isVariableStatement(statement) &&
                statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)
            ) {
                const declaration = statement.declarationList.declarations.find(item => item.name.getText() === name);
                if (declaration) result = declaration.initializer;
            }
            if (!ts.isExportAssignment(statement)) continue;
            const expression = this.getExpressionForOptions(statement.expression);
            if (!expression || !ts.isObjectLiteralExpression(expression)) continue;
            const property = expression.properties.find(
                item =>
                    item.name &&
                    !ts.isComputedPropertyName(item.name) &&
                    item.name.getText().replace(/^["']|["']$/g, "") === name
            );
            if (property && ts.isPropertyAssignment(property)) result = property.initializer;
            else if (property && ts.isShorthandPropertyAssignment(property)) result = property.name;
        }
        const seen = new Set<string>();
        while (result && ts.isIdentifier(result) && !seen.has(result.text)) {
            const name = result.text;
            seen.add(name);
            const declaration = this.getSourceFile()
                .statements.filter(ts.isVariableStatement)
                .flatMap(statement => Array.from(statement.declarationList.declarations))
                .find(item => item.name.getText() === name);
            if (!declaration?.initializer) break;
            result = declaration.initializer;
        }
        return result;
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
