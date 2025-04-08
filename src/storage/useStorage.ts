import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {StorageProvider} from '@typing/storage'

import {Storage} from "./Storage";

interface UseStorageOptions<T> {
    key: string;
    storage?: StorageProvider;
    defaultValue?: T;
}

type UseStorageReturnValue<T> = [T | undefined, (value: T) => void, (key: string) => void];

function useStorage<T>(options: UseStorageOptions<T>): UseStorageReturnValue<T>;
function useStorage<T>(key: string, defaultValue?: T): UseStorageReturnValue<T>
function useStorage<T>(arg1: string | UseStorageOptions<T>, arg2?: T): UseStorageReturnValue<T> {
    const isObject = typeof arg1 === "object";
    const key = isObject ? arg1.key : arg1;
    const storageRef = useRef(isObject ? arg1.storage ?? Storage.Local() : Storage.Local());
    const defaultValue = useMemo(() => isObject ? arg1.defaultValue : arg2, [arg1, arg2]);
    const isRemovedRef = useRef(false);

    const [value, setValue] = useState<T | undefined>(undefined);

    const fetchValue = useCallback((): void => {
        storageRef.current.get<T>(key)
            .then((value) => setValue(value ?? (isRemovedRef.current ? undefined : defaultValue)))
            .catch((e) => console.error('useStorage get storage value error', e));
    }, [])

    useEffect(() => {
        fetchValue()

        const unsubscribe = storageRef.current.watch({
            [key]: (newValue) => setValue(newValue),
        });

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

    const removeValue = useCallback((key: string) => {
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
