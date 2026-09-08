import ts from "typescript";
import path from "path";
import {isContentScriptFrameNavigation, validateContentScriptIsolation} from "@shared/content";
import z from "zod";

import AbstractParser from "./AbstractParser";
import {TsResolver, type OptionFile} from "../file";

import {
    ContentScriptDeclarative,
    ContentScriptEntrypointOptions,
    ContentScriptMarker,
    ContentScriptMatches,
    ContentScriptWorld,
} from "@typing/content";
import {EntrypointFile, EntrypointOptions} from "@typing/entrypoint";

export default class<O extends EntrypointOptions = ContentScriptEntrypointOptions> extends AbstractParser<O> {
    protected definition(): string | string[] {
        return ["defineContentScript", "defineContentScriptAppend"];
    }

    protected schema(): z.AnyZodObject {
        return this.CommonPropertiesSchema.extend({
            matches: z.array(z.string()).optional(),
            excludeMatches: z.array(z.string()).optional(),
            matchAboutBlank: z.boolean().optional(),
            includeGlobs: z.array(z.string()).optional(),
            excludeGlobs: z.array(z.string()).optional(),
            allFrames: z.boolean().optional(),
            world: z.nativeEnum(ContentScriptWorld).optional(),
            runAt: z.enum(["document_start", "document_end", "document_idle"]).optional(),
            matchOriginAsFallback: z.boolean().optional(),
            declarative: z.union([z.nativeEnum(ContentScriptDeclarative), z.boolean()]).optional(),
            marker: z.union([z.nativeEnum(ContentScriptMarker), z.boolean()]).optional(),
            isolation: z.enum(["none", "shadow", "iframe"]).optional(),
            frame: z
                .object({
                    page: z.string().optional(),
                    src: z.string().optional(),
                    width: z.union([z.number(), z.string()]).optional(),
                    height: z.union([z.number(), z.string()]).optional(),
                })
                .strict()
                .optional(),
        });
    }

    public options(file: EntrypointFile): O {
        if ("isolation" in this.schema().shape) {
            const optionFile = this.optionFile(file);
            const declared = optionFile.getDeclaredProperties();
            const values = optionFile.getOptions();
            try {
                if (
                    declared.has("isolation") &&
                    !optionFile.isStaticValue(optionFile.getPropertyExpression("isolation"))
                )
                    throw new Error("isolation must be statically known");
                if (declared.has("frame") && values.frame === undefined)
                    throw new Error("frame must be a statically known object");
                const frame = optionFile.getPropertyExpression("frame");
                if (frame) {
                    if (
                        !ts.isObjectLiteralExpression(frame) ||
                        frame.properties.some(
                            property =>
                                !ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)
                        )
                    ) {
                        throw new Error(
                            "frame must be an explicit object without spreads or methods so its page/src variant can be determined during the build"
                        );
                    }
                    for (const property of frame.properties) {
                        if (!property.name || ts.isComputedPropertyName(property.name))
                            throw new Error("frame keys must be statically known");
                        const key = property.name.getText().replace(/^["']|["']$/g, "");
                        const initializer = ts.isPropertyAssignment(property) ? property.initializer : property.name;
                        if (
                            (key === "page" || key === "src") &&
                            (!optionFile.isStaticValue(initializer) || typeof values.frame?.[key] !== "string")
                        ) {
                            throw new Error(`frame.${key} must be a statically known string`);
                        }
                    }
                }
                const hasRender =
                    declared.has("render") ||
                    (isContentScriptFrameNavigation(values.frame) && this.hasDefaultRender(file, optionFile));
                validateContentScriptIsolation(values.isolation, values.frame, hasRender);
            } catch (error) {
                throw new Error(
                    `Invalid content isolation in "${file.file}": ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }

        const options = super.options(file);

        return {
            matches: ContentScriptMatches,
            runAt: "document_idle",
            ...options,
        };
    }

    /** Only needed for frame navigation: normal UI entries do not pay for default-export type resolution. */
    protected hasDefaultRender(file: EntrypointFile, optionFile: OptionFile<Record<string, any>>): boolean {
        const source = optionFile.getSourceFile();
        const declaration = source.statements.find(
            statement =>
                (ts.isExportAssignment(statement) && !statement.isExportEquals) ||
                (ts.canHaveModifiers(statement) &&
                    ts.getModifiers(statement)?.some(modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword)) ||
                (ts.isExportDeclaration(statement) &&
                    !statement.isTypeOnly &&
                    statement.exportClause &&
                    ts.isNamedExports(statement.exportClause) &&
                    statement.exportClause.elements.some(item => !item.isTypeOnly && item.name.text === "default"))
        );
        if (!declaration) return false;
        if (ts.isFunctionDeclaration(declaration) || ts.isClassDeclaration(declaration)) return true;

        if (ts.isExportAssignment(declaration)) {
            let expression = declaration.expression;
            while (
                ts.isParenthesizedExpression(expression) ||
                ts.isAsExpression(expression) ||
                ts.isSatisfiesExpression(expression) ||
                ts.isTypeAssertionExpression(expression) ||
                ts.isNonNullExpression(expression)
            ) {
                expression = expression.expression;
            }
            if (
                ts.isArrowFunction(expression) ||
                ts.isFunctionExpression(expression) ||
                ts.isClassExpression(expression) ||
                ts.isJsxElement(expression) ||
                ts.isJsxSelfClosingElement(expression) ||
                ts.isJsxFragment(expression)
            )
                return true;
            if (ts.isObjectLiteralExpression(expression)) return optionFile.getDeclaredProperties().has("$$typeof");
            if (optionFile.getDefinition()) return false;
        }

        // Resolve aliases/imported components without assuming every identifier is a render value.
        // This program is local to this check; watch rebuilds never reuse a stale export type.
        const options = TsResolver.make(path.resolve(this.config.rootDir, "tsconfig.json")).getConfig().options;
        const program = ts.createProgram([file.file], {...options, noEmit: true});
        const entry = program.getSourceFile(file.file);
        if (!entry) return false;
        const checker = program.getTypeChecker();
        const module = checker.getSymbolAtLocation(entry);
        const exported = module && checker.getExportsOfModule(module).find(symbol => symbol.name === "default");
        if (!exported) return false;
        const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
        const type = checker.getTypeOfSymbolAtLocation(symbol, entry);
        return (
            type.getCallSignatures().length > 0 ||
            type.getConstructSignatures().length > 0 ||
            type.getProperty("$$typeof") !== undefined ||
            (type.isStringLiteral() ? type.value.length > 0 : (type.flags & ts.TypeFlags.StringLike) !== 0) ||
            (type.flags & ts.TypeFlags.NumberLike) !== 0
        );
    }
}
