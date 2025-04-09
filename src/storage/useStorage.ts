import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {StorageProvider, StorageState, StorageWatchOptions} from '@typing/storage'

import {Storage} from "./Storage";

interface UseStorageOptions<T extends StorageState> {
    key: keyof T;
    storage?: StorageProvider<T>;
    defaultValue?: T[keyof T];
}

type UseStorageReturnValue<T> = [T[keyof T] | undefined, (value: T[keyof T]) => void, (key: keyof T) => void];

function useStorage<T extends StorageState>(options: UseStorageOptions<T>): UseStorageReturnValue<T>;
function useStorage<T extends StorageState>(key: keyof T, defaultValue?: T[keyof T]): UseStorageReturnValue<T>
function useStorage<T extends StorageState>(arg1: keyof T | UseStorageOptions<T>, arg2?: T[keyof T]): UseStorageReturnValue<T> {
    const isObject = typeof arg1 === "object";
    const key = isObject ? arg1.key : arg1;
    const storageRef = useRef(isObject ? arg1.storage ?? new Storage<T>({area: "local"}) : new Storage<T>({area: "local"}));
    const defaultValue = useMemo(() => isObject ? arg1.defaultValue : arg2, [arg1, arg2]);
    const isRemovedRef = useRef(false);

    const [value, setValue] = useState<T[keyof T] | undefined>(undefined);

    const fetchValue = useCallback((): void => {
        storageRef.current.get(key)
            .then((value) => setValue(value ?? (isRemovedRef.current ? undefined : defaultValue)))
            .catch((e) => console.error('useStorage get storage value error', e));
    }, [])

    useEffect(() => {
        fetchValue()

        const unsubscribe = storageRef.current.watch({
            [key as keyof T]: (newValue: T[keyof T] | undefined) => setValue(newValue),
        } as unknown as StorageWatchOptions<T>);

        return () => unsubscribe();
    }, [key, storageRef, defaultValue]);

    const updateValue = useCallback((newValue: T[keyof T]) => {
        const prevValue = value;
        setValue(newValue);
        storageRef.current.set(key, newValue).catch((e) => {
            setValue(prevValue);
            console.error('useStorage set storage value error', e);
        });
    }, [key])

    const removeValue = useCallback((key: keyof T) => {
        storageRef.current.remove(key)
            .then(() => {
                setValue(undefined);
                isRemovedRef.current = true;
            })
            .catch((e) => console.error('useStorage remove storage value error', e));
    }, [key])


    return [value, updateValue, removeValue] as const;
}

export default useStorage;
