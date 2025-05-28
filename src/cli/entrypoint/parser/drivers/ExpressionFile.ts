import ts from 'typescript';

import SourceFile from './SourceFile';

import {PackageName} from '@typing/app';

/**
 * Signatures for function/method parameters.
 */
export interface ParameterSignature {
    name: string;
    type: string;
}

/**
 * Signature of a method: parameters and return type.
 */
export interface MethodSignature {
    kind: 'method';
    /** method type parameters, e.g. ['T'] for fetchData<T> */
    typeParameters: string[];
    parameters: ParameterSignature[];
    returnType: string;
}

/**
 * Signature of a property: its type.
 */
export interface PropertySignature {
    kind: 'property';
    type: string;
}

/**
 * Member of an interface: either a method or a property.
 */
export type MemberSignature = MethodSignature | PropertySignature;

/**
 * Parses a TypeScript expression (object literal, function, or class)
 * and builds a full interface of its public members (methods and properties).
 */
export default class ExpressionFile extends SourceFile {
    protected property?: string;
    /**
     * Names of wrapper functions whose first argument should be unwrapped for parsing.
     */
    protected definition = new Set<string>();

    public getType(): string | undefined {
        // If a specific variable or property is requested, extract its type
        if (this.property) {
            // 1) Named variable scenario: e.g. export const init = () => ...
            const varDecl = this.findVariableDeclaration(this.property);

            if (varDecl && varDecl.initializer) {
                return this.getTypeFromInitializer(varDecl.initializer);
            }

            // 2) Property on default export object: unwrap and look up key
            let exportExpr: ts.Expression | undefined;
            const sf = this.getSourceFile();

            const findExport = (node: ts.Node) => {
                if (ts.isExportAssignment(node)) {
                    exportExpr = node.expression;
                }
                ts.forEachChild(node, findExport);
            };

            findExport(sf);

            if (!exportExpr) return undefined;

            const expr = this.unwrapExpression(exportExpr);

            if (ts.isObjectLiteralExpression(expr)) {
                for (const prop of expr.properties) {
                    const key = this.getName(prop.name ?? prop);

                    if (key !== this.property) continue;

                    if (ts.isPropertyAssignment(prop)) {
                        return this.getTypeFromInitializer(prop.initializer);
                    } else if (ts.isMethodDeclaration(prop) || ts.isGetAccessorDeclaration(prop)) {
                        const sig = this.getMethodSignature(prop as ts.MethodDeclaration);

                        return this.buildFunctionType(sig);
                    } else if (ts.isShorthandPropertyAssignment(prop)) {
                        const name = prop.name.text;
                        const variable = this.getVariables().get(name);

                        if (variable) {
                            const val = variable.value;
                            switch (typeof val) {
                                case 'string':
                                    return 'string';
                                case 'number':
                                    return 'number';
                                case 'boolean':
                                    return 'boolean';
                                case 'object':
                                    if (val === null) return 'null';
                                    if (Array.isArray(val)) return 'array';
                                    return 'object';
                                default:
                                    return 'any';
                            }
                        }
                        return 'any';
                    }
                }
                return undefined;
            }

            // Fallback: treat default export expression as initializer
            return this.getTypeFromInitializer(expr);
        }

        // Default: parse full default export into interface-like string
        let members: Record<string, MemberSignature> | undefined;
        const sf = this.getSourceFile();

        const collect = (node: ts.Node) => {
            if (ts.isExportAssignment(node)) {
                const expr0 = node.expression;
                const expr = this.unwrapExpression(expr0);
                const parsed = this.parse(expr);
                if (parsed) members = parsed;
            }
            ts.forEachChild(node, collect);
        };

        collect(sf);
        if (!members) return undefined;
        return this.formatMembers(members);
    }

    public setProperty(property: string): this {
        this.property = property;

        return this;
    }

    /**
     * Entry point: accepts an expression and returns a map of member signatures,
     * or undefined if the expression cannot be parsed.
     */
    protected parse(expr: ts.Expression): Record<string, MemberSignature> | undefined {
        if (ts.isFunctionExpression(expr) || ts.isArrowFunction(expr)) {
            return this.parseFunction(expr);
        } else if (ts.isObjectLiteralExpression(expr)) {
            return this.parseObject(expr);
        } else if (ts.isClassExpression(expr)) {
            return this.parseClass(expr);
        }

        return undefined;
    }

