import ts from "typescript";

/**
 * Parses JSDoc comments to extract type information.
 */
export default class JSDocParser {
    /**
     * Extracts a type from a JSDoc tag with @type annotation.
     *
     * @param node The node to extract JSDoc type from
     * @returns The extracted type or undefined if no JSDoc type is found
     */
    public getJSDocType(node: ts.Node): string | undefined {
        const jsDocTags = this.getJSDocTags(node);

        // Look for @type tag
        for (const tag of jsDocTags) {
            if (ts.isJSDocTypeTag(tag) && tag.typeExpression) {
                return this.parseJSDocTypeExpression(tag.typeExpression);
            }
        }

        return undefined;
    }

    /**
     * Extracts parameter types from JSDoc @param annotations.
     *
     * @param node The function-like node to extract parameter types from
     * @returns A map of parameter names to their JSDoc types
     */
    public getJSDocParameterTypes(node: ts.SignatureDeclaration): Map<string, string> {
        const result = new Map<string, string>();
        const nestedParams = new Map<string, Map<string, string>>();
        const jsDocTags = this.getJSDocTags(node);

        // Get custom type definitions
        const typeDefinitions = this.getJSDocTypeDefinitions(node);

        // First pass: collect all parameters and their types
        for (const tag of jsDocTags) {
            if (ts.isJSDocParameterTag(tag) && tag.typeExpression && tag.name) {
                // Extract just the parameter name without any JSDoc comments
                let paramName = tag.name.getText();

                // Clean up the parameter name to remove any JSDoc comments
                // This handles both regular parameters and nested parameters like options.method
                const match = paramName.match(/(\w+)(?:\.(\w+))?/);
                if (match) {
                    if (match[2]) {
                        // This is a nested parameter like options.method
                        const parentParam = match[1];
                        const childProp = match[2];

                        // Create or update the nested parameter map
                        if (!nestedParams.has(parentParam)) {
                            nestedParams.set(parentParam, new Map<string, string>());
                        }

                        let paramType = this.parseJSDocTypeExpression(tag.typeExpression);

                        // Check if the parameter type is a custom type definition
                        if (typeDefinitions.has(paramType)) {
                            paramType = typeDefinitions.get(paramType)!;
                        }

                        nestedParams.get(parentParam)!.set(childProp, paramType);
                    } else {
                        // This is a regular parameter
                        paramName = match[1];

                        // If this parameter already has nested properties, don't override it
                        if (!nestedParams.has(paramName)) {
                            let paramType = this.parseJSDocTypeExpression(tag.typeExpression);

                            // Check if the parameter type is a custom type definition
                            if (typeDefinitions.has(paramType)) {
                                paramType = typeDefinitions.get(paramType)!;
                            }

                            result.set(paramName, paramType);
                        }
                    }
                }
            }
        }

        // Second pass: build object types for nested parameters
        for (const [parentParam, childParams] of nestedParams.entries()) {
            const properties: string[] = [];

            for (const [childProp, childType] of childParams.entries()) {
                properties.push(`${childProp}: ${childType}`);
            }

            // Create the object type
            result.set(parentParam, `{${properties.join("; ")};}`);
        }

        return result;
    }

    /**
     * Extracts the return type from a JSDoc @returns annotation.
     *
     * @param node The function-like node to extract return type from
     * @returns The extracted return type or undefined if no JSDoc return type is found
     */
    public getJSDocReturnType(node: ts.SignatureDeclaration): string | undefined {
        const jsDocTags = this.getJSDocTags(node);

        // Look for @returns tag
        for (const tag of jsDocTags) {
            if (ts.isJSDocReturnTag(tag) && tag.typeExpression) {
                return this.parseJSDocTypeExpression(tag.typeExpression);
            }
        }

        return undefined;
    }

    /**
     * Gets all JSDoc tags for a node.
     *
     * @param node The node to get JSDoc tags for
     * @returns An array of JSDoc tags
     */
    private getJSDocTags(node: ts.Node): ts.JSDocTag[] {
        const jsDocTags: ts.JSDocTag[] = [];

        // Get all JSDoc comments attached to the node
        const jsDocComments = ts.getJSDocTags(node);
        if (jsDocComments) {
            jsDocTags.push(...jsDocComments);
        }

        return jsDocTags;
    }

