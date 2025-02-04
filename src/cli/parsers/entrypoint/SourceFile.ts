import {
    ArrayLiteralExpression,
    createSourceFile,
    forEachChild,
    Identifier,
    isComputedPropertyName,
    isEnumDeclaration,
    isExportAssignment,
    isExportDeclaration,
    isIdentifier,
    isImportDeclaration,
    isNamedExports,
    isNamedImports,
    isPropertyAccessExpression,
    isPropertyAssignment,
    isShorthandPropertyAssignment,
    isVariableStatement,
    Node,
    NumericLiteral,
    ObjectLiteralExpression,
    PropertyAssignment,
    ScriptTarget,
    SourceFile,
    StringLiteral,
    SyntaxKind
} from 'typescript';
import {readFileSync} from 'fs';
import path from "path";


export interface Variable {
    name: string;
    value: any;
    exported: boolean;
}

export type VariableMap = Map<string, Variable>;

export type ImportMap = Map<string, string>;

export type EnumMap = Map<string, Map<string, string | number>>;

export default class EntryFile {
    private sourceFile?: SourceFile;

    private variables?: VariableMap;

    private imports?: ImportMap;

    private enums?: EnumMap;

    public static make<T extends EntryFile>(this: new (file: string) => T, file: string): T {
        return new this(file);
    }

    constructor(protected readonly file: string) {
    }

    public getSourceFile(): SourceFile {
        if (this.sourceFile) {
            return this.sourceFile;
        }

        const sourceCode = readFileSync(this.file, 'utf8');

        return this.sourceFile = createSourceFile(
            this.file,
            sourceCode,
            ScriptTarget.ESNext,
            true
        );
    }

    public getImports(): ImportMap {
        if (this.imports) {
            return this.imports;
        }

        this.imports = new Map();

        const parse = (node: Node) => {
            if (isImportDeclaration(node) && node.moduleSpecifier) {
                const importPath = (node.moduleSpecifier as StringLiteral).text;

                if (node.importClause && node.importClause.namedBindings && isNamedImports(node.importClause.namedBindings)) {
                    node.importClause.namedBindings.elements.forEach(el => {
                        this.imports?.set(el.name.text, path.resolve(path.dirname(this.file), importPath + '.ts'));
                    });
                }
            }

            forEachChild(node, parse);
        }

        parse(this.getSourceFile());

        return this.imports;
    }

    public getEnums(): EnumMap {
        if (this.enums) {
            return this.enums;
        }

        this.enums = new Map();

        const parse = (node: Node) => {
            if (isEnumDeclaration(node)) {
                const enumName = node.name.text;
                const enumProperties: Map<string, string | number> = new Map();

                node.members.forEach(member => {
                    const key = member.name.getText();
                    const value = member.initializer ? member.initializer.getText().replace(/['"]/g, '') : key;

                    enumProperties.set(key, value);
                });

                this.enums?.set(enumName, enumProperties);
            }

            forEachChild(node, parse);
        }

        parse(this.getSourceFile());

        return this.enums;
    }

    public getVariables(): VariableMap {
        if (this.variables) {
            return this.variables;
        }

        this.variables = new Map();

        const parse = (node: Node) => {
            if (isVariableStatement(node)) {
                const isExported = node.modifiers?.some(modifier => modifier.kind === SyntaxKind.ExportKeyword);

                node.declarationList.declarations.forEach(declaration => {
                    if (isIdentifier(declaration.name) && declaration.initializer) {
                        const name = declaration.name.text;
                        const value = this.parseNode(declaration.initializer);

                        this.variables?.set(name, {
                            name,
                            value,
                            exported: isExported || false
                        });
                    }
                });
            }

            if (isExportDeclaration(node) && node.exportClause && isNamedExports(node.exportClause)) {
                node.exportClause.elements.forEach(el => {
                    const name = el.name.text;

                    if (this.variables?.has(name)) {
                        const variable = this.variables?.get(name) as Variable;

                        this.variables?.set(name, {
                            name,
                            value: variable.value,
                            exported: true
                        });
                    }
                });
            }

            if (isExportAssignment(node)) {
                const expr = node.expression;
                if (isIdentifier(expr) && this.variables?.has(expr.text)) {
                    const variable = this.variables?.get(expr.text) as Variable;
                    const name = "default";

                    this.variables?.set(name, {
                        name,
                        value: variable.value,
                        exported: true
                    });
                }
            }

            forEachChild(node, parse);
        };

        parse(this.getSourceFile());

        return this.variables;
    }

    protected findPropertyAccessValue(property: Node): any {
        if (isPropertyAccessExpression(property)) {
            const objectName = property.expression.getText();
            const propertyName = property.name.getText();

            const varItem = this.getVariables().get(objectName);

            if (varItem) {
                return varItem.value;
            }

            const enumItem = this.getEnums().get(objectName);

            if (enumItem) {
                return enumItem.get(propertyName);
            }

            const importItem = this.getImports().get(objectName);

            if (importItem) {
                return EntryFile.make(importItem).findPropertyAccessValue(property);
            }

            return `${objectName}.${propertyName}`;
        }

        return undefined;
    }

    protected parseNode(node?: Node): any {
        if (!node) {
            return undefined;
        }

        switch (node.kind) {
            case SyntaxKind.StringLiteral:
                return (node as StringLiteral).text;
            case SyntaxKind.TrueKeyword:
                return true;
            case SyntaxKind.FalseKeyword:
                return false;
            case SyntaxKind.NullKeyword:
                return null;
            case SyntaxKind.NumericLiteral:
                return parseFloat((node as NumericLiteral).text);
            case SyntaxKind.Identifier:
                return this.variables?.get((node as Identifier).text)?.value ?? (node as Identifier).text;
            case SyntaxKind.ArrayLiteralExpression:
                return (node as ArrayLiteralExpression).elements.map(element =>
                    this.parseNode(element)
                );
            case SyntaxKind.ObjectLiteralExpression:
                return (node as ObjectLiteralExpression).properties
                    .filter(
                        (property): property is PropertyAssignment =>
                            isPropertyAssignment(property) || isShorthandPropertyAssignment(property)
                    )
                    .reduce((acc, property) => {
                        if (isComputedPropertyName(property.name)) {
                            return acc;
                        }

                        const key = (property.name as Identifier | StringLiteral).text;
                        let value = this.parseNode(property.initializer);

                        if (typeof value === 'string' && this.variables?.has(value)) {
                            value = this.variables?.get(value)?.value;
                        }

                        acc[key] = value;

                        return acc;
                    }, {} as Record<string, any>);
            case SyntaxKind.PropertyAccessExpression: {
                return this.findPropertyAccessValue(node);
            }
            default:
                return undefined;
        }
    }
}