    /**
     * Parses a function or arrow function: finds its return expression,
     * then parses that if it's an object literal or a class instantiation.
     */
    protected parseFunction(fn: ts.FunctionExpression | ts.ArrowFunction): Record<string, MemberSignature> | undefined {
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
            return this.parseObject(expr);
        }

        // class instance return: new ClassName(...) or inline class expression
        if (ts.isNewExpression(expr)) {
            const ctor = expr.expression;

            // external named class
            if (ts.isIdentifier(ctor)) {
                return this.parseFileClass(ctor.text);
            }

            // inline anonymous class expression
            if (ts.isClassExpression(ctor)) {
                return this.parseClass(ctor);
            }
        }
        // variable reference return: identifier pointing to object or class instance
        if (ts.isIdentifier(retExpr)) {
            const name = retExpr.text;
            const decl = this.findVariableDeclaration(name);

            if (decl && decl.initializer) {
                const init = decl.initializer;

                if (ts.isObjectLiteralExpression(init)) {
                    return this.parseObject(init);
                }

                if (ts.isNewExpression(init)) {
                    const ctor2 = init.expression;

                    if (ts.isIdentifier(ctor2)) {
                        return this.parseFileClass(ctor2.text);
                    }

                    if (ts.isClassExpression(ctor2)) {
                        return this.parseClass(ctor2);
                    }
                }
            }
        }

