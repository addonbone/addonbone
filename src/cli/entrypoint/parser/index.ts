import {z} from "zod";

export {default as BackgroundParser} from "./BackgroundParser";
export {default as CommandParser} from "./CommandParser";

import {OptionFile} from "./drivers";

import {modifyLocaleMessageKey} from "@locale/utils";

import {BackgroundEntrypointOptions} from "@typing/background";
import {CommandEntrypointOptions} from "@typing/command";
import {Browser} from "@typing/browser";
import {EntrypointFile} from "@typing/entrypoint";
import {ContentScriptEntrypointOptions} from "@typing/content";
import {PageEntrypointOptions} from "@typing/page";

const HtmlTypeStringSchema = z.enum(['css', 'js']);
const HtmlAttributesObjectSchema = z.record(z.string(), z.union([z.string(), z.boolean(), z.number()]));

const HtmlAddHashFunctionSchema = z.function()
    .args(z.string(), z.string())
    .returns(z.string());

const HtmlAddPublicPathFunctionSchema = z.function()
    .args(z.string(), z.string())
    .returns(z.string());

const HtmlCommonOptionsSchema = z.object({
    append: z.boolean().optional(),
    useHash: z.boolean().optional(),
    addHash: HtmlAddHashFunctionSchema.optional(),
    hash: z.union([z.boolean(), z.string(), HtmlAddHashFunctionSchema]).optional(),
    usePublicPath: z.boolean().optional(),
    addPublicPath: HtmlAddPublicPathFunctionSchema.optional(),
    publicPath: z.union([z.boolean(), z.string(), HtmlAddPublicPathFunctionSchema]).optional(),
});

const HtmlExternalObjectSchema = z.object({
    packageName: z.string(),
    variableName: z.string(),
});

const HtmlBaseTagOptionsSchema = HtmlCommonOptionsSchema.extend({
    glob: z.string().optional(),
    globPath: z.string().optional(),
    globFlatten: z.boolean().optional(),
    sourcePath: z.string().optional(),
});

const HtmlLinkTagOptionsSchema = HtmlBaseTagOptionsSchema.extend({
    path: z.string(),
    attributes: HtmlAttributesObjectSchema.optional(),
});

const HtmlScriptTagOptionsSchema = HtmlBaseTagOptionsSchema.extend({
    path: z.string(),
    attributes: HtmlAttributesObjectSchema.optional(),
    external: HtmlExternalObjectSchema.optional(),
});

const HtmlMaybeLinkTagOptionsSchema = HtmlLinkTagOptionsSchema.extend({
    type: HtmlTypeStringSchema.optional(),
});

const HtmlMaybeScriptTagOptionsSchema = HtmlScriptTagOptionsSchema.extend({
    type: HtmlTypeStringSchema.optional(),
});

const HtmlMetaTagOptionsSchema = HtmlBaseTagOptionsSchema.extend({
    path: z.string().optional(),
    attributes: HtmlAttributesObjectSchema,
});

const HtmlOptionsSchema = HtmlCommonOptionsSchema.extend({
    append: z.boolean().optional(),
    prependExternals: z.boolean().optional(),
    jsExtensions: z.union([z.string(), z.array(z.string())]).optional(),
    cssExtensions: z.union([z.string(), z.array(z.string())]).optional(),
    tags: z.union([
        z.string(),
        HtmlMaybeLinkTagOptionsSchema,
        HtmlMaybeScriptTagOptionsSchema,
        z.array(z.union([z.string(), HtmlMaybeLinkTagOptionsSchema, HtmlMaybeScriptTagOptionsSchema]))
    ]).optional(),
    links: z.union([
        z.string(),
        HtmlLinkTagOptionsSchema,
        z.array(z.union([z.string(), HtmlLinkTagOptionsSchema]))
    ]).optional(),
    scripts: z.union([
        z.string(),
        HtmlScriptTagOptionsSchema,
        z.array(z.union([z.string(), HtmlScriptTagOptionsSchema]))
    ]).optional(),
    metas: z.union([
        z.string(),
        HtmlMetaTagOptionsSchema,
        z.array(z.union([z.string(), HtmlMetaTagOptionsSchema]))
    ]).optional(),
});

