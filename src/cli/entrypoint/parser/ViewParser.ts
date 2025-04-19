import {z} from "zod";

import AbstractParser from "./AbstractParser";

import {ViewEntrypointOptions} from "@typing/view";

export default abstract class<O extends ViewEntrypointOptions> extends AbstractParser<O> {
    protected HtmlTypeStringSchema = z.enum(['css', 'js']);
    protected HtmlAttributesObjectSchema = z.record(z.string(), z.union([z.string(), z.boolean(), z.number()]));

    protected HtmlAddHashFunctionSchema = z.function()
        .args(z.string(), z.string())
        .returns(z.string());

    protected HtmlAddPublicPathFunctionSchema = z.function()
        .args(z.string(), z.string())
        .returns(z.string());

    protected HtmlCommonOptionsSchema = z.object({
        append: z.boolean().optional(),
        useHash: z.boolean().optional(),
        addHash: this.HtmlAddHashFunctionSchema.optional(),
        hash: z.union([z.boolean(), z.string(), this.HtmlAddHashFunctionSchema]).optional(),
        usePublicPath: z.boolean().optional(),
        addPublicPath: this.HtmlAddPublicPathFunctionSchema.optional(),
        publicPath: z.union([z.boolean(), z.string(), this.HtmlAddPublicPathFunctionSchema]).optional(),
    });

    protected HtmlExternalObjectSchema = z.object({
        packageName: z.string(),
        variableName: z.string(),
    });

    protected HtmlBaseTagOptionsSchema = this.HtmlCommonOptionsSchema.extend({
        glob: z.string().optional(),
        globPath: z.string().optional(),
        globFlatten: z.boolean().optional(),
        sourcePath: z.string().optional(),
    });

    protected HtmlLinkTagOptionsSchema = this.HtmlBaseTagOptionsSchema.extend({
        path: z.string(),
        attributes: this.HtmlAttributesObjectSchema.optional(),
    });

    protected HtmlScriptTagOptionsSchema = this.HtmlBaseTagOptionsSchema.extend({
        path: z.string(),
        attributes: this.HtmlAttributesObjectSchema.optional(),
        external: this.HtmlExternalObjectSchema.optional(),
    });

    protected HtmlMaybeLinkTagOptionsSchema = this.HtmlLinkTagOptionsSchema.extend({
        type: this.HtmlTypeStringSchema.optional(),
    });

    protected HtmlMaybeScriptTagOptionsSchema = this.HtmlScriptTagOptionsSchema.extend({
        type: this.HtmlTypeStringSchema.optional(),
    });

    protected HtmlMetaTagOptionsSchema = this.HtmlBaseTagOptionsSchema.extend({
        path: z.string().optional(),
        attributes: this.HtmlAttributesObjectSchema,
    });

    protected HtmlOptionsSchema = this.HtmlCommonOptionsSchema.extend({
        append: z.boolean().optional(),
        prependExternals: z.boolean().optional(),
        jsExtensions: z.union([z.string(), z.array(z.string())]).optional(),
        cssExtensions: z.union([z.string(), z.array(z.string())]).optional(),
        tags: z.union([
            z.string(),
            this.HtmlMaybeLinkTagOptionsSchema,
            this.HtmlMaybeScriptTagOptionsSchema,
            z.array(z.union([z.string(), this.HtmlMaybeLinkTagOptionsSchema, this.HtmlMaybeScriptTagOptionsSchema]))
        ]).optional(),
        links: z.union([
            z.string(),
            this.HtmlLinkTagOptionsSchema,
            z.array(z.union([z.string(), this.HtmlLinkTagOptionsSchema]))
        ]).optional(),
        scripts: z.union([
            z.string(),
            this.HtmlScriptTagOptionsSchema,
            z.array(z.union([z.string(), this.HtmlScriptTagOptionsSchema]))
        ]).optional(),
        metas: z.union([
            z.string(),
            this.HtmlMetaTagOptionsSchema,
            z.array(z.union([z.string(), this.HtmlMetaTagOptionsSchema]))
        ]).optional(),
    });

    protected schema(): typeof this.CommonPropertiesSchema {
        return this.CommonPropertiesSchema.merge(this.HtmlOptionsSchema).extend({
            title: z.string().nonempty().optional(),
            template: z.string().nonempty().optional(),
        });
    }
}