        return undefined;
    }

    /**
     * Parses an object literal: each property becomes a member signature.
     */
    protected parseObject(obj: ts.ObjectLiteralExpression): Record<string, MemberSignature> {
        const result: Record<string, MemberSignature> = {};

        for (const prop of obj.properties) {
            // key name helper
            const key = this.getName(prop.name ?? prop);

            if (ts.isPropertyAssignment(prop)) {
                const init = prop.initializer;
                if (ts.isFunctionExpression(init) || ts.isArrowFunction(init)) {
                    result[key] = this.getMethodSignature(init);
                } else {
                    result[key] = {kind: 'property', type: this.inferTypeFromExpression(init)};
                }
            } else if (ts.isMethodDeclaration(prop)) {
                result[key] = this.getMethodSignature(prop);
            } else if (ts.isShorthandPropertyAssignment(prop)) {
                const name = prop.name.text;
                const variable = this.getVariables().get(name);
                const val = variable ? variable.value : undefined;
                const type = val === undefined ? 'any' :
                    typeof val === 'string' ? 'string' :
                        typeof val === 'number' ? 'number' :
                            typeof val === 'boolean' ? 'boolean' :
                                Array.isArray(val) ? 'array' :
                                    typeof val === 'object' ? 'object' : 'any';

                result[key] = {kind: 'property', type};
            }
        }

        return result;
    }

    /**
     * Parses a class expression: collects public members,
     * including inherited members from base classes.
     */
    protected parseClass(node: ts.ClassExpression | ts.ClassDeclaration): Record<string, MemberSignature> {
        let members: Record<string, MemberSignature> = {};
        // inherit from base class(es)

        if (node.heritageClauses) {
            for (const clause of node.heritageClauses) {
                if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
                    for (const typeNode of clause.types) {
                        const expr = typeNode.expression;

                        if (ts.isIdentifier(expr)) {
                            Object.assign(members, this.parseFileClass(expr.text));
                        }
                    }
                }
            }
        }

        // own members
        for (const member of node.members) {
            // Parameter properties in constructor: include only when extracting a specific property
            if (ts.isConstructorDeclaration(member)) {
                // include public parameter properties: e.g. constructor(public foo: string)
                for (const param of member.parameters) {
                    const mods = ts.getCombinedModifierFlags(param);

                    if (mods & ts.ModifierFlags.Public) {
                        const name = ts.isIdentifier(param.name)
                            ? param.name.text
                            : param.name.getText();
                        const type = param.type ? param.type.getText() : 'any';
                        members[name] = {kind: 'property', type};
                    }
                }

                continue;
            }

            // only public instance members (skip private, protected, or static members)
            const flags = ts.getCombinedModifierFlags(member);

            if (flags & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected | ts.ModifierFlags.Static)) {
                continue;
            }

            // determine member name
            const name = member.name && ts.isIdentifier(member.name)
                ? member.name.text
                : member.name
                    ? member.name.getText()
                    : '';

            if (!name) continue;

            if (ts.isMethodDeclaration(member) || ts.isGetAccessorDeclaration(member)) {
                members[name] = this.getMethodSignature(member as ts.MethodDeclaration);
            } else if (ts.isPropertyDeclaration(member)) {
                const type = member.type ? member.type.getText() : 'any';
                members[name] = {kind: 'property', type};
            }
        }

        return members;
    }

    /**
     * Finds and parses a class by name in current or imported files.
     */
    private parseFileClass(name: string): Record<string, MemberSignature> {
        // current file
        const decl = this.findClassDeclaration(name);

        if (decl) {
            return this.parseClass(decl);
        }

        // imported file
        const importPath = this.getImports().get(name);

        if (importPath) {
            const parser = (this.constructor as typeof ExpressionFile).make(importPath);
            const sf = parser.getSourceFile();

            // Try named class export
            let found: ts.ClassDeclaration | undefined;
            const find = (node: ts.Node) => {
                if (ts.isClassDeclaration(node) && node.name?.text === name) {
                    found = node;
                } else {
                    ts.forEachChild(node, find);
                }
            };

            ts.forEachChild(sf, find);

            if (found) {
                return parser.parseClass(found);
            }

            // Try default exported anonymous class
            let defaultClass: ts.ClassDeclaration | undefined;

            const findDefault = (node: ts.Node) => {
                if (ts.isClassDeclaration(node)
                    && node.modifiers
                    && node.modifiers.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)) {
                    defaultClass = node;
                } else {
                    ts.forEachChild(node, findDefault);
                }
            };

            ts.forEachChild(sf, findDefault);

            if (defaultClass) {
                return parser.parseClass(defaultClass);
            }
        }

        return {};
    }

    /**
     * Searches the AST of this file for a class declaration by name.
     */
    private findClassDeclaration(name: string): ts.ClassDeclaration | undefined {
        const sf = this.getSourceFile();

        let found: ts.ClassDeclaration | undefined;

        const visit = (node: ts.Node) => {
            if (ts.isClassDeclaration(node) && node.name?.text === name) {
                found = node;
            } else {
                ts.forEachChild(node, visit);
            }
        };

        ts.forEachChild(sf, visit);

        return found;
    }

    /**
     * Searches the AST of this file for a type alias declaration by name.
     */
    private findTypeAliasDeclaration(name: string): ts.TypeAliasDeclaration | undefined {
        const sf = this.getSourceFile();

        let found: ts.TypeAliasDeclaration | undefined;

        const visit = (node: ts.Node) => {
            if (ts.isTypeAliasDeclaration(node) && node.name.text === name) {
                found = node;
            } else {
                ts.forEachChild(node, visit);
            }
        };

        ts.forEachChild(sf, visit);

        return found;
    }
    
    /**
     * Searches the AST of this file for an interface declaration by name.
     */
    private findInterfaceDeclaration(name: string): ts.InterfaceDeclaration | undefined {
        const sf = this.getSourceFile();

        let found: ts.InterfaceDeclaration | undefined;
        const visit = (node: ts.Node) => {
            if (ts.isInterfaceDeclaration(node) && node.name.text === name) {
                found = node;
            } else {
                ts.forEachChild(node, visit);
            }
        };

        ts.forEachChild(sf, visit);

        return found;
    }

    /**
     * Searches the AST of this file for a variable declaration by name.
     */
    private findVariableDeclaration(name: string): ts.VariableDeclaration | undefined {
        const sf = this.getSourceFile();

        let found: ts.VariableDeclaration | undefined;

        const visit = (node: ts.Node) => {
            if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name) {
                found = node;
            } else {
                ts.forEachChild(node, visit);
            }
        };

        ts.forEachChild(sf, visit);

        return found;
    }

    /**
     * Attempts to inline a type alias by name, resolving imported or local aliases.
     */
    private inlineAliasType(name: string): string | undefined {
        // local type alias
        const local = this.findTypeAliasDeclaration(name);

        if (local) {
            const typeNode = local.type;
            // handle intersection type alias by flattening members
            if (ts.isIntersectionTypeNode(typeNode)) {
                const parts: string[] = [];
                const seen = new Set<string>();
                for (const t of typeNode.types) {
                    // inline object literal types
                    if (ts.isTypeLiteralNode(t)) {
                        for (const m of t.members) {
                            let keyName: string;
                            let entry: string;
                            if (ts.isPropertySignature(m) && m.type) {
                                keyName = this.getName(m.name!);
                                const typeText = this.resolveTypeNode(m.type);
                                entry = `${keyName}: ${typeText}`;
                            } else if (ts.isMethodSignature(m) && m.name) {
                                keyName = this.getName(m.name);
                                const typeParams = m.typeParameters ? m.typeParameters.map(tp => tp.getText()) : [];
                                const tpText = typeParams.length ? `<${typeParams.join(',')}>` : '';
                                const paramsText = m.parameters.map(p => {
                                    const pname = ts.isIdentifier(p.name) ? p.name.text : p.name.getText();
                                    const ptype = p.type ? this.resolveTypeNode(p.type) : 'any';
                                    return `${pname}: ${ptype}`;
                                }).join(',');
                                const returnType = m.type ? this.resolveTypeNode(m.type) : 'any';
                                entry = `${keyName}${tpText}(${paramsText}): ${returnType}`;
                            } else {
                                continue;
                            }
                            if (!seen.has(keyName)) {
                                seen.add(keyName);
                                parts.push(entry);
                            }
                        }
                    }
                    // inline referenced aliases or interfaces
                    else if (ts.isTypeReferenceNode(t) && ts.isIdentifier(t.typeName)) {
                        const refName = t.typeName.text;
                        const sub = this.inlineAliasType(refName);
                        if (sub) {
                            const inner = sub.slice(1, -1).trim();
                            if (inner) {
                                // split on top-level semicolons (ignore semicolons within braces)
                                const segments: string[] = [];
                                let depth = 0;
                                let buf = '';
                                for (const ch of inner) {
                                    if (ch === '{') { depth++; buf += ch; }
                                    else if (ch === '}') { depth--; buf += ch; }
                                    else if (ch === ';' && depth === 0) {
                                        const seg = buf.trim();
                                        if (seg) segments.push(seg);
                                        buf = '';
                                    } else {
                                        buf += ch;
                                    }
                                }
                                const last = buf.trim();
                                if (last) segments.push(last);
                                for (const s of segments) {
                                    const keyName = s.split(/[:(]/)[0];
                                    if (!seen.has(keyName)) {
                                        seen.add(keyName);
                                        parts.push(s);
                                    }
                                }
                            }
                        }
                    }
                }
                return `{${parts.join('; ')};}`;
            }
            return this.resolveTypeNode(typeNode);
        }

        // local interface
        const localInterface = this.findInterfaceDeclaration(name);

        if (localInterface) {
            const props: string[] = [];
            // include inherited members from extended interfaces
            if (localInterface.heritageClauses) {
                for (const clause of localInterface.heritageClauses) {
                    if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
                        for (const typeNode of clause.types) {
                            const expr = typeNode.expression;
                            if (ts.isIdentifier(expr)) {
                                const parent = this.inlineAliasType(expr.text);
                                if (parent) {
                                    const inner = parent.slice(1, -1).trim();
                                    if (inner) {
                                        props.push(...inner.split(/;\s*/).map(s => s.trim()).filter(Boolean));
                                    }
                                }
                            }
                        }
                    }
                }
            }
            for (const member of localInterface.members) {
                if (ts.isPropertySignature(member) && member.type) {
                    const key = this.getName(member.name!);
                    const optional = member.questionToken ? '?' : '';
                    const typeText = this.resolveTypeNode(member.type);
                    props.push(`${key}${optional}: ${typeText}`);
                } else if (ts.isMethodSignature(member) && member.name) {
                    const key = this.getName(member.name);
                    const typeParams = member.typeParameters ? member.typeParameters.map(tp => tp.getText()) : [];
                    const tpText = typeParams.length ? `<${typeParams.join(',')}>` : '';

                    const params = member.parameters.map(p => {
                        const pname = ts.isIdentifier(p.name) ? p.name.text : p.name.getText();
                        const ptype = p.type ? this.resolveTypeNode(p.type) : 'any';
                        return `${pname}: ${ptype}`;
                    }).join(', ');

                    const returnType = member.type ? this.resolveTypeNode(member.type) : 'any';

                    props.push(`${key}${tpText}(${params}): ${returnType}`);
                }
            }
            return `{${props.join('; ')};}`;
        }

        const importPath = this.getImports().get(name);

        if (importPath) {
            const parser = (this.constructor as typeof ExpressionFile).make(importPath);

            // imported type alias
            const aliasDecl = parser.findTypeAliasDeclaration(name);

            if (aliasDecl) {
                // inline imported type alias (including intersections)
                return parser.inlineAliasType(name);
            }

            // imported interface
            const interfaceDecl = parser.findInterfaceDeclaration(name);

            if (interfaceDecl) {
                const props: string[] = [];
                // include inherited members from extended interfaces
                if (interfaceDecl.heritageClauses) {
                    for (const clause of interfaceDecl.heritageClauses) {
                        if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
                            for (const typeNode of clause.types) {
                                const expr = typeNode.expression;
                                if (ts.isIdentifier(expr)) {
                                    const parent = parser.inlineAliasType(expr.text);
                                    if (parent) {
                                        const inner = parent.slice(1, -1).trim();
                                        if (inner) {
                                            props.push(...inner.split(/;\s*/).map(s => s.trim()).filter(Boolean));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                for (const member of interfaceDecl.members) {
                    if (ts.isPropertySignature(member) && member.type) {
                        const key = parser.getName(member.name!);
                        const optional = member.questionToken ? '?' : '';
                        const typeText = parser.resolveTypeNode(member.type);
                        props.push(`${key}${optional}: ${typeText}`);
                    } else if (ts.isMethodSignature(member) && member.name) {
                        const key = parser.getName(member.name);
                        const typeParams = member.typeParameters ? member.typeParameters.map(tp => tp.getText()) : [];
                        const tpText = typeParams.length ? `<${typeParams.join(',')}>` : '';

                    const params = member.parameters.map(p => {
                            const pname = ts.isIdentifier(p.name) ? p.name.text : p.name.getText();
                            const ptype = p.type ? parser.resolveTypeNode(p.type) : 'any';
                            return `${pname}: ${ptype}`;
                    }).join(', ');

                        const returnType = member.type ? parser.resolveTypeNode(member.type) : 'any';

                        props.push(`${key}${tpText}(${params}): ${returnType}`);
                    }
                }
                return `{${props.join('; ')};}`;
            }
        }

        return undefined;
    }

    /**
     * Resolves a TypeScript type node to a string, inlining type aliases when possible.
     */
    private resolveTypeNode(typeNode: ts.TypeNode): string {
        // inline type aliases
        if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
            const aliasName = typeNode.typeName.text;
            const inlined = this.inlineAliasType(aliasName);

            if (inlined) {
                return inlined;
            }

            // preserve generics and other references
            return typeNode.getText();
        }

        // fallback: use textual representation
        return typeNode.getText();
    }

    /**
     * Builds a method signature from a function-like node.
     */
    private getMethodSignature(method: ts.MethodDeclaration | ts.GetAccessorDeclaration | ts.FunctionExpression | ts.ArrowFunction): MethodSignature {
        // parameters
        const params: ParameterSignature[] = ('parameters' in method ? method.parameters : []).map(p => {
            const name = ts.isIdentifier(p.name) ? p.name.text : p.name.getText();
            const type = p.type ? p.type.getText() : 'any';
            return {name, type};
        });

        // generic type parameters
        const typeParams: string[] = method.typeParameters
            ? method.typeParameters.map(tp => tp.getText())
            : [];

        // return type (inline aliases when possible)
        const returnNode = (method as ts.MethodDeclaration).type;

        const returnType = returnNode
            ? this.resolveTypeNode(returnNode)
            : 'any';

        return {
            kind: 'method',
            typeParameters: typeParams,
            parameters: params,
            returnType,
        };
    }

    /**
     * Interprets a literal expression to a coarse type string.
     */
    private inferTypeFromExpression(expr: ts.Expression): string {
        const val = this.parseNode(expr);

        switch (typeof val) {
            case 'string':
                return 'string';
            case 'number':
                return 'number';
            case 'boolean':
                return 'boolean';
            case 'object':
                if (val === null) return 'null';
                if (Array.isArray(val)) return 'array';
                return 'object';
            default:
                return 'any';
        }
    }

    /**
     * Extracts a textual property name.
     */
    private getName(name: ts.PropertyName | ts.BindingName | ts.Node): string {
        if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
            return name.text;
        }

        return name.getText();
    }

    /**
     * Specify wrapper functions whose first argument should be unwrapped for parsing.
     */
    public setDefinition(definition: string | string[]): this {
        const defs = typeof definition === 'string' ? [definition] : definition;

        defs.forEach(def => this.definition.add(def));

        return this;
    }

    /**
     * Recursively unwraps type assertions, satisfies, parentheses, and allowed wrapper calls.
     */
    private unwrapExpression(expr: ts.Expression): ts.Expression {
        // remove `as` and `satisfies` assertions, parentheses
        if (ts.isAsExpression(expr) || ts.isSatisfiesExpression(expr) || ts.isParenthesizedExpression(expr)) {
            return this.unwrapExpression(expr.expression as ts.Expression);
        }

        // unwrap calls to known definition wrappers, validating import source
        if (ts.isCallExpression(expr) && ts.isIdentifier(expr.expression)) {
            const fnName = expr.expression.text;

            if (this.definition.has(fnName)) {
                let importPath: string | undefined;

                try {
                    importPath = this.getImports().get(fnName);
                } catch {
                    // unable to resolve import source -> ignore wrapper
                    return expr;
                }

                if (importPath !== PackageName) {
                    console.warn(`Function ${fnName} is not imported from '${PackageName}' in file ${this.file}`);

                } else if (expr.arguments.length > 0) {
                    const first = expr.arguments[0];
                    return this.unwrapExpression(first as ts.Expression);
                }
            }
        }

        return expr;
    }

    /**
     * Formats a full members map into an interface-like string.
     */
    private formatMembers(members: Record<string, MemberSignature>): string {
        const parts = Object.entries(members).map(([key, sig]) => {
            if (sig.kind === 'method') {
                const tp = sig.typeParameters.length ? `<${sig.typeParameters.join(', ')}>` : '';
                const params = sig.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
                return `${key}${tp}(${params}): ${sig.returnType};`;
            }
            return `${key}: ${sig.type};`;
        });
        return `{ ${parts.join(' ')} }`;
    }

    /**
     * Builds a function type string from a MethodSignature (parameters and return type).
     */
    private buildFunctionType(sig: MethodSignature): string {
        const tp = sig.typeParameters.length ? `<${sig.typeParameters.join(', ')}>` : '';

        const params = sig.parameters.map(p => `${p.name}: ${p.type}`).join(', ');

        return `${tp}(${params}) => ${sig.returnType}`;
    }

    /**
     * Given an initializer or expression, extracts its type: function signature or interface.
     */
    private getTypeFromInitializer(node: ts.Expression | ts.MethodDeclaration | ts.GetAccessorDeclaration): string | undefined {
        // Function or arrow function: try to parse returned object or instance
        if (ts.isFunctionExpression(node) || ts.isArrowFunction(node)) {
            // attempt to parse returned expression into members
            const members = this.parseFunction(node as ts.FunctionExpression | ts.ArrowFunction);

            if (members) {
                return this.formatMembers(members);
            }

            // fallback to function signature
            const sig = this.getMethodSignature(node as ts.FunctionExpression | ts.ArrowFunction);

            return this.buildFunctionType(sig);
        }

        // Class or method-like: signature of accessor/method
        if (ts.isMethodDeclaration(node) || ts.isGetAccessorDeclaration(node)) {
            const sig = this.getMethodSignature(node as ts.MethodDeclaration);
            return this.buildFunctionType(sig);
        }

        // Object literal, class expression/declaration, or new expression: return interface of members
        let members: Record<string, MemberSignature> | undefined;

        if (ts.isObjectLiteralExpression(node) || ts.isClassExpression(node) || ts.isClassDeclaration(node)) {
            members = this.parse(node as ts.Expression);
        } else if (ts.isNewExpression(node)) {
            const ctor = node.expression;

            if (ts.isIdentifier(ctor)) {
                members = this.parseFileClass(ctor.text);
            } else if (ts.isClassExpression(ctor)) {
                members = this.parseClass(ctor);
            }
        }

        if (members) {
            return this.formatMembers(members);
        }

        // For literals or other expressions, infer a simple type
        if (ts.isLiteralExpression(node) || ts.isArrayLiteralExpression(node) || ts.isObjectLiteralExpression(node)) {
            return this.inferTypeFromExpression(node as ts.Expression);
        }

        // Fallback: undefined
        return undefined;
    }
}