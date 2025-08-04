/**
 * Utility class for filtering member names based on various criteria.
 */
export default class MemberFilter {
    /**
     * Checks if a member name should be included in the generated types.
     *
     * @param name The name of the member to check
     * @returns true if the member should be included, false otherwise
     */
    public static shouldIncludeMember(name: string): boolean {
        // Exclude members that start with an underscore
        if (name.startsWith('_')) {
            return false;
        }

        return true;
    }
}