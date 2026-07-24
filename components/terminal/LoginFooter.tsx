import React from 'react';
import { useLocale } from '../../context/LocaleContext.tsx';

/** Login footer — no second logo; copyright only. */
const LoginFooter: React.FC = () => {
  const { t } = useLocale();
  return (
    <footer className="login-badge-enter mt-8 text-center text-[11px] text-zinc-600 normal-case">
      {t('login.footerCopyright', { year: new Date().getFullYear() })}
    </footer>
  );
};

export default LoginFooter;
