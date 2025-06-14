import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Імпорт перекладів
import enTranslations from './locales/en/translations.json';
import ukTranslations from './locales/uk/translations.json';

i18n.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		fallbackLng: 'uk',
		debug: process.env.NODE_ENV !== 'production',
		interpolation: {
			escapeValue: false
		},
		resources: {
			en: {
				translation: enTranslations
			},
			uk: {
				translation: ukTranslations
			}
		}
	});

export default i18n;
