export const RelayWindowKey = '__relay';

export type RelayType = ((...args: any[]) => Promise<any>) | { [key: string]: any | RelayType };
