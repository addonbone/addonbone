import ts from "typescript";

import SourceFile from "../SourceFile";
import AbstractParser from "./AbstractParser";
import TypeResolver from "./TypeResolver";
import SignatureBuilder from "./SignatureBuilder";
import NodeFinder from "./NodeFinder";
import JSDocParser from "./JSDocParser";

import {MemberSignature} from "./types";

/**
 * Parses class expressions and declarations.
 */
export default class ClassParser extends AbstractParser {
    /**
     * Constructor for the ClassParser.
     *
     * @param sourceFile The source file to parse
     * @param typeResolver The type resolver to use for resolving types
     * @param signatureBuilder The signature builder to use for building signatures
     * @param nodeFinder The node finder to use for finding nodes
     */
    private readonly jsDocParser: JSDocParser;

    constructor(
        sourceFile: SourceFile,
        private readonly typeResolver: TypeResolver,
        private readonly signatureBuilder: SignatureBuilder,
        private readonly nodeFinder: NodeFinder
    ) {
        super(sourceFile);

        this.jsDocParser = new JSDocParser();
    }

    /**
     * Parses a class expression or declaration: collects public members,
     * including inherited members from base classes.
     *
     * @param node The class expression or declaration to parse
     * @returns A record of member signatures
     */
    public parse(node: ts.ClassExpression | ts.ClassDeclaration): Record<string, MemberSignature> {
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
                        const name = ts.isIdentifier(param.name) ? param.name.text : param.name.getText();
                        const type = param.type ? param.type.getText() : "any";
                        members[name] = {kind: "property", type};
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
            const name =
                member.name && ts.isIdentifier(member.name)
                    ? member.name.text
                    : member.name
                      ? member.name.getText()
                      : "";

            if (!name) continue;

            if (ts.isMethodDeclaration(member) || ts.isGetAccessorDeclaration(member)) {
                members[name] = this.signatureBuilder.getMethodSignature(member as ts.MethodDeclaration);
            } else if (ts.isPropertyDeclaration(member)) {
                // Check for JSDoc @type annotation
                const jsDocType = this.jsDocParser.getJSDocType(member);
                const tsType = member.type ? this.typeResolver.resolveTypeNode(member.type) : "any";
                const type = jsDocType || tsType;
                const optional = member.questionToken !== undefined;
                members[name] = {kind: "property", type, optional};
            }
        }

        return members;
    }

    /**
     * Finds and parses a class by name in current or imported files.
     *
     * @param name The name of the class to find
     * @returns A record of member signatures
     */
    public parseFileClass(name: string): Record<string, MemberSignature> {
        // current file
        const decl = this.nodeFinder.findClassDeclaration(name);

        if (decl) {
            return this.parse(decl);
        }

        // imported file
        const importPath = this.sourceFile.getImports().get(name);

        if (importPath) {
            const parser = (this.sourceFile.constructor as typeof SourceFile).make(importPath);
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
                // Create a new ClassParser for the imported file
                const typeResolver = new TypeResolver(parser);
                const nodeFinder = new NodeFinder(parser);
                const signatureBuilder = new SignatureBuilder(typeResolver);
                const classParser = new ClassParser(parser, typeResolver, signatureBuilder, nodeFinder);
                return classParser.parse(found);
            }

            // Try default exported anonymous class
            let defaultClass: ts.ClassDeclaration | undefined;

            const findDefault = (node: ts.Node) => {
                if (
                    ts.isClassDeclaration(node) &&
                    node.modifiers &&
                    node.modifiers.some(m => m.kind === ts.SyntaxKind.DefaultKeyword)
                ) {
                    defaultClass = node;
                } else {
                    ts.forEachChild(node, findDefault);
                }
            };

            ts.forEachChild(sf, findDefault);

            if (defaultClass) {
                // Create a new ClassParser for the imported file
                const typeResolver = new TypeResolver(parser);
                const nodeFinder = new NodeFinder(parser);
                const signatureBuilder = new SignatureBuilder(typeResolver);
                const classParser = new ClassParser(parser, typeResolver, signatureBuilder, nodeFinder);
                return classParser.parse(defaultClass);
            }
        }

        return {};
    }
}