const CommonPropertiesSchema = z.object({
    includeApp: z.array(z.string()).optional(),
    excludeApp: z.array(z.string()).optional(),
    includeBrowser: z.array(z.nativeEnum(Browser)).optional(),
    excludeBrowser: z.array(z.nativeEnum(Browser)).optional(),
});

const ViewPropertiesSchema = CommonPropertiesSchema.merge(HtmlOptionsSchema).extend({
    title: z.string().nonempty().optional(),
    template: z.string().nonempty().optional(),
});

const parseOptions = <T extends typeof CommonPropertiesSchema, R extends Record<string, any>>(
    file: EntrypointFile,
    schema: T,
    definition: string | string[]
): R => {
    const options = OptionFile.make(file.file)
        .setProperties(Object.keys(schema.shape))
        .setDefinition(definition)
        .getOptions();

    const {success, error, data} = schema.safeParse(options);

    if (!success) {
        const e = error?.errors[0];

        if (e) {
            throw new Error(`Invalid options ${e.path.join(', ')} in "${file.file}": ${e.message}`);
        } else {
            throw new Error(`Invalid options in "${file.file}"`);
        }
    }

    return (data || {}) as R;
}

export const getBackgroundOptions = (file: EntrypointFile): BackgroundEntrypointOptions => {
    const BackgroundPropertiesSchema = CommonPropertiesSchema.extend({
        persistent: z.boolean().optional(),
    });

    return parseOptions(file, BackgroundPropertiesSchema, 'defineBackground');
}

export const getCommandOptions = (file: EntrypointFile): CommandEntrypointOptions => {
    const ShortcutKeySchema = z
        .string()
        .regex(/^(Ctrl|Command|MacCtrl|Alt|Option)(\+Shift)?\+[A-Z0-9]$/, 'Invalid shortcut key, expected format like: Ctrl+Shift+K or Command+Shift+P')
        .optional();

    const CommandPropertiesSchema = CommonPropertiesSchema.extend({
        name: z.string().nonempty().optional(),
        description: z.string().nonempty().optional(),
        global: z.boolean().optional(),
        defaultKey: ShortcutKeySchema,
        windowsKey: ShortcutKeySchema,
        macKey: ShortcutKeySchema,
        chromeosKey: ShortcutKeySchema,
        linuxKey: ShortcutKeySchema,
    });

    const options = parseOptions(file, CommandPropertiesSchema, ['defineCommand', 'defineExecuteActionCommand']);

    return {
        ...options,
        description: modifyLocaleMessageKey(options.description),
    };
}

export const getContentScriptOptions = (file: EntrypointFile): ContentScriptEntrypointOptions => {
    const ContentScriptPropertiesSchema = CommonPropertiesSchema.extend({
        matches: z.array(z.string()).optional(),
        excludeMatches: z.array(z.string()).optional(),
        matchAboutBlank: z.boolean().optional(),
        includeGlobs: z.array(z.string()).optional(),
        excludeGlobs: z.array(z.string()).optional(),
        allFrames: z.boolean().optional(),
        world: z.enum(['isolated', 'normal']).optional(),
        runAt: z.enum(['document_start', 'document_end', 'document_idle']).optional(),
        matchOriginAsFallback: z.boolean().optional(),
    });

    return parseOptions(file, ContentScriptPropertiesSchema, ['defineContentScript', 'defineContentScriptAppend']);
}

export const getPageOptions = (file: EntrypointFile): PageEntrypointOptions => {
    const PagePropertiesSchema = ViewPropertiesSchema.extend({
        name: z.string().nonempty().optional(),
    });

    const options = parseOptions(file, PagePropertiesSchema, 'definePage');

    return {
        ...options,
        title: modifyLocaleMessageKey(options.title),
    };
}