    /**
     * Extracts type parameters from JSDoc @template annotations.
     *
     * @param node The function-like node to extract type parameters from
     * @returns An array of type parameter names
     */
    public getJSDocTypeParameters(node: ts.SignatureDeclaration): string[] {
        const result: string[] = [];
        const jsDocTags = this.getJSDocTags(node);

        // Look for @template tags
        for (const tag of jsDocTags) {
            if (ts.isJSDocTemplateTag(tag) && tag.typeParameters) {
                // Iterate through each type parameter and extract its name
                for (const typeParam of tag.typeParameters) {
                    if (typeParam.name) {
                        const typeName = typeParam.name.getText();
                        result.push(typeName);
                    }
                }
            }
        }

        return result;
    }

    /**
     * Extracts custom type definitions from JSDoc @typedef annotations.
     *
     * @param node The node to extract custom type definitions from
     * @returns A map of type names to their definitions
     */
    public getJSDocTypeDefinitions(node: ts.Node): Map<string, string> {
        const result = new Map<string, string>();
        const jsDocTags = this.getJSDocTags(node);

        // Look for @typedef tags
        for (const tag of jsDocTags) {
            if (ts.isJSDocTypedefTag(tag) && tag.name && tag.typeExpression) {
                const typeName = tag.name.getText();
                const typeExpression = this.parseJSDocTypeExpression(tag.typeExpression);

                // Store the type definition
                result.set(typeName, typeExpression);
            }
        }

        // Look for @property tags to build object type definitions
        const typedefProperties = new Map<string, Map<string, string>>();

        for (const tag of jsDocTags) {
            if (ts.isJSDocPropertyTag(tag) && tag.name && tag.typeExpression) {
                // The property tag should be associated with a typedef
                const comment = tag.parent?.getText() || "";
                const typedefMatch = comment.match(/@typedef\s+\{[^}]+\}\s+(\w+)/);

                if (typedefMatch) {
                    const typedefName = typedefMatch[1];
                    const propName = tag.name.getText();
                    const propType = this.parseJSDocTypeExpression(tag.typeExpression);
                    const isOptional = tag.isBracketed || comment.includes(`[${propName}]`);

                    // Create or update the property map for this typedef
                    if (!typedefProperties.has(typedefName)) {
                        typedefProperties.set(typedefName, new Map<string, string>());
                    }

                    // Add the property to the map
                    typedefProperties
                        .get(typedefName)!
                        .set(propName, `${propName}${isOptional ? "?" : ""}: ${propType}`);
                }
            }
        }

        // Build object type definitions from properties
        for (const [typedefName, properties] of typedefProperties.entries()) {
            const props = Array.from(properties.values());
            if (props.length > 0) {
                result.set(typedefName, `{ ${props.join("; ")}; }`);
            }
        }

