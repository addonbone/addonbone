import Builder from "./Builder";

import {createEntryResolver} from "../utils/entry";

export * from "./resolvers";

export default createEntryResolver(Builder);