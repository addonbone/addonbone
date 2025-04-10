import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {StorageProvider, StorageWatchOptions} from '@typing/storage'

import {Storage} from "./Storage";

interface UseStorageOptions<T> {
    key: string;
    storage?: StorageProvider<Record<string, any>>;
    defaultValue?: T;
}

type UseStorageReturnValue<T> = [T | undefined, (value: T) => void, () => void];

function useStorage<T = any>(options: UseStorageOptions<T>): UseStorageReturnValue<T>;
function useStorage<T = any>(key: string, defaultValue?: T): UseStorageReturnValue<T>
function useStorage<T = any>(arg1: string | UseStorageOptions<T>, arg2?: T): UseStorageReturnValue<T> {
    const isObject = typeof arg1 === "object";
    const key = isObject ? arg1.key : arg1;
    const storageRef = useRef(isObject ? arg1.storage ?? Storage.Local<Record<string, T>>() : Storage.Local<Record<string, T>>());
    const defaultValue = useMemo(() => isObject ? arg1.defaultValue : arg2, [arg1, arg2]);

    const [value, setValue] = useState<T | undefined>(undefined);

    const fetchValue = useCallback((): void => {
        storageRef.current.get(key)
            .then((storedValue) => setValue(storedValue ?? defaultValue))
            .catch((e) => console.error('useStorage get storage value error', e));
    }, [])

    useEffect(() => {
        fetchValue()

        const unsubscribe = storageRef.current.watch({
            [key]: (newValue: T | undefined) => setValue(newValue),
        } as unknown as StorageWatchOptions<Record<string, T>>);

        return () => unsubscribe();
    }, [key, storageRef, defaultValue]);

    const updateValue = useCallback((newValue: T) => {
        const prevValue = value;
        setValue(newValue);
        storageRef.current.set(key, newValue).catch((e) => {
            setValue(prevValue);
            console.error('useStorage set storage value error', e);
        });
    }, [key])

    const removeValue = useCallback(() => {
        storageRef.current.remove(key)
            .then(() => setValue(undefined))
            .catch((e) => console.error('useStorage remove storage value error', e));
    }, [key])


    return [value, updateValue, removeValue] as const;
}

export default useStorage;
