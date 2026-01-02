// File: src/i18n.js
// Copyright (c) 2025 DefoAI UG (haftungsbeschränkt)
//
// Internationalization configuration using i18next with browser language detection.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
    // i18next-http-backend
    // loads translations from your server
    // https://github.com/i18next/i18next-http-backend
    .use(Backend)
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languagedetector
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        debug: false, // Disable debug for production
        fallbackLng: 'en',
        lng: 'en', // Explicitly set language to 'en'
        returnNull: false, // Return key if translation is missing instead of null
        returnEmptyString: false, // Return key if translation is empty
        // Preload languages on initialization
        preload: ['en'],
        // Load all namespaces on init
        ns: ['translation'],
        defaultNS: 'translation',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        backend: {
            loadPath: '/locales/{{lng}}/translation.json',
        },
        react: {
            useSuspense: false, // Don't use Suspense - let components handle loading
            bindI18n: 'languageChanged loaded', // Re-render on language change and when resources are loaded
            bindI18nStore: 'added removed', // Re-render when resources are added/removed
        },
    });

export default i18n;
