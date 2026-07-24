import React from 'react';
import { useLocale } from '../../context/LocaleContext.tsx';
import {
  APP_LOCALES,
  LOCALE_NATIVE_NAMES,
  type AppLocale,
} from '../../i18n/types.ts';

interface LanguageSelectorProps {
  /** Visual density for login vs shell header. */
  variant?: 'login' | 'shell' | 'more';
  className?: string;
  id?: string;
}

/**
 * Persistent language control — English / Español / Bosanski.
 * Native names are not translated (always shown as English, Español, Bosanski).
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'shell',
  className = '',
  id = 'elm-language-selector',
}) => {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className={`elm-lang-selector elm-lang-selector--${variant} ${className}`.trim()}
      data-testid="language-selector"
    >
      <label htmlFor={id} className="elm-lang-selector-label">
        {t('common.language')}
      </label>
      <select
        id={id}
        className="elm-lang-selector-control"
        value={locale}
        aria-label={t('common.selectLanguage')}
        onChange={(e) => setLocale(e.target.value as AppLocale)}
      >
        {APP_LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_NATIVE_NAMES[code]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
