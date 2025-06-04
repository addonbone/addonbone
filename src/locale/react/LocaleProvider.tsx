import React, {PropsWithChildren, useCallback, useEffect, useMemo, useState} from 'react';

import {useStorage} from "../../storage/react";

import {LocaleContext, LocaleContract} from './context';

import {getLocaleDir, isLocaleRtl} from "../utils";

import {DynamicLocale} from '../providers'

import {Language} from "@typing/locale";

type LocaleProviderProps = {
    storageKey?: string
}

const LocaleProvider = ({children, storageKey = 'locale'}: PropsWithChildren<LocaleProviderProps>) => {
    const [storageLocale, setStorageLocal] = useStorage<Language>(storageKey)

    const locale = useMemo(() => new DynamicLocale(), [])

    const [lang, setLang] = useState<Language>(locale.lang())

    const _: LocaleContract['_'] = useCallback((key, substitutions): string => {
        return locale.trans(key, substitutions);
    }, []);

    const choice: LocaleContract['choice'] = useCallback((key, count, substitutions): string => {
        return locale.choice(key, count, substitutions);
    }, []);

    const change: LocaleContract['change'] = useCallback((lang): void => {
        locale.change(lang)
            .then(() => {
                setLang(lang)
                setStorageLocal(lang)
            })
            .catch((err) => console.error(`Cannot find locale file for "${lang}" language`, err));
    }, []);

    useEffect(() => {
        const html = document.querySelector('html');

        html?.setAttribute('lang', lang);
        html?.setAttribute('dir', getLocaleDir(lang));
    }, [lang]);

    useEffect(() => {
        storageLocale && storageLocale !== lang && change(storageLocale)
    }, [storageLocale]);

    return (
        <LocaleContext.Provider value={{
            _,
            choice,
            change,
            lang,
            dir: getLocaleDir(lang),
            isRtl: isLocaleRtl(lang),
        }}>
            {children}
        </LocaleContext.Provider>
    );
};

export default LocaleProvider;
