import ':package';

declare module ':package' {
    export type IconName = string;

    export function changeActionIcon(icon?: IconName, tab?: number | Tab): Promise<void>;
}