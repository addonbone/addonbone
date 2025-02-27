import {z} from "zod";
import _ from "lodash";
import {Configuration} from "webpack";

import {Command, Mode} from "@typing/app";
import {Browser} from "@typing/browser";
import {type ManifestBuilder} from "@typing/manifest";
import {type Plugin, type PluginHandlerCallback} from "@typing/plugin";

// Webpack
export const WebpackConfigSchema = z.object({}).passthrough() as z.ZodType<Configuration>;

export const OptionalWebpackConfigSchema = WebpackConfigSchema.optional();


// Manifest
export const ManifestBuilderSchema = z.custom<ManifestBuilder>((value) => {
    return (
        _.isObject(value) &&
        !_.isPlainObject(value) &&
        !_.isArray(value) &&
        !_.isNull(value) &&
        !_.isUndefined(value)
    );
});

export const ManifestVersionSchema = z.union([z.literal(2), z.literal(3)]);


// Entrypoint
export const EntrypointOptionsSchema = z.object({
    includeBrowser: z.array(z.nativeEnum(Browser)).optional(),
    excludeBrowser: z.array(z.nativeEnum(Browser)).optional(),
    includeApp: z.array(z.string()).optional(),
    excludeApp: z.array(z.string()).optional(),
});

export const EntrypointFileSchema = z.object({
    file: z.string(),
    import: z.string(),
    external: z.boolean().optional(),
});

// Plugin
const createPluginHandlerCallbackSchema = <O, T>(
    optionsSchema: z.ZodType<O>,
    returnSchema: z.ZodType<T>
) => {
    return z.function()
        .args(optionsSchema)
        .returns(z.union([returnSchema, z.promise(returnSchema)])) as z.ZodType<PluginHandlerCallback<O, T>>;
}

const createPluginHandlerSchema = <O, T>(
    optionsSchema: z.ZodType<O>,
    returnSchema: z.ZodType<T>
) => {
    return z.union([
        z.undefined(),
        returnSchema,
        createPluginHandlerCallbackSchema(optionsSchema, returnSchema)
    ]);
}

export const PluginEntrypointResultSchema = z.union([
    z.literal(true),
    z.string(),
    z.array(z.string()),
    EntrypointFileSchema,
    z.array(EntrypointFileSchema),
    z.set(EntrypointFileSchema),
]);

export const PluginOptionsSchema = z.object({
    config: z.lazy(() => ReadonlyConfigSchema),
});

export const PluginManifestOptionsSchema = PluginOptionsSchema.extend({
    manifest: ManifestBuilderSchema,
});

export const PluginWebpackOptionsSchema = PluginOptionsSchema.extend({
    webpack: OptionalWebpackConfigSchema,
});

export const PluginSchema = z.object({
    name: z.string(),
    content: createPluginHandlerSchema(PluginOptionsSchema, PluginEntrypointResultSchema),
    background: createPluginHandlerSchema(PluginOptionsSchema, PluginEntrypointResultSchema),
    command: createPluginHandlerSchema(PluginOptionsSchema, PluginEntrypointResultSchema),
    webpack: createPluginHandlerSchema(PluginWebpackOptionsSchema, OptionalWebpackConfigSchema),
    manifest: createPluginHandlerSchema(PluginManifestOptionsSchema, z.void()),
});

// Config
export const ConfigSchema = z.object({
    debug: z.boolean(),
    command: z.nativeEnum(Command),
    mode: z.nativeEnum(Mode),
    app: z.string(),
    browser: z.nativeEnum(Browser),
    manifestVersion: ManifestVersionSchema,
    inputDir: z.string(),
    outputDir: z.string(),
    srcDir: z.string(),
    sharedDir: z.string(),
    appsDir: z.string(),
    jsDir: z.string(),
    cssDir: z.string(),
    assetsDir: z.string(),
    htmlDir: z.string(),
    plugins: z.array(z.object({name: z.string()}).passthrough() as z.ZodType<Plugin>),
    analyze: z.boolean(),
    configFile: z.string(),
    mergeBackground: z.boolean(),
    mergeCommands: z.boolean(),
    mergeContentScripts: z.boolean(),
    concatContentScripts: z.boolean(),
});


export const ReadonlyConfigSchema = ConfigSchema.readonly();
export const OptionalConfigSchema = ConfigSchema.partial();
export const UserConfigSchema = OptionalConfigSchema.omit({
    configFile: true,
    command: true
});

export const UserConfigCallbackSchema = z.function()
    .args(z.object({config: ReadonlyConfigSchema}))
    .returns(UserConfigSchema);

export const ConfigDefinitionSchema = z.union([
    UserConfigCallbackSchema,
    UserConfigSchema
]);