        return result;
    }

    /**
     * Parses a JSDoc type expression into a string representation.
     *
     * @param typeExpression The JSDoc type expression to parse
     * @returns The parsed type as a string
     */
    private parseJSDocTypeExpression(typeExpression: ts.JSDocTypeExpression | ts.JSDocTypeLiteral): string {
        // Handle JSDocTypeLiteral
        if (ts.isJSDocTypeLiteral(typeExpression)) {
            // For JSDocTypeLiteral, we need to build a type string from its properties
            if (typeExpression.jsDocPropertyTags && typeExpression.jsDocPropertyTags.length > 0) {
                const props = typeExpression.jsDocPropertyTags.map(tag => {
                    const name = tag.name.getText();
                    const type = tag.typeExpression ? this.parseJSDocTypeExpression(tag.typeExpression) : "any";
                    const optional = tag.isBracketed;
                    return `${name}${optional ? "?" : ""}: ${type}`;
                });
                return `{ ${props.join("; ")}; }`;
            }
            // If it's an array type, return array of any
            if (typeExpression.isArrayType) {
                return "any[]";
            }
            // Default to any for empty type literals
            return "any";
        }

        // Extract the type from the JSDoc type expression (for JSDocTypeExpression)
        const typeNode = typeExpression.type;

        // Check if typeNode is undefined
        if (!typeNode) {
            return "any";
        }

        // Simple approach: extract the text directly from the JSDoc comment
        // This handles most common JSDoc type formats
        const text = typeNode.getText();

        // Handle special cases for common JSDoc types
        if (text === "*") {
            return "any";
        }

        // Handle array types (e.g., string[])
        if (text.endsWith("[]")) {
            return text;
        }

        // Handle object types (e.g., {foo: string, bar: number})
        if (text.startsWith("{") && text.endsWith("}")) {
            return this.formatObjectType(text);
        }

        // Handle union types (e.g., string|number)
        if (text.includes("|")) {
            return text;
        }

        // Handle function types (e.g., function(string): number)
        if (text.includes("function(")) {
            return text;
        }

        // Handle generic types (e.g., Array<string>, Promise<Object>)
        if (text.includes("<") && text.includes(">")) {
            // Extract the type name and arguments
            const typeName = text.substring(0, text.indexOf("<"));
            const typeArgs = text.substring(text.indexOf("<") + 1, text.lastIndexOf(">"));

            // Check if the type arguments contain an object type
            if (typeArgs.includes("{") && typeArgs.includes("}")) {
                // Format the object type in the type arguments
                const formattedTypeArgs = this.formatNestedTypes(typeArgs);
                return `${typeName}<${formattedTypeArgs}>`;
            }

            return `${typeName}<${typeArgs}>`;
        }

        // For simple types, just return the text
        return text;
    }

    /**
     * Formats an object type string to match the expected format.
     *
     * @param objectType The object type string to format
     * @returns The formatted object type string
     */
    private formatObjectType(objectType: string): string {
        // Remove the braces and get the content
        const content = objectType.substring(1, objectType.length - 1).trim();

        // Split by commas, but only at the top level (not inside nested objects)
        const properties: string[] = [];
        let depth = 0;
        let currentProp = "";

        for (let i = 0; i < content.length; i++) {
            const char = content[i];

            if (char === "{") {
                depth++;
                currentProp += char;
            } else if (char === "}") {
                depth--;
                currentProp += char;
            } else if (char === "," && depth === 0) {
                properties.push(currentProp.trim());
                currentProp = "";
            } else {
                currentProp += char;
            }
        }

        if (currentProp.trim()) {
            properties.push(currentProp.trim());
        }

        // Process each property to handle nested objects
        const formattedProperties = properties.map(prop => {
            const colonIndex = prop.indexOf(":");
            if (colonIndex === -1) return prop;

            const propName = prop.substring(0, colonIndex).trim();
            let propType = prop.substring(colonIndex + 1).trim();

            // If the property type is an object, format it recursively
            if (propType.startsWith("{") && propType.endsWith("}")) {
                propType = this.formatObjectType(propType);
            }

            return `${propName}: ${propType}`;
        });

        // Join properties with semicolons
        return `{ ${formattedProperties.join("; ")}; }`;
    }

    /**
     * Formats nested types in a type string.
     *
     * @param typeString The type string to format
     * @returns The formatted type string
     */
    private formatNestedTypes(typeString: string): string {
        // Check if the type string contains an object type
        if (typeString.includes("{") && typeString.includes("}")) {
            // Find all object types in the type string
            let result = typeString;
            let startIndex = result.indexOf("{");

            while (startIndex !== -1) {
                // Find the matching closing brace
                let depth = 1;
                let endIndex = startIndex + 1;

                while (depth > 0 && endIndex < result.length) {
                    if (result[endIndex] === "{") {
                        depth++;
                    } else if (result[endIndex] === "}") {
                        depth--;
                    }
                    endIndex++;
                }

                if (depth === 0) {
                    // Extract the object type
                    const objectType = result.substring(startIndex, endIndex);
                    // Format the object type
                    const formattedObjectType = this.formatObjectType(objectType);
                    // Replace the object type in the result
                    result = result.substring(0, startIndex) + formattedObjectType + result.substring(endIndex);
                    // Find the next object type
                    startIndex = result.indexOf("{", startIndex + formattedObjectType.length);
                } else {
                    // No matching closing brace found, break the loop
                    break;
                }
            }

            return result;
        }

        return typeString;
    }

    /**
     * Adds a property to an object type string.
     *
     * @param objectType The object type string to add the property to
     * @param propertyName The name of the property to add
     * @param propertyType The type of the property to add
     * @returns The updated object type string
     */
    private addPropertyToObjectType(objectType: string, propertyName: string, propertyType: string): string {
        // Remove the braces and split by semicolons
        const content = objectType.substring(1, objectType.length - 1).trim();
        const properties = content
            ? content
                  .split(";")
                  .map(p => p.trim())
                  .filter(Boolean)
            : [];

        // Check if the property already exists
        const propIndex = properties.findIndex(p => p.startsWith(`${propertyName}:`));

        if (propIndex >= 0) {
            // Update the existing property
            properties[propIndex] = `${propertyName}: ${propertyType}`;
        } else {
            // Add the new property
            properties.push(`${propertyName}: ${propertyType}`);
        }

        // Reconstruct the object type
        return `{ ${properties.join("; ")}; }`;
    }
}
