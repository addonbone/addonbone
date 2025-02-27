import {z} from "zod";
import {
    ConfigDefinitionSchema,
    ConfigSchema,
    OptionalConfigSchema,
    ReadonlyConfigSchema,
    UserConfigSchema
} from "@typing/schema";

export type Config = z.infer<typeof ConfigSchema>;
export type OptionalConfig = z.infer<typeof OptionalConfigSchema>;
export type UserConfig = z.infer<typeof UserConfigSchema>;
export type ReadonlyConfig = z.infer<typeof ReadonlyConfigSchema>;
export type ConfigDefinition = z.infer<typeof ConfigDefinitionSchema>;

