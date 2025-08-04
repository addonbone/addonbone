export const shouldIncludeMember = (name: string): boolean => {
    return !name.startsWith('_');
};