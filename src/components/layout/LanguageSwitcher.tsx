'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';

export const LanguageSwitcher = () => {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const toggleLanguage = () => {
    const nextLocale = locale === 'id' ? 'en' : 'id';
    
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- any params is fine
        { pathname, params },
        { locale: nextLocale }
      );
    });
  };

  return (
    <button
      onClick={toggleLanguage}
      disabled={isPending}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-all duration-200 text-sm font-medium border border-border disabled:opacity-50"
      aria-label="Toggle language"
    >
      <span className={locale === 'id' ? 'font-bold text-primary' : 'text-muted-foreground'}>
        ID
      </span>
      <span className="w-px h-3 bg-border" />
      <span className={locale === 'en' ? 'font-bold text-primary' : 'text-muted-foreground'}>
        EN
      </span>
      {isPending && (
        <span className="ml-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}
    </button>
  );